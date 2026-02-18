// Shared utilities
async function callClaude(env, system, user, maxTokens = 800) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const d = await res.json();
  return d.content[0].text;
}

async function callClaudeJSON(env, system, user) {
  const text = await callClaude(env, system, user, 1000);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in Claude response');
  return JSON.parse(match[0]);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Pricing model (baked in)
const PRICING = {
  base_per_employee: { hoa_condo: 8, hotel_resort: 12, spa_salon: 15, gym_fitness: 10, vacation_rental: 18, restaurant: 11, default: 10 },
  service_multipliers: { pool_towels: 1.0, bath_towels: 0.9, bed_linens: 1.3, restaurant_napkins: 0.7, kitchen_towels: 0.5, chef_coats: 1.1, spa_towels: 1.2, robes: 1.8, table_linens: 0.8 },
  location_factors: { miami: 1.15, cincinnati: 1.0, dallas: 1.05, default: 1.0 },
  size_brackets: [
    { max: 20, label: 'micro', discount: 1.1 },
    { max: 50, label: 'small', discount: 1.0 },
    { max: 150, label: 'medium', discount: 0.92 },
    { max: 500, label: 'large', discount: 0.85 },
    { max: Infinity, label: 'enterprise', discount: 0.78 },
  ],
  variance: 0.15, // ±15% for low/high range
};

function computeQuote(business_type, employee_count, services_needed, location) {
  const count = parseInt(employee_count) || 20;
  const baseRate = PRICING.base_per_employee[business_type] || PRICING.base_per_employee.default;
  const locFactor = PRICING.location_factors[location?.toLowerCase()] || PRICING.location_factors.default;
  const sizeBracket = PRICING.size_brackets.find(b => count <= b.max);
  const sizeDiscount = sizeBracket ? sizeBracket.discount : 0.78;

  const services = Array.isArray(services_needed) ? services_needed : (services_needed || '').split(',').map(s => s.trim()).filter(Boolean);
  const serviceMultiplier = services.length > 0
    ? services.reduce((sum, s) => sum + (PRICING.service_multipliers[s.toLowerCase().replace(/\s+/g, '_')] || 1.0), 0) / services.length
    : 1.0;

  const weeklyMid = Math.round(count * baseRate * locFactor * sizeDiscount * serviceMultiplier);
  const weeklyLow = Math.round(weeklyMid * (1 - PRICING.variance));
  const weeklyHigh = Math.round(weeklyMid * (1 + PRICING.variance));

  return {
    weekly: { low: weeklyLow, mid: weeklyMid, high: weeklyHigh },
    monthly: { low: weeklyLow * 4, mid: weeklyMid * 4, high: weeklyHigh * 4 },
    size_tier: sizeBracket?.label || 'medium',
    base_rate: baseRate,
    location_factor: locFactor,
  };
}

async function generateSmartQuote(env, params) {
  const { business_type, employee_count, services_needed, location, current_provider, additional_details } = params;

  const baseCalc = computeQuote(business_type, employee_count, services_needed, location);

  const system = `You are a quoting specialist for a commercial laundry and linen rental service.
Generate a detailed quote breakdown as JSON. Use the provided pricing baseline and create line items and context.
Respond with ONLY a JSON object — no markdown, no explanation.`;

  const user = `Business type: ${business_type || 'unknown'}
Employee/unit count: ${employee_count || 'unknown'}
Services needed: ${Array.isArray(services_needed) ? services_needed.join(', ') : services_needed || 'standard'}
Location: ${location || 'miami'}
Current provider: ${current_provider || 'none'}
Additional details: ${additional_details || 'none'}
Weekly pricing baseline: $${baseCalc.weekly.low}–$${baseCalc.weekly.high} (mid: $${baseCalc.weekly.mid})

Return JSON:
{
  "line_items": [{"service": string, "weekly_cost": number, "details": string}],
  "includes": [string],
  "comparison": {"vs_buying": string, "vs_competitor": string},
  "confidence": "high"|"medium"|"low",
  "confidence_reason": string,
  "next_steps": [string],
  "notes": string
}`;

  const aiDetails = await callClaudeJSON(env, system, user);

  return {
    estimate: {
      weekly_low: `$${baseCalc.weekly.low}`,
      weekly_mid: `$${baseCalc.weekly.mid}`,
      weekly_high: `$${baseCalc.weekly.high}`,
      monthly_low: `$${baseCalc.monthly.low}`,
      monthly_mid: `$${baseCalc.monthly.mid}`,
      monthly_high: `$${baseCalc.monthly.high}`,
      size_tier: baseCalc.size_tier,
    },
    line_items: aiDetails.line_items || [],
    includes: aiDetails.includes || ['Pickup & delivery', 'Washing & processing', 'Worn item replacement', 'Route management'],
    comparison: aiDetails.comparison || {},
    confidence: aiDetails.confidence || 'medium',
    confidence_reason: aiDetails.confidence_reason || 'Based on property type and size',
    next_steps: aiDetails.next_steps || ['Schedule a walkthrough', 'Confirm service area', 'Sign service agreement'],
    notes: aiDetails.notes || '',
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { business_type, employee_count, services_needed, location, current_provider, additional_details } = body;

    if (!business_type) return new Response(JSON.stringify({ error: 'business_type required' }), { status: 400, headers });

    const quote = await generateSmartQuote(env, { business_type, employee_count, services_needed, location, current_provider, additional_details });
    const id = uid();
    const timestamp = new Date().toISOString();

    const record = { id, timestamp, business_type, employee_count, location, quote };

    if (env.DATA) {
      await env.DATA.put(`quote:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });

      let recent = [];
      try { recent = JSON.parse(await env.DATA.get('quotes:recent') || '[]'); } catch {}
      recent.unshift({ id, timestamp, business_type, location, weekly_mid: quote.estimate.weekly_mid });
      recent = recent.slice(0, 20);
      await env.DATA.put('quotes:recent', JSON.stringify(recent));
    }

    return new Response(JSON.stringify({ ok: true, id, ...quote }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export { generateSmartQuote, computeQuote };
