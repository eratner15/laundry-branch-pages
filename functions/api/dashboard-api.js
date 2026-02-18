// Dashboard API — multi-channel overview
// GET: returns full metrics JSON
// POST {action: "store_event"}: universal event intake

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getMetrics(env) {
  const results = await Promise.allSettled([
    env.DATA.get('leads:recent'),
    env.DATA.get('metrics:leads'),
    env.DATA.get('shield:recent'),
    env.DATA.get('quotes:recent'),
    env.DATA.get('metrics:calls'),
    env.DATA.get('metrics:chats'),
    env.DATA.get('events:recent'),
  ]);

  const [leadsRecent, leadsMetrics, shieldRecent, quotesRecent, callsMetrics, chatsMetrics, eventsRecent] = results.map(r => {
    if (r.status === 'fulfilled' && r.value) {
      try { return JSON.parse(r.value); } catch { return null; }
    }
    return null;
  });

  // Build sentiment overview from shield events
  const shieldEvents = shieldRecent || [];
  const avgSentiment = shieldEvents.length
    ? (shieldEvents.reduce((sum, e) => sum + (e.sentiment || 5), 0) / shieldEvents.length).toFixed(1)
    : null;
  const complaints = shieldEvents.filter(e => e.is_complaint).length;
  const criticalCount = shieldEvents.filter(e => e.urgency === 'critical' || e.urgency === 'elevated').length;

  // Leads overview
  const leads = leadsRecent || [];
  const lm = leadsMetrics || {};
  const hotLeads = leads.filter(l => l.lead_tier === 'hot').length;
  const warmLeads = leads.filter(l => l.lead_tier === 'warm').length;

  // Competitive mentions
  const competitorMentions = shieldEvents
    .filter(e => e.competitor_mentions && e.competitor_mentions.length > 0)
    .flatMap(e => e.competitor_mentions || []);
  const competitorCounts = competitorMentions.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});

  // Recent events (combined timeline)
  const allRecent = [
    ...(leads.slice(0, 5).map(l => ({ type: 'lead', time: l.timestamp, title: `New lead: ${l.name}`, tier: l.lead_tier, id: l.id }))),
    ...(shieldEvents.slice(0, 5).map(s => ({ type: 'shield', time: s.timestamp, title: `${s.is_complaint ? 'Complaint' : 'Mention'}: ${s.business || s.source}`, urgency: s.urgency, id: s.id }))),
    ...((quotesRecent || []).slice(0, 3).map(q => ({ type: 'quote', time: q.timestamp, title: `Quote: ${q.business_type} (${q.weekly_mid}/wk)`, id: q.id }))),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

  const callsMet = callsMetrics || {};
  const chatsMet = chatsMetrics || {};

  return {
    generated_at: new Date().toISOString(),
    calls: {
      total: callsMet.total || 0,
      answered: callsMet.answered || 0,
      voicemails: callsMet.voicemails || 0,
      avg_duration_sec: callsMet.avg_duration || 0,
      hot_leads_from_calls: callsMet.hot_leads || 0,
    },
    chats: {
      total_sessions: chatsMet.total || 0,
      escalated: chatsMet.escalated || 0,
      avg_messages: chatsMet.avg_messages || 0,
    },
    forms: {
      total_submissions: lm.total || leads.length,
      hot: hotLeads,
      warm: warmLeads,
      cool: lm.cool || 0,
      cold: lm.cold || 0,
    },
    quotes: {
      total: (quotesRecent || []).length,
      recent: (quotesRecent || []).slice(0, 5),
    },
    sentiment: {
      avg_score: avgSentiment ? parseFloat(avgSentiment) : null,
      total_analyzed: shieldEvents.length,
      complaints,
      critical_or_elevated: criticalCount,
      churn_risk_count: shieldEvents.filter(e => e.churn_risk).length,
    },
    leads: {
      total: lm.total || leads.length,
      hot: lm.hot || hotLeads,
      warm: lm.warm || warmLeads,
      recent: leads.slice(0, 10),
    },
    complaints: {
      total: complaints,
      recent: shieldEvents.filter(e => e.is_complaint).slice(0, 5),
    },
    competitive: {
      total_mentions: competitorMentions.length,
      by_competitor: competitorCounts,
    },
    recent_events: allRecent,
  };
}

export async function onRequestGet(context) {
  const { env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    if (!env.DATA) {
      // Return demo data if KV not bound
      return new Response(JSON.stringify({
        generated_at: new Date().toISOString(),
        _demo: true,
        calls: { total: 47, answered: 44, voicemails: 3, avg_duration_sec: 142, hot_leads_from_calls: 8 },
        chats: { total_sessions: 23, escalated: 7, avg_messages: 6 },
        forms: { total_submissions: 31, hot: 9, warm: 14, cool: 6, cold: 2 },
        quotes: { total: 18, recent: [] },
        sentiment: { avg_score: 7.2, total_analyzed: 38, complaints: 4, critical_or_elevated: 2, churn_risk_count: 1 },
        leads: { total: 31, hot: 9, warm: 14, recent: [] },
        complaints: { total: 4, recent: [] },
        competitive: { total_mentions: 6, by_competitor: { 'Cintas': 3, 'ALSCO': 2, 'UniFirst': 1 } },
        recent_events: [],
      }), { headers });
    }

    const metrics = await getMetrics(env);
    return new Response(JSON.stringify(metrics), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'store_event') {
      const { type, data } = body;
      if (!type) return new Response(JSON.stringify({ error: 'type required' }), { status: 400, headers });

      const id = uid();
      const timestamp = new Date().toISOString();
      const record = { id, timestamp, type, data: data || {} };

      if (env.DATA) {
        await env.DATA.put(`event:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });

        let recent = [];
        try { recent = JSON.parse(await env.DATA.get('events:recent') || '[]'); } catch {}
        recent.unshift({ id, timestamp, type, summary: data?.summary || `${type} event` });
        recent = recent.slice(0, 100);
        await env.DATA.put('events:recent', JSON.stringify(recent));
      }

      return new Response(JSON.stringify({ ok: true, id }), { headers });
    }

    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
