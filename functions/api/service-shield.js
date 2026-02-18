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
