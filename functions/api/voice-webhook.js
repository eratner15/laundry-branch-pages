// Voice webhook — receives POST from Bland AI
// Analyzes call sentiment, stores to KV, sends alerts

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
  if (!env.RESEND_API_KEY) return { ok: false };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'laundry service <alerts@cafecito-ai.com>', to, subject, html }),
  });
  return { ok: res.ok };
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();

    // Bland AI webhook payload fields
    const {
      call_id,
      to,
      from: callerPhone,
      status,
      duration,
      transcript,
      summary,
      variables = {},
      call_length,
      recording_url,
    } = body;

    const callContent = transcript || summary || '';
    const callerName = variables.name || variables.caller_name || 'Unknown caller';
    const business = variables.business_name || variables.company || '';
    const timestamp = new Date().toISOString();
    const id = uid();

    // Analyze call sentiment
    let analysis = { sentiment: 6, is_complaint: false, urgency: 'normal', lead_score: 40, lead_tier: 'cool', is_lead: false, complaint_categories: [], churn_risk: false, recommended_action: 'Log and follow up if needed', summary: summary || '' };

    if (callContent && env.ANTHROPIC_API_KEY) {
      const system = `You are analyzing a call transcript for a commercial laundry and linen rental service.
Return a JSON object:
{
  "sentiment": <1-10>,
  "is_complaint": <boolean>,
  "is_lead": <boolean>,
  "lead_score": <0-100>,
  "lead_tier": <"hot"|"warm"|"cool"|"cold">,
  "urgency": <"critical"|"elevated"|"normal"|"low">,
  "complaint_categories": <array>,
  "churn_risk": <boolean>,
  "recommended_action": <string>,
  "caller_intent": <"new_lead"|"existing_customer"|"complaint"|"info_request"|"wrong_number"|"vendor"|"other">,
  "key_info": <string, important details extracted like property name, service needs, contact info mentioned>,
  "summary": <string, 2-sentence call summary>
}`;
      try {
        analysis = await callClaudeJSON(env, system, `Call from: ${callerPhone}\nCaller name: ${callerName}\nBusiness: ${business}\nDuration: ${duration || call_length || '?'} seconds\nStatus: ${status}\nContent: ${callContent}`);
      } catch (e) {
        console.error('Shield analysis error:', e.message);
      }
    }

    const record = {
      id, call_id, timestamp, callerPhone, callerName, business,
      status, duration: duration || call_length, transcript, summary,
      recording_url, analysis,
    };

    if (env.DATA) {
      await env.DATA.put(`call:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 90 });

      // Update calls:recent
      let recent = [];
      try { recent = JSON.parse(await env.DATA.get('calls:recent') || '[]'); } catch {}
      recent.unshift({ id, timestamp, callerPhone, callerName, business, sentiment: analysis.sentiment, is_lead: analysis.is_lead, lead_tier: analysis.lead_tier, urgency: analysis.urgency, duration: duration || call_length });
      recent = recent.slice(0, 50);
      await env.DATA.put('calls:recent', JSON.stringify(recent));

      // Update metrics
      let metrics = {};
      try { metrics = JSON.parse(await env.DATA.get('metrics:calls') || '{}'); } catch {}
      metrics.total = (metrics.total || 0) + 1;
      if (status === 'completed') metrics.answered = (metrics.answered || 0) + 1;
      if (analysis.is_lead && analysis.lead_tier === 'hot') metrics.hot_leads = (metrics.hot_leads || 0) + 1;
      const dur = parseInt(duration || call_length || 0);
      if (dur > 0) {
        const prevAvg = metrics.avg_duration || 0;
        const prevTotal = metrics.answered || 1;
        metrics.avg_duration = Math.round((prevAvg * (prevTotal - 1) + dur) / prevTotal);
      }
      metrics.last_updated = timestamp;
      await env.DATA.put('metrics:calls', JSON.stringify(metrics));

      // Store shield event for complaints
      if (analysis.is_complaint) {
        let shieldRecent = [];
        try { shieldRecent = JSON.parse(await env.DATA.get('shield:recent') || '[]'); } catch {}
        const shieldId = uid();
        shieldRecent.unshift({ id: shieldId, timestamp, source: 'phone_call', business, sentiment: analysis.sentiment, urgency: analysis.urgency, is_complaint: true, churn_risk: analysis.churn_risk });
        shieldRecent = shieldRecent.slice(0, 50);
        await env.DATA.put('shield:recent', JSON.stringify(shieldRecent));
      }
    }

    // Send alerts
    const alerts = [];

    // Lead alert
    if (analysis.is_lead && (analysis.lead_tier === 'hot' || analysis.lead_tier === 'warm') && env.RESEND_API_KEY && env.ALERT_EMAIL) {
      alerts.push(sendEmail(env, env.ALERT_EMAIL,
        `${analysis.lead_tier === 'hot' ? '🔥' : '⚡'} Phone Lead: ${callerName} — ${analysis.lead_tier} (${analysis.lead_score})`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a18;margin-bottom:16px">New Lead from Phone</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:140px">Caller</td><td style="padding:8px 0;font-weight:600">${callerName}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${callerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0">${business || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Lead Score</td><td style="padding:8px 0;font-weight:700;color:#b87a4a">${analysis.lead_score}/100</td></tr>
            <tr><td style="padding:8px 0;color:#666">Intent</td><td style="padding:8px 0">${analysis.caller_intent || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Duration</td><td style="padding:8px 0">${duration || call_length || '?'}s</td></tr>
            <tr><td style="padding:8px 0;color:#666">Key Info</td><td style="padding:8px 0">${analysis.key_info || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Action</td><td style="padding:8px 0;font-weight:600">${analysis.recommended_action}</td></tr>
          </table>
          ${recording_url ? `<p style="margin-top:16px"><a href="${recording_url}" style="color:#b87a4a">Listen to recording →</a></p>` : ''}
        </div>`
      ));
    }

    // Complaint alert
    if (analysis.is_complaint && (analysis.urgency === 'critical' || analysis.urgency === 'elevated') && env.RESEND_API_KEY && env.ALERT_EMAIL) {
      alerts.push(sendEmail(env, env.ALERT_EMAIL,
        `⚠️ Phone Complaint — ${analysis.urgency.toUpperCase()} — ${callerName}`,
        `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:16px;margin-bottom:24px">
            <strong style="color:#dc2626">Phone complaint requires attention — ${analysis.urgency.toUpperCase()}</strong>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:140px">Caller</td><td style="padding:8px 0;font-weight:600">${callerName}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${callerPhone}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Sentiment</td><td style="padding:8px 0;color:#dc2626;font-weight:700">${analysis.sentiment}/10</td></tr>
            <tr><td style="padding:8px 0;color:#666">Churn Risk</td><td style="padding:8px 0">${analysis.churn_risk ? '⚠️ YES' : 'No'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Summary</td><td style="padding:8px 0">${analysis.summary}</td></tr>
          </table>
        </div>`
      ));
    }

    await Promise.allSettled(alerts);

    return new Response(JSON.stringify({ ok: true, id, analysis }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
