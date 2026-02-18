// Shared utilities
async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'no RESEND_API_KEY' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'laundry service <alerts@cafecito-ai.com>', to, subject, html }),
  });
  return { ok: res.ok, status: res.status };
}

const TEMPLATES = {
  lead_alert: (data) => ({
    subject: `New Lead: ${data.name || 'Unknown'} — ${data.business_type || 'General'}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a18;margin-bottom:16px">New Lead Received</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${data.name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${data.email || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${data.phone || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0">${data.business_name || data.business_type || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Lead Score</td><td style="padding:8px 0;font-weight:700;color:#b87a4a">${data.lead_score || '—'}/100</td></tr>
        <tr><td style="padding:8px 0;color:#666">Tier</td><td style="padding:8px 0">${data.lead_tier || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Source</td><td style="padding:8px 0">${data.source || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Message</td><td style="padding:8px 0">${data.message || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${new Date().toLocaleString()}</td></tr>
      </table>
    </div>`,
  }),

  complaint_escalation: (data) => ({
    subject: `⚠️ Complaint Escalation — ${data.urgency || 'high'} — ${data.business || 'Unknown'}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:16px;margin-bottom:24px">
        <strong style="color:#dc2626">Urgent Complaint Requires Attention</strong>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:160px">Business</td><td style="padding:8px 0;font-weight:600">${data.business || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Customer</td><td style="padding:8px 0">${data.customer_name || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Sentiment</td><td style="padding:8px 0">${data.sentiment || '—'}/10</td></tr>
        <tr><td style="padding:8px 0;color:#666">Urgency</td><td style="padding:8px 0;font-weight:700;color:#dc2626">${data.urgency || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Churn Risk</td><td style="padding:8px 0">${data.churn_risk ? 'YES' : 'no'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Categories</td><td style="padding:8px 0">${(data.complaint_categories || []).join(', ') || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Action</td><td style="padding:8px 0">${data.recommended_action || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#666;vertical-align:top">Content</td><td style="padding:8px 0">${data.content || '—'}</td></tr>
      </table>
    </div>`,
  }),

  customer_response: (data) => ({
    subject: `We received your request — laundry service`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f7f3">
      <div style="background:#fff;padding:40px;border:1px solid #e8e3d8">
        <h2 style="font-family:Georgia,serif;font-weight:400;color:#1a1a18;margin-bottom:8px">We're on it, ${data.name || 'there'}.</h2>
        <p style="color:#7a7a70;font-size:15px;line-height:1.7;margin-bottom:24px">
          Thanks for reaching out. We've received your request and a member of our team will be back to you within a few hours — evenings and weekends included.
        </p>
        <div style="background:#f9f7f3;padding:20px;margin-bottom:24px">
          <p style="font-size:13px;color:#7a7a70;margin-bottom:4px">Your request</p>
          <p style="color:#1a1a18;font-size:14px">${data.message || '—'}</p>
        </div>
        <p style="color:#7a7a70;font-size:13px">
          Questions? Call or text us at <a href="tel:+15138225130" style="color:#b87a4a">(513) 822-5130</a>.
        </p>
      </div>
      <p style="text-align:center;color:#b0aa9c;font-size:11px;margin-top:16px">laundry service · linen la vida loca.</p>
    </div>`,
  }),

  quote_delivery: (data) => ({
    subject: `Your quote is ready — laundry service`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f7f3">
      <div style="background:#fff;padding:40px;border:1px solid #e8e3d8">
        <h2 style="font-family:Georgia,serif;font-weight:400;color:#1a1a18;margin-bottom:8px">Your quote is ready.</h2>
        <p style="color:#7a7a70;font-size:15px;line-height:1.7;margin-bottom:24px">
          Here's the estimate for your ${data.business_type || 'property'}:
        </p>
        <div style="background:#f9f7f3;padding:20px;margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#7a7a70;font-size:13px">Weekly estimate</span>
            <span style="font-weight:700;color:#1a1a18">${data.weekly_mid || '—'}</span>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#7a7a70;font-size:13px">Monthly estimate</span>
            <span style="font-weight:700;color:#1a1a18">${data.monthly_mid || '—'}</span>
          </div>
        </div>
        <p style="color:#7a7a70;font-size:13px">
          This is an AI-generated estimate. A specialist will confirm within 24 hours. Call <a href="tel:+15138225130" style="color:#b87a4a">(513) 822-5130</a> to fast-track.
        </p>
      </div>
    </div>`,
  }),

  daily_digest: (data) => ({
    subject: `Daily ops digest — ${new Date().toLocaleDateString()}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a18;margin-bottom:16px">Daily Operations Summary</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:160px">Total Events</td><td style="padding:8px 0;font-weight:600">${data.total_events || 0}</td></tr>
        <tr><td style="padding:8px 0;color:#666">New Leads</td><td style="padding:8px 0">${data.leads || 0}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Complaints</td><td style="padding:8px 0">${data.complaints || 0}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Quotes</td><td style="padding:8px 0">${data.quotes || 0}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Chats</td><td style="padding:8px 0">${data.chats || 0}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Avg Sentiment</td><td style="padding:8px 0">${data.avg_sentiment || '—'}/10</td></tr>
      </table>
    </div>`,
  }),
};

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { channel = 'email', template, recipient, data = {}, priority = 'normal' } = body;

    if (!template) return new Response(JSON.stringify({ error: 'template required' }), { status: 400, headers });
    if (!recipient) return new Response(JSON.stringify({ error: 'recipient required' }), { status: 400, headers });

    const tmpl = TEMPLATES[template];
    if (!tmpl) return new Response(JSON.stringify({ error: `unknown template: ${template}` }), { status: 400, headers });

    const { subject, html } = tmpl(data);
    const result = await sendEmail(env, recipient, subject, html);

    return new Response(JSON.stringify({ ok: result.ok, channel, template, recipient, priority }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
