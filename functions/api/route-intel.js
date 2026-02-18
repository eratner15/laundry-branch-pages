// Route Intel — driver briefings and account deep-dives

const DEMO_ROUTES = {
  'route-12': {
    route_id: 'route-12',
    driver: 'Carlos M.',
    territory: 'Miami Beach / South Beach',
    stops: 8,
    accounts: [
      { id: 'miami-beach-resort', name: 'Miami Beach Resort & Spa', address: '2300 Collins Ave, Miami Beach, FL', type: 'hotel_resort', contact: 'Marisol Reyes (GM)', phone: '(305) 555-0142', notes: 'Prefer delivery before 8am. Pool towel count runs high on weekends.', weekly_pieces: 320, open_issues: 0 },
      { id: 'sanctuary-spa', name: 'The Sanctuary Spa', address: '1680 James Ave, Miami Beach, FL', type: 'spa_salon', contact: 'Dr. Elena Voss', phone: '(305) 555-0288', notes: 'Very particular about fold style on face cloths. Check in with front desk only.', weekly_pieces: 85, open_issues: 1 },
      { id: 'sunset-hoa', name: 'Sunset Palms HOA', address: '400 Meridian Ave, Miami Beach, FL', type: 'hoa_condo', contact: 'Raul Fontaine (Property Mgr)', phone: '(305) 555-0399', notes: 'Pool closed Tuesdays. Leave with concierge.', weekly_pieces: 150, open_issues: 0 },
      { id: 'ocean-drive-bistro', name: 'Ocean Drive Bistro', address: '918 Ocean Dr, Miami Beach, FL', type: 'restaurant', contact: 'Chef Marco', phone: '(305) 555-0471', notes: 'Kitchen towels and napkins. Needs chef coats on first of month.', weekly_pieces: 60, open_issues: 0 },
    ],
  },
  'route-7': {
    route_id: 'route-7',
    driver: 'Miguel A.',
    territory: 'Coral Gables / Coconut Grove',
    stops: 6,
    accounts: [
      { id: 'grove-hotel', name: 'Grove Boutique Hotel', address: '2980 McFarlane Rd, Coconut Grove, FL', type: 'hotel_resort', contact: 'Patricia Vega', phone: '(305) 555-0561', notes: 'New account since March. Still calibrating towel counts.', weekly_pieces: 200, open_issues: 1 },
    ],
  },
};

async function seedDemoData(env) {
  // Seed demo shield events, chat history, and account data
  const shieldEvents = [
    { id: 'shield-001', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'phone_call', business: 'miami-beach-resort', sentiment: 4, urgency: 'elevated', is_complaint: true, churn_risk: false },
    { id: 'shield-002', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'chat', business: 'sanctuary-spa', sentiment: 3, urgency: 'elevated', is_complaint: true, churn_risk: true },
    { id: 'shield-003', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'intake_form', business: 'grove-hotel', sentiment: 8, urgency: 'low', is_complaint: false, churn_risk: false },
  ];
  await env.DATA.put('shield:recent', JSON.stringify(shieldEvents));

  // Demo leads
  const leadsRecent = [
    { id: 'lead-001', timestamp: new Date(Date.now() - 3600000).toISOString(), name: 'Sandra Lopez', email: 'sandra@tropicalhoa.com', business_type: 'hoa_condo', business_name: 'Tropical Gardens HOA', source: 'website_form', lead_score: 78, lead_tier: 'hot' },
    { id: 'lead-002', timestamp: new Date(Date.now() - 7200000).toISOString(), name: 'James Whitfield', email: 'james@dallashotels.com', business_type: 'hotel_resort', business_name: 'The Ritz Carlton Midtown', source: 'phone', lead_score: 91, lead_tier: 'hot' },
    { id: 'lead-003', timestamp: new Date(Date.now() - 86400000).toISOString(), name: 'Maria Chen', email: 'mchen@spa365.com', business_type: 'spa_salon', business_name: 'Spa 365', source: 'website_form', lead_score: 62, lead_tier: 'warm' },
  ];
  await env.DATA.put('leads:recent', JSON.stringify(leadsRecent));

  // Demo metrics
  await env.DATA.put('metrics:calls', JSON.stringify({ total: 47, answered: 44, voicemails: 3, avg_duration: 142, hot_leads: 8 }));
  await env.DATA.put('metrics:chats', JSON.stringify({ total: 23, escalated: 7, avg_messages: 6 }));
  await env.DATA.put('metrics:leads', JSON.stringify({ total: 31, hot: 9, warm: 14, cool: 6, cold: 2 }));
  await env.DATA.put('quotes:recent', JSON.stringify([
    { id: 'quote-001', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), business_type: 'hoa_condo', location: 'miami', weekly_mid: '$280' },
    { id: 'quote-002', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), business_type: 'hotel_resort', location: 'dallas', weekly_mid: '$640' },
  ]));
}

function moodIcon(sentiment) {
  if (!sentiment) return '●';
  if (sentiment >= 8) return '🟢';
  if (sentiment >= 6) return '🟡';
  if (sentiment >= 4) return '🟠';
  return '🔴';
}

function buildBriefingHtml(route, shieldByBusiness) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const totalPieces = route.accounts.reduce((sum, a) => sum + a.weekly_pieces, 0);
  const openIssues = route.accounts.reduce((sum, a) => sum + a.open_issues, 0);

  const accountsHtml = route.accounts.map(account => {
    const shield = shieldByBusiness[account.id] || [];
    const latestShield = shield[0];
    const mood = latestShield ? moodIcon(latestShield.sentiment) : '🟢';
    const hasComplaint = shield.some(s => s.is_complaint);
    const hasChurnRisk = shield.some(s => s.churn_risk);

    return `<div style="background:#1a1f26;border:1px solid #242a33;border-radius:10px;padding:20px;margin-bottom:12px;${hasComplaint ? 'border-left:3px solid #f59e0b;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div>
          <div style="font-weight:600;font-size:15px;margin-bottom:2px">${account.name}</div>
          <div style="color:#8899a6;font-size:12px">${account.address}</div>
        </div>
        <div style="font-size:20px;margin-left:12px">${mood}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#242a33;padding:10px;border-radius:6px">
          <div style="font-size:10px;color:#8899a6;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Contact</div>
          <div style="font-size:13px">${account.contact}</div>
          <div style="font-size:12px;color:#8899a6">${account.phone}</div>
        </div>
        <div style="background:#242a33;padding:10px;border-radius:6px">
          <div style="font-size:10px;color:#8899a6;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">This Week</div>
          <div style="font-size:18px;font-weight:700;color:#003DA5">${account.weekly_pieces}</div>
          <div style="font-size:11px;color:#8899a6">pieces</div>
        </div>
      </div>
      ${account.notes ? `<div style="background:#242a33;padding:10px;border-radius:6px;margin-bottom:10px;font-size:13px;color:#c9d1d9">📝 ${account.notes}</div>` : ''}
      ${hasComplaint ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);padding:8px 12px;border-radius:6px;font-size:12px;color:#f59e0b">⚠️ Recent complaint on file — be proactive${hasChurnRisk ? ' · Churn risk' : ''}</div>` : ''}
      ${account.open_issues > 0 ? `<div style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);padding:8px 12px;border-radius:6px;font-size:12px;color:#ef4444;margin-top:8px">🚨 ${account.open_issues} open issue(s) — address on-site</div>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Route Briefing — ${route.route_id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#0f1419; color:#f0f3f6; padding:20px; -webkit-font-smoothing:antialiased; }
    .header { background:#1a1f26; border:1px solid #242a33; border-radius:10px; padding:20px 24px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; }
    .route-id { font-size:11px; color:#8899a6; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
    .route-name { font-size:18px; font-weight:700; }
    .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
    .stat { background:#1a1f26; border:1px solid #242a33; border-radius:8px; padding:14px; text-align:center; }
    .stat-val { font-size:22px; font-weight:700; color:#003DA5; }
    .stat-lbl { font-size:10px; color:#8899a6; text-transform:uppercase; letter-spacing:0.08em; margin-top:2px; }
    h2 { font-size:13px; color:#8899a6; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="route-id">${route.route_id} · ${today}</div>
      <div class="route-name">${route.territory}</div>
      <div style="font-size:13px;color:#8899a6;margin-top:4px">Driver: ${route.driver}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#8899a6;text-transform:uppercase;letter-spacing:0.08em">AI-Generated Briefing</div>
      <div style="font-size:11px;color:#003DA5;margin-top:2px">laundry service ops</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-val">${route.stops}</div><div class="stat-lbl">Stops</div></div>
    <div class="stat"><div class="stat-val">${totalPieces}</div><div class="stat-lbl">Total Pieces</div></div>
    <div class="stat"><div class="stat-val" style="color:${openIssues > 0 ? '#ef4444' : '#16a34a'}">${openIssues}</div><div class="stat-lbl">Open Issues</div></div>
  </div>

  <h2>Account Briefings</h2>
  ${accountsHtml}

  <div style="text-align:center;color:#8899a6;font-size:11px;margin-top:20px;padding-top:16px;border-top:1px solid #242a33">
    Generated ${new Date().toLocaleTimeString()} · laundry service AI ops
  </div>
</body>
</html>`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = url.searchParams.get('route');
  const account = url.searchParams.get('account');
  const headers_json = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const headers_html = { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' };

  try {
    // Seed demo data on first run
    if (env.DATA) {
      const seeded = await env.DATA.get('demo:seeded');
      if (!seeded) {
        await seedDemoData(env);
        await env.DATA.put('demo:seeded', '1', { expirationTtl: 60 * 60 * 24 * 365 });
      }
    }

    if (account) {
      // Deep-dive account view
      let shieldEvents = [];
      let chatHistory = [];
      let formSubmissions = [];

      if (env.DATA) {
        try { shieldEvents = JSON.parse(await env.DATA.get(`shield:account:${account}`) || '[]'); } catch {}
        try { chatHistory = JSON.parse(await env.DATA.get(`chat:${account}`) || '{"messages":[]}').messages || []; } catch {}
        try {
          const leads = JSON.parse(await env.DATA.get('leads:recent') || '[]');
          formSubmissions = leads.filter(l => l.business_name?.toLowerCase().includes(account.replace(/-/g, ' ')));
        } catch {}
      }

      const accountData = Object.values(DEMO_ROUTES)
        .flatMap(r => r.accounts)
        .find(a => a.id === account);

      return new Response(JSON.stringify({
        account_id: account,
        account_data: accountData || null,
        shield_events: shieldEvents.slice(0, 10),
        recent_chat_messages: chatHistory.slice(-10),
        form_submissions: formSubmissions.slice(0, 5),
        mood: shieldEvents.length ? (shieldEvents[0].sentiment >= 7 ? 'positive' : shieldEvents[0].sentiment >= 5 ? 'neutral' : 'negative') : 'unknown',
      }), { headers: headers_json });
    }

    if (route) {
      const routeData = DEMO_ROUTES[route];
      if (!routeData) {
        return new Response(JSON.stringify({ error: `Route ${route} not found`, available: Object.keys(DEMO_ROUTES) }), { status: 404, headers: headers_json });
      }

      // Pull shield events for each account
      const shieldByBusiness = {};
      if (env.DATA) {
        await Promise.all(routeData.accounts.map(async (acc) => {
          try {
            const events = JSON.parse(await env.DATA.get(`shield:account:${acc.id}`) || '[]');
            shieldByBusiness[acc.id] = events;
          } catch {}
        }));
      }

      // Cross-reference global shield events by business name
      if (env.DATA) {
        try {
          const allShield = JSON.parse(await env.DATA.get('shield:recent') || '[]');
          for (const event of allShield) {
            const matchedAcc = routeData.accounts.find(a => a.id === event.business || a.name.toLowerCase().includes((event.business || '').toLowerCase()));
            if (matchedAcc) {
              if (!shieldByBusiness[matchedAcc.id]) shieldByBusiness[matchedAcc.id] = [];
              if (!shieldByBusiness[matchedAcc.id].find(e => e.id === event.id)) {
                shieldByBusiness[matchedAcc.id].push(event);
              }
            }
          }
        } catch {}
      }

      const html = buildBriefingHtml(routeData, shieldByBusiness);
      return new Response(html, { headers: headers_html });
    }

    // List available routes
    return new Response(JSON.stringify({
      routes: Object.keys(DEMO_ROUTES),
      usage: { route: '?route=route-12', account: '?account=miami-beach-resort' },
    }), { headers: headers_json });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: headers_json });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
