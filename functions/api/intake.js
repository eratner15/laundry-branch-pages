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

async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'no RESEND_API_KEY' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'laundry service <alerts@cafecito-ai.com>', to, subject, html }),
  });
  return { ok: res.ok, status: res.status };
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Pricing logic (inline for intake)
function computeQuickQuote(business_type, message) {
  const sizeHints = message.match(/(\d+)\s*(unit|room|bed|employee|member|seat)/i);
  const count = sizeHints ? parseInt(sizeHints[1]) : 30;
  const rates = { hoa_condo: 8, hotel_resort: 12, spa_salon: 15, gym_fitness: 10, vacation_rental: 18, restaurant: 11 };
  const rate = rates[business_type] || 10;
  const weekly = Math.round(count * rate);
  return { weekly_mid: `$${weekly}`, monthly_mid: `$${weekly * 4}` };
}

async function classifyLead(env, { name, email, phone, business_type, business_name, message, source }) {
  const system = `You are a lead qualification specialist for a commercial laundry and linen rental service.
Analyze the lead information and return a JSON object with these exact fields:
{
  "lead_score": <integer 0-100>,
  "lead_tier": <"hot"|"warm"|"cool"|"cold">,
  "classification": <"qualified_lead"|"info_request"|"complaint"|"existing_customer"|"competitor"|"spam">,
  "services_likely": <array of likely services needed>,
  "estimated_size": <"micro"|"small"|"medium"|"large"|"enterprise">,
  "urgency_level": <"immediate"|"near_term"|"exploratory"|"unknown">,
  "negative_sentiment": <boolean>,
  "recommended_next_action": <string>,
  "notes": <string, 1 sentence>
}
Lead score guide: 80-100=ready to buy, 60-79=qualified & interested, 40-59=early stage, below 40=low priority.
Hot tier: score 70+. Warm: 50-69. Cool: 30-49. Cold: <30.`;

  return callClaudeJSON(env, system, `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'none'}\nBusiness type: ${business_type}\nBusiness name: ${business_name || 'unknown'}\nSource: ${source}\nMessage: ${message}`);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { name, email, phone, business_type, business_name, message, source = 'website_form' } = body;

    if (!name || !email) return new Response(JSON.stringify({ error: 'name and email required' }), { status: 400, headers });

    const id = uid();
    const timestamp = new Date().toISOString();

    // Classify the lead
    let classification = { lead_score: 50, lead_tier: 'warm', classification: 'info_request', negative_sentiment: false, recommended_next_action: 'Follow up within 24 hours' };
    try {
      classification = await classifyLead(env, { name, email, phone, business_type, business_name, message, source });
    } catch (e) {
      console.error('Claude classify error:', e.message);
    }

    // Store to KV
    const record = { id, timestamp, name, email, phone, business_type, business_name, message, source, classification };
    if (env.DATA) {
      await env.DATA.put(`lead:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 180 });

      // Update leads:recent
      let recent = [];
      try { recent = JSON.parse(await env.DATA.get('leads:recent') || '[]'); } catch {}
      recent.unshift({ id, timestamp, name, email, business_type, business_name, source, lead_score: classification.lead_score, lead_tier: classification.lead_tier });
      recent = recent.slice(0, 50);
      await env.DATA.put('leads:recent', JSON.stringify(recent));

      // Update metrics
      let metrics = {};
      try { metrics = JSON.parse(await env.DATA.get('metrics:leads') || '{}'); } catch {}
      metrics.total = (metrics.total || 0) + 1;
      metrics[classification.lead_tier] = (metrics[classification.lead_tier] || 0) + 1;
      metrics.last_updated = timestamp;
      await env.DATA.put('metrics:leads', JSON.stringify(metrics));
    }

    // Handle negative sentiment → trigger shield
    if (classification.negative_sentiment || classification.classification === 'complaint') {
      try {
        await fetch(new URL('/api/service-shield', request.url).href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'intake_form', content: message, customer_name: name, business: business_name, contact_info: { email, phone } }),
        });
      } catch {}
    }

    // Generate quick quote if enough info
    let quote_preview = null;
    if (business_type && message && classification.classification === 'qualified_lead') {
      quote_preview = computeQuickQuote(business_type, message);
    }

    const emailPromises = [];

    // Email 1: Customer response
    if (email && env.RESEND_API_KEY) {
      const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f7f3">
        <div style="background:#fff;padding:40px;border:1px solid #e8e3d8">
          <h2 style="font-family:Georgia,serif;font-weight:400;color:#1a1a18;margin-bottom:8px">We're on it, ${name.split(' ')[0]}.</h2>
          <p style="color:#7a7a70;font-size:15px;line-height:1.7;margin-bottom:24px">
            Thanks for reaching out. We've received your request and will be back with a custom quote within a few hours — evenings and weekends included.
          </p>
          ${quote_preview ? `<div style="background:#f9f7f3;padding:20px;margin-bottom:24px;border-left:3px solid #b87a4a">
            <p style="font-size:12px;color:#7a7a70;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em">Quick estimate</p>
            <p style="font-size:22px;font-weight:700;color:#1a1a18">${quote_preview.weekly_mid}/week</p>
            <p style="font-size:12px;color:#7a7a70">${quote_preview.monthly_mid}/month · A specialist will confirm</p>
          </div>` : ''}
          <div style="background:#f9f7f3;padding:20px;margin-bottom:24px">
            <p style="font-size:13px;color:#7a7a70;margin-bottom:4px">Your request</p>
            <p style="color:#1a1a18;font-size:14px">${message}</p>
          </div>
          <p style="color:#7a7a70;font-size:13px">
            Need to reach us directly? Call or text <a href="tel:+15138225130" style="color:#b87a4a">(513) 822-5130</a>.
          </p>
        </div>
        <p style="text-align:center;color:#b0aa9c;font-size:11px;margin-top:16px">laundry service · linen la vida loca.</p>
      </div>`;
      emailPromises.push(sendEmail(env, email, 'We received your request — laundry service', html));
    }

    // Email 2: Team alert
    if (env.ALERT_EMAIL && env.RESEND_API_KEY) {
      const tierColor = { hot: '#dc2626', warm: '#f59e0b', cool: '#3b82f6', cold: '#6b7280' };
      const color = tierColor[classification.lead_tier] || '#6b7280';
      const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="background:${color}22;border-left:4px solid ${color};padding:16px;margin-bottom:24px">
          <strong style="color:${color}">${classification.lead_tier.toUpperCase()} LEAD — Score: ${classification.lead_score}/100</strong>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0">${business_name || business_type || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Classification</td><td style="padding:8px 0">${classification.classification}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Urgency</td><td style="padding:8px 0">${classification.urgency_level || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Est. Size</td><td style="padding:8px 0">${classification.estimated_size || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Source</td><td style="padding:8px 0">${source}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Next Action</td><td style="padding:8px 0;font-weight:600">${classification.recommended_next_action}</td></tr>
          <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${message}</td></tr>
          ${quote_preview ? `<tr><td style="padding:8px 0;color:#666">Quick Quote</td><td style="padding:8px 0;font-weight:700;color:#b87a4a">${quote_preview.weekly_mid}/wk · ${quote_preview.monthly_mid}/mo</td></tr>` : ''}
        </table>
        <p style="margin-top:16px;color:#999;font-size:12px">Lead ID: ${id} · ${timestamp}</p>
      </div>`;
      emailPromises.push(sendEmail(env, env.ALERT_EMAIL, `${classification.lead_tier === 'hot' ? '🔥' : classification.lead_tier === 'warm' ? '⚡' : '📬'} New Lead: ${name} — ${classification.lead_tier} (${classification.lead_score})`, html));
    }

    await Promise.allSettled(emailPromises);

    return new Response(JSON.stringify({
      ok: true,
      id,
      status: 'received',
      lead_score: classification.lead_score,
      lead_tier: classification.lead_tier,
      classification: classification.classification,
      quote_preview,
      message: 'Request received. You will hear from us soon.',
    }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
