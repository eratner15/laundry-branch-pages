// Shared utilities
async function callClaude(env, system, user, maxTokens = 600) {
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
  const text = await callClaude(env, system, user, 800);
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

async function analyzeWithShield(env, { source, content, customer_name, business, contact_info, metadata }) {
  const system = `You are a customer sentiment and complaint analysis system for a commercial laundry and linen rental service.
Analyze the provided customer interaction and return a JSON object with these exact fields:
{
  "sentiment": <1-10 integer, 1=extremely negative, 10=extremely positive>,
  "is_complaint": <boolean>,
  "complaint_categories": <array of strings from: ["delivery_timing","quality","billing","communication","driver_behavior","missing_items","wrong_items","service_failure","competitor_comparison","pricing"]>,
  "urgency": <"critical"|"elevated"|"normal"|"low">,
  "competitor_mentions": <array of competitor names mentioned, or []>,
  "churn_risk": <boolean, true if customer seems likely to leave>,
  "recommended_action": <string, specific action for ops team>,
  "summary": <string, 1-2 sentence summary>
}
Be precise and err on the side of flagging issues. Critical = immediate action needed (threat to leave, major service failure). Elevated = respond within 2 hours.`;

  return callClaudeJSON(env, system, `Source: ${source}\nBusiness: ${business || 'Unknown'}\nCustomer: ${customer_name || 'Unknown'}\nContent: ${content}`);
}

// ── GET: Account health dashboard data ──────────────────────────────────────

function getShieldAccounts() {
  const now = new Date();
  function hoursAgo(h) { return new Date(now.getTime() - h * 3600000).toISOString(); }
  function daysAgo_ss(d) { return new Date(now.getTime() - d * 86400000).toISOString(); }

const SHIELD_ACCOUNTS = [
  {
    id: 'trihealth-good-sam', name: 'TriHealth Good Samaritan Hospital', industry: 'medical',
    health_score: 28, health_tier: 'critical',
    last_contact_days: 14, open_complaints: 3, churn_risk: true, churn_probability: 0.71,
    assigned_rsr: 'Sandra K.', contract_value_annual: 78000,
    risk_factors: ['sizing_complaints', 'key_contact_changed', 'missed_delivery'],
    last_event: { timestamp: hoursAgo(38), type: 'complaint', summary: 'Wrong scrub sizes delivered for 3rd consecutive week (XS delivered, L ordered)', sentiment: 2, urgency: 'critical' },
  },
  {
    id: 'mason-medical-center', name: 'Mason Medical Center', industry: 'medical',
    health_score: 33, health_tier: 'critical',
    last_contact_days: 8, open_complaints: 2, churn_risk: true, churn_probability: 0.68,
    assigned_rsr: 'Carlos P.', contract_value_annual: 52000,
    risk_factors: ['delivery_delays', 'billing_dispute'],
    last_event: { timestamp: hoursAgo(52), type: 'complaint', summary: 'Missed Monday pickup — second occurrence in 30 days', sentiment: 2, urgency: 'critical' },
  },
  {
    id: 'fc-cincinnati', name: 'FC Cincinnati Training Facility', industry: 'fitness',
    health_score: 38, health_tier: 'critical',
    last_contact_days: 5, open_complaints: 2, churn_risk: false, churn_probability: 0.61,
    assigned_rsr: 'Mike T.', contract_value_annual: 64000,
    risk_factors: ['wrong_items', 'competitive_inquiry'],
    last_event: { timestamp: daysAgo_ss(3), type: 'complaint', summary: 'Wrong jersey sizes for 2nd week — Dana Loftus mentioned Cintas direct pricing', sentiment: 3, urgency: 'elevated' },
  },
  {
    id: 'procter-gamble-cafeteria', name: "P&G Campus Cafeteria (Mason)", industry: 'other',
    health_score: 51, health_tier: 'elevated',
    last_contact_days: 3, open_complaints: 0, churn_risk: false, churn_probability: 0.52,
    assigned_rsr: 'Carlos P.', contract_value_annual: 87000,
    risk_factors: ['contract_renewal_approaching'],
    last_event: { timestamp: daysAgo_ss(5), type: 'inquiry', summary: 'Don O\'Brien mentioned company-wide vendor audit — flagged for proactive outreach', sentiment: 6, urgency: 'normal' },
  },
  {
    id: 'kenwood-towne-marriott', name: 'Kenwood Towne Courtyard (Marriott)', industry: 'hospitality',
    health_score: 56, health_tier: 'elevated',
    last_contact_days: 7, open_complaints: 1, churn_risk: false, churn_probability: 0.47,
    assigned_rsr: 'Carlos P.', contract_value_annual: 56000,
    risk_factors: ['quality_complaints', 'reduced_order_volume'],
    last_event: { timestamp: daysAgo_ss(7), type: 'complaint', summary: 'GM Rachel Bloom noted towel pilling — quality concern, not yet formal complaint', sentiment: 5, urgency: 'normal' },
  },
  {
    id: 'orchids-palm-court', name: 'Orchids at Palm Court (Hilton)', industry: 'restaurant',
    health_score: 58, health_tier: 'elevated',
    last_contact_days: 4, open_complaints: 1, churn_risk: false, churn_probability: 0.41,
    assigned_rsr: 'Mike T.', contract_value_annual: 42000,
    risk_factors: ['quality_complaints', 'contract_renewal_approaching'],
    last_event: { timestamp: daysAgo_ss(4), type: 'complaint', summary: 'Linen quality complaint from Chef Reyes — contract renewal in 45 days', sentiment: 4, urgency: 'elevated' },
  },
  {
    id: 'uptown-fitness-clifton', name: 'Uptown Fitness Clifton', industry: 'fitness',
    health_score: 62, health_tier: 'elevated',
    last_contact_days: 14, open_complaints: 1, churn_risk: false, churn_probability: 0.44,
    assigned_rsr: 'Sandra K.', contract_value_annual: 28000,
    risk_factors: ['reduced_order_volume', 'competitive_inquiry'],
    last_event: { timestamp: daysAgo_ss(14), type: 'complaint', summary: 'Towel order volume dropped 15%; Chad Evans less responsive to calls', sentiment: 5, urgency: 'normal' },
  },
  {
    id: 'kroger-hq-cafe', name: 'Kroger HQ Campus Cafeteria', industry: 'other',
    health_score: 65, health_tier: 'monitor',
    last_contact_days: 10, open_complaints: 1, churn_risk: false, churn_probability: 0.28,
    assigned_rsr: 'Mike T.', contract_value_annual: 62000,
    risk_factors: ['delivery_delays'],
    last_event: { timestamp: daysAgo_ss(10), type: 'complaint', summary: 'Delivery timing complaint — no RSR follow-up documented', sentiment: 6, urgency: 'normal' },
  },
  {
    id: 'summit-hotel-blue-ash', name: 'The Summit Hotel (Blue Ash)', industry: 'hospitality',
    health_score: 66, health_tier: 'monitor',
    last_contact_days: 21, open_complaints: 1, churn_risk: false, churn_probability: 0.34,
    assigned_rsr: 'Carlos P.', contract_value_annual: 48000,
    risk_factors: ['billing_dispute'],
    last_event: { timestamp: daysAgo_ss(21), type: 'inquiry', summary: 'November billing discrepancy still unresolved — Carol Webb is tracking', sentiment: 5, urgency: 'normal' },
  },
  {
    id: 'yoga-district-clifton', name: 'Yoga District Clifton', industry: 'fitness',
    health_score: 68, health_tier: 'monitor',
    last_contact_days: 30, open_complaints: 1, churn_risk: false, churn_probability: 0.38,
    assigned_rsr: 'Sandra K.', contract_value_annual: 14000,
    risk_factors: ['competitive_inquiry'],
    last_event: { timestamp: daysAgo_ss(30), type: 'inquiry', summary: 'Sasha Park mentioned a Cintas competitor quote — renewal in 30 days', sentiment: 6, urgency: 'normal' },
  },
  {
    id: 'fifth-third-arena-catering', name: 'Fifth Third Arena (Catering Ops)', industry: 'other',
    health_score: 73, health_tier: 'monitor',
    last_contact_days: 3, open_complaints: 0, churn_risk: false, churn_probability: 0.22,
    assigned_rsr: 'Mike T.', contract_value_annual: 95000,
    risk_factors: ['key_contact_changed'],
    last_event: { timestamp: daysAgo_ss(3), type: 'positive', summary: 'New catering director introduced — relationship building in progress', sentiment: 7, urgency: 'low' },
  },
  {
    id: 'anderson-township-medical', name: 'Anderson Township Medical Group', industry: 'medical',
    health_score: 77, health_tier: 'monitor',
    last_contact_days: 5, open_complaints: 0, churn_risk: false, churn_probability: 0.15,
    assigned_rsr: 'Carlos P.', contract_value_annual: 31000,
    risk_factors: ['reduced_order_volume'],
    last_event: { timestamp: daysAgo_ss(5), type: 'positive', summary: 'Routine delivery confirmed — Lisa Barr noted minor count adjustment needed', sentiment: 8, urgency: 'low' },
  },
  {
    id: 'uc-health-univ-hospital', name: 'UC Health University Hospital', industry: 'medical',
    health_score: 82, health_tier: 'healthy',
    last_contact_days: 2, open_complaints: 0, churn_risk: false, churn_probability: 0.18,
    assigned_rsr: 'Sandra K.', contract_value_annual: 145000,
    risk_factors: [],
    last_event: { timestamp: daysAgo_ss(2), type: 'positive', summary: 'Delivery completed on time — supply chain team confirmed no issues', sentiment: 9, urgency: 'low' },
  },
  {
    id: 'blue-ash-sports-center', name: 'Blue Ash Sports Center', industry: 'fitness',
    health_score: 85, health_tier: 'healthy',
    last_contact_days: 3, open_complaints: 0, churn_risk: false, churn_probability: 0.09,
    assigned_rsr: 'Carlos P.', contract_value_annual: 37000,
    risk_factors: [],
    last_event: { timestamp: daysAgo_ss(3), type: 'positive', summary: 'Amanda Nguyen confirmed satisfaction with winter volume adjustment', sentiment: 9, urgency: 'low' },
  },
  {
    id: 'skyline-chili-corp', name: 'Skyline Chili (Corporate)', industry: 'restaurant',
    health_score: 88, health_tier: 'healthy',
    last_contact_days: 1, open_complaints: 0, churn_risk: false, churn_probability: 0.07,
    assigned_rsr: 'Carlos P.', contract_value_annual: 89000,
    risk_factors: [],
    last_event: { timestamp: hoursAgo(18), type: 'positive', summary: 'Brian Kim confirmed all 7 locations satisfied — single invoice processed', sentiment: 9, urgency: 'low' },
  },
  {
    id: 'marriott-rivercenter', name: 'Marriott at RiverCenter', industry: 'hospitality',
    health_score: 95, health_tier: 'healthy',
    last_contact_days: 1, open_complaints: 0, churn_risk: false, churn_probability: 0.08,
    assigned_rsr: 'Carlos P.', contract_value_annual: 112000,
    risk_factors: [],
    last_event: { timestamp: hoursAgo(6), type: 'positive', summary: '6am delivery completed — Tom Halloran confirmed excellent service, renewal confirmed', sentiment: 10, urgency: 'low' },
  },
  {
    id: 'cincinnati-childrens', name: "Cincinnati Children's Hospital", industry: 'medical',
    health_score: 97, health_tier: 'healthy',
    last_contact_days: 1, open_complaints: 0, churn_risk: false, churn_probability: 0.06,
    assigned_rsr: 'Sandra K.', contract_value_annual: 128000,
    risk_factors: [],
    last_event: { timestamp: hoursAgo(4), type: 'positive', summary: 'Rita Okafor sent formal commendation — 12th consecutive perfect delivery month', sentiment: 10, urgency: 'low' },
  },
  {
    id: 'precinct-restaurant', name: 'The Precinct', industry: 'restaurant',
    health_score: 91, health_tier: 'healthy',
    last_contact_days: 2, open_complaints: 0, churn_risk: false, churn_probability: 0.05,
    assigned_rsr: 'Mike T.', contract_value_annual: 54000,
    risk_factors: [],
    last_event: { timestamp: daysAgo_ss(2), type: 'positive', summary: 'Tom Brennan confirmed linen quality outstanding — referred a new restaurant prospect', sentiment: 10, urgency: 'low' },
  },
];
  return SHIELD_ACCOUNTS;
}

function computeSummary(accounts) {
  const scores = accounts.map(a => a.health_score);
  return {
    total_accounts: accounts.length,
    critical: accounts.filter(a => a.health_tier === 'critical').length,
    elevated: accounts.filter(a => a.health_tier === 'elevated').length,
    monitor: accounts.filter(a => a.health_tier === 'monitor').length,
    healthy: accounts.filter(a => a.health_tier === 'healthy').length,
    avg_health_score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    churn_risk_count: accounts.filter(a => a.churn_risk).length,
    open_complaints_total: accounts.reduce((s, a) => s + a.open_complaints, 0),
    total_revenue_at_risk: accounts.filter(a => a.churn_risk).reduce((s, a) => s + a.contract_value_annual, 0),
  };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const tierFilter = url.searchParams.get('tier');
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const SHIELD_ACCOUNTS = getShieldAccounts();
    const sorted = [...SHIELD_ACCOUNTS].sort((a, b) => a.health_score - b.health_score);
    const accounts = tierFilter ? sorted.filter(a => a.health_tier === tierFilter) : sorted;

    // Recent events feed
    const recentEvents = [...SHIELD_ACCOUNTS]
      .filter(a => a.last_event)
      .sort((a, b) => new Date(b.last_event.timestamp) - new Date(a.last_event.timestamp))
      .slice(0, 10)
      .map(a => ({
        account_id: a.id,
        account_name: a.name,
        assigned_rsr: a.assigned_rsr,
        ...a.last_event,
        health_score: a.health_score,
        health_tier: a.health_tier,
      }));

    // Churn risk spotlight (top 3 most at-risk)
    const churnSpotlight = [...SHIELD_ACCOUNTS]
      .sort((a, b) => b.churn_probability - a.churn_probability)
      .slice(0, 3)
      .map(a => ({
        id: a.id, name: a.name, churn_probability: a.churn_probability,
        risk_factors: a.risk_factors, assigned_rsr: a.assigned_rsr,
        contract_value_annual: a.contract_value_annual,
        suggested_action: a.last_event?.summary || 'Review account immediately',
      }));

    return new Response(JSON.stringify({
      accounts,
      summary: computeSummary(SHIELD_ACCOUNTS),
      recent_events: recentEvents,
      churn_spotlight: churnSpotlight,
      generated_at: new Date().toISOString(),
      pilot: 'Cincinnati — 90-Day Pilot Demo',
    }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

// ── POST: Analyze complaint with Claude ─────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { source = 'unknown', content, customer_name, business, contact_info, metadata } = body;

    if (!content) return new Response(JSON.stringify({ error: 'content required' }), { status: 400, headers });

    const analysis = await analyzeWithShield(env, { source, content, customer_name, business, contact_info, metadata });
    const id = uid();
    const timestamp = new Date().toISOString();

    const record = {
      id, timestamp, source, content, customer_name, business, contact_info,
      metadata: metadata || {},
      analysis,
    };

    // Store in KV
    if (env.DATA) {
      await env.DATA.put(`shield:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 days

      // Update recent list (last 50)
      let recent = [];
      try { recent = JSON.parse(await env.DATA.get('shield:recent') || '[]'); } catch {}
      recent.unshift({ id, timestamp, source, business, sentiment: analysis.sentiment, urgency: analysis.urgency, is_complaint: analysis.is_complaint });
      recent = recent.slice(0, 50);
      await env.DATA.put('shield:recent', JSON.stringify(recent));

      // Update business account index
      if (business) {
        const key = `shield:account:${business.toLowerCase().replace(/\s+/g, '-')}`;
        let acct = [];
        try { acct = JSON.parse(await env.DATA.get(key) || '[]'); } catch {}
        acct.unshift({ id, timestamp, sentiment: analysis.sentiment, urgency: analysis.urgency, is_complaint: analysis.is_complaint });
        acct = acct.slice(0, 20);
        await env.DATA.put(key, JSON.stringify(acct));
      }
    }

    // Send alert for critical/elevated
    let alert_sent = false;
    if ((analysis.urgency === 'critical' || analysis.urgency === 'elevated') && env.RESEND_API_KEY) {
      const urgencyColor = analysis.urgency === 'critical' ? '#dc2626' : '#f59e0b';
      const emailResult = await sendEmail(
        env,
        env.ALERT_EMAIL || 'evan@cafecito-ai.com',
        `${analysis.urgency === 'critical' ? '🚨' : '⚠️'} Service Shield — ${analysis.urgency.toUpperCase()} — ${business || source}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:${urgencyColor}22;border-left:4px solid ${urgencyColor};padding:16px;margin-bottom:24px">
            <strong style="color:${urgencyColor}">${analysis.urgency.toUpperCase()} — Immediate attention required</strong>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:160px">Business</td><td style="padding:8px 0;font-weight:600">${business || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Customer</td><td style="padding:8px 0">${customer_name || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Source</td><td style="padding:8px 0">${source}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Sentiment</td><td style="padding:8px 0;font-weight:700;color:${urgencyColor}">${analysis.sentiment}/10</td></tr>
            <tr><td style="padding:8px 0;color:#666">Churn Risk</td><td style="padding:8px 0;font-weight:700">${analysis.churn_risk ? '⚠️ YES' : 'No'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Categories</td><td style="padding:8px 0">${(analysis.complaint_categories || []).join(', ') || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Action</td><td style="padding:8px 0">${analysis.recommended_action || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666;vertical-align:top">Content</td><td style="padding:8px 0;font-style:italic">"${content}"</td></tr>
          </table>
          <p style="margin-top:24px;color:#666;font-size:12px">Shield ID: ${id}</p>
        </div>`
      );
      alert_sent = emailResult.ok;
    }

    return new Response(JSON.stringify({ ok: true, id, analysis, alert_sent }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export { analyzeWithShield };
