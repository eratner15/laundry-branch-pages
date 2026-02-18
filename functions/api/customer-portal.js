// Customer Portal API — account profile, deliveries, schedule, issues, spend

const DEMO_ACCOUNTS = {
  'miami-beach-resort': {
    account_id: 'miami-beach-resort',
    business_name: 'Miami Beach Resort & Spa',
    business_type: 'hotel_resort',
    address: '2300 Collins Ave, Miami Beach, FL 33139',
    contact_name: 'Marisol Reyes',
    contact_title: 'General Manager',
    contact_email: 'marisol@miamibeachresort.com',
    contact_phone: '(305) 555-0142',
    account_since: '2023-03-15',
    route: 'route-12',
    driver: 'Carlos M.',
    delivery_day: 'Tuesday',
    delivery_window: '6:00 AM – 8:00 AM',
    services: ['Pool Towels', 'Bath Towels', 'Bed Linens', 'Restaurant Napkins', 'Spa Towels'],
    weekly_pieces: 320,
    monthly_rate: 2240,
    tier: 'premium',
    next_delivery: null, // computed
    recent_deliveries: [
      { date: null, pieces_delivered: 318, pieces_collected: 315, driver: 'Carlos M.', status: 'completed', notes: '' },
      { date: null, pieces_delivered: 322, pieces_collected: 320, driver: 'Carlos M.', status: 'completed', notes: '' },
      { date: null, pieces_delivered: 305, pieces_collected: 310, driver: 'Carlos M.', status: 'completed', notes: 'Short count on pool towels — restocked' },
      { date: null, pieces_delivered: 320, pieces_collected: 318, driver: 'Carlos M.', status: 'completed', notes: '' },
    ],
    open_issues: [
      { id: 'issue-001', created: null, title: 'Missing 5 pool towels from last delivery', status: 'investigating', priority: 'normal' },
    ],
    ytd_spend: 17920,
    monthly_invoices: [
      { month: 'January 2026', amount: 2240, status: 'paid' },
      { month: 'February 2026', amount: 2240, status: 'pending' },
    ],
  },

  'sanctuary-spa': {
    account_id: 'sanctuary-spa',
    business_name: 'The Sanctuary Spa',
    business_type: 'spa_salon',
    address: '1680 James Ave, Miami Beach, FL 33139',
    contact_name: 'Dr. Elena Voss',
    contact_title: 'Owner',
    contact_email: 'elena@sanctuaryspa.com',
    contact_phone: '(305) 555-0288',
    account_since: '2023-08-01',
    route: 'route-12',
    driver: 'Carlos M.',
    delivery_day: 'Thursday',
    delivery_window: '9:00 AM – 11:00 AM',
    services: ['Spa Towels', 'Face Cloths', 'Robes'],
    weekly_pieces: 85,
    monthly_rate: 680,
    tier: 'standard',
    next_delivery: null,
    recent_deliveries: [
      { date: null, pieces_delivered: 85, pieces_collected: 84, driver: 'Carlos M.', status: 'completed', notes: '' },
      { date: null, pieces_delivered: 85, pieces_collected: 85, driver: 'Carlos M.', status: 'completed', notes: '' },
    ],
    open_issues: [
      { id: 'issue-002', created: null, title: 'Face cloths not folded per preference', status: 'resolved', priority: 'low' },
    ],
    ytd_spend: 3400,
    monthly_invoices: [
      { month: 'January 2026', amount: 680, status: 'paid' },
      { month: 'February 2026', amount: 680, status: 'pending' },
    ],
  },

  'sunset-hoa': {
    account_id: 'sunset-hoa',
    business_name: 'Sunset Palms HOA',
    business_type: 'hoa_condo',
    address: '400 Meridian Ave, Miami Beach, FL 33139',
    contact_name: 'Raul Fontaine',
    contact_title: 'Property Manager',
    contact_email: 'raul@sunsetpalms.com',
    contact_phone: '(305) 555-0399',
    account_since: '2022-11-01',
    route: 'route-12',
    driver: 'Carlos M.',
    delivery_day: 'Monday',
    delivery_window: '7:00 AM – 9:00 AM',
    services: ['Pool Towels'],
    weekly_pieces: 150,
    monthly_rate: 840,
    tier: 'standard',
    next_delivery: null,
    recent_deliveries: [
      { date: null, pieces_delivered: 150, pieces_collected: 148, driver: 'Carlos M.', status: 'completed', notes: '' },
      { date: null, pieces_delivered: 150, pieces_collected: 150, driver: 'Carlos M.', status: 'completed', notes: '' },
      { date: null, pieces_delivered: 160, pieces_collected: 155, driver: 'Carlos M.', status: 'completed', notes: 'Added 10 extras for pool event' },
    ],
    open_issues: [],
    ytd_spend: 5880,
    monthly_invoices: [
      { month: 'January 2026', amount: 840, status: 'paid' },
      { month: 'February 2026', amount: 840, status: 'pending' },
    ],
  },
};

function computeDates(account) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = days.indexOf(account.delivery_day);
  const today = new Date();
  const dayOfWeek = today.getDay();
  let daysUntil = (dayIndex - dayOfWeek + 7) % 7;
  if (daysUntil === 0) daysUntil = 7;

  const nextDelivery = new Date(today.getTime() + daysUntil * 86400000);
  account.next_delivery = {
    date: nextDelivery.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    days_away: daysUntil,
    window: account.delivery_window,
    driver: account.driver,
  };

  // Fill in delivery dates (working backwards from today)
  account.recent_deliveries = account.recent_deliveries.map((d, i) => {
    const daysBack = (i + 1) * 7;
    const date = new Date(today.getTime() - daysBack * 86400000);
    return { ...d, date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
  });

  // Fill issue dates
  account.open_issues = account.open_issues.map((issue, i) => ({
    ...issue,
    created: new Date(today.getTime() - (i + 1) * 3 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return account;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const accountId = url.searchParams.get('account');
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    if (!accountId) {
      return new Response(JSON.stringify({
        error: 'account parameter required',
        available_demo_accounts: Object.keys(DEMO_ACCOUNTS),
        example: '?account=miami-beach-resort',
      }), { status: 400, headers });
    }

    // Seed demo data to KV
    if (env.DATA) {
      const key = `portal:${accountId}`;
      let stored = null;
      try { stored = await env.DATA.get(key); } catch {}

      if (!stored && DEMO_ACCOUNTS[accountId]) {
        const demo = computeDates(JSON.parse(JSON.stringify(DEMO_ACCOUNTS[accountId])));
        await env.DATA.put(key, JSON.stringify(demo), { expirationTtl: 60 * 60 * 24 });
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        return new Response(JSON.stringify({ ok: true, ...computeDates(parsed) }), { headers });
      }
    }

    // Fallback to demo data
    const demo = DEMO_ACCOUNTS[accountId];
    if (!demo) {
      return new Response(JSON.stringify({
        error: `Account not found: ${accountId}`,
        available: Object.keys(DEMO_ACCOUNTS),
      }), { status: 404, headers });
    }

    const result = computeDates(JSON.parse(JSON.stringify(demo)));

    // Add quick actions
    result.quick_actions = [
      { label: 'Request extra delivery', action: 'extra_delivery', description: 'Need more towels before your next scheduled delivery?' },
      { label: 'Report missing items', action: 'report_missing', description: 'Pieces not delivered or count seems off?' },
      { label: 'Request a service change', action: 'service_change', description: 'Add or remove services, adjust quantities' },
      { label: 'Talk to your route manager', action: 'contact_ops', description: `Call (513) 822-5130 or email evan@cafecito-ai.com` },
    ];

    return new Response(JSON.stringify({ ok: true, ...result }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
