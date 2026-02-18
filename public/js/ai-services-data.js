/**
 * ai-services-data.js — Data layer for Cafecito AI × Laundry Service
 * City configs, pricing engine, chat responses
 */

const AIS_CITIES = {
  miami: {
    name: 'Miami', region: 'South Florida',
    phone: '(513) 822-5130', phoneTel: '+15138225130',
    serviceArea: 'Miami-Dade, Broward, and Palm Beach counties',
    chatGreeting: 'Hey! 👋 I can help with pricing, service areas, delivery schedules — or put together a quick quote for your South Florida property. What can I help with?',
    route: {
      id: 'Route 12', stops: 8, est: '6h 20m',
      preview: [
        { name: 'Miami Beach Resort', mood: 'y', note: '⚠ Billing dispute · 3d open' },
        { name: 'Coral Gables CC', mood: 'g', note: 'Upsell: gala linens Mar 15' },
        { name: 'Brickell Fitness', mood: 'r', note: '🔴 Churn risk · UniFirst' },
        { name: 'La Ventana Restaurant', mood: 'g', note: 'New client · week 6' },
      ], flagged: 2,
    },
    dashboard: {
      deliveries: 47, open: 2, spend: '$2.8k', satisfaction: '8.4',
      trend: '↑ 12%', trendPeriod: '6wk', totalDeliveries: 47,
      sparkline: '0,20 25,18 50,22 75,14 100,10 125,12 150,8 175,6 200,4',
    },
    shield: { recent: [9, 8, 6, 9, 3], escalated: '1 complaint escalated · branch mgr alerted 4m ago' },
    feed: [
      { dot: 'g', text: 'New inquiry — hotel, 200 rooms', score: '82' },
      { dot: 'a', text: 'Existing customer — schedule change', score: '45' },
      { dot: 'r', text: 'Complaint flagged — late pickup', score: '⚠ Shield', scoreColor: '#ef4444' },
    ],
  },
  cincinnati: {
    name: 'Cincinnati', region: 'Greater Cincinnati & Northern Kentucky',
    phone: '(513) 822-5130', phoneTel: '+15138225130',
    serviceArea: 'Hamilton, Butler, Warren, and Clermont counties plus Northern Kentucky',
    chatGreeting: 'Hey! 👋 I can help with pricing, service areas, delivery schedules — or size a uniform program for your Greater Cincinnati operation. What do you need?',
    route: {
      id: 'Route 7', stops: 10, est: '7h 15m',
      preview: [
        { name: 'Kenwood Country Club', mood: 'g', note: 'Upsell: spring banquet linens' },
        { name: 'Brennan Manufacturing', mood: 'y', note: '⚠ Missing coveralls · 5d open' },
        { name: 'Christ Hospital', mood: 'g', note: 'Expanded scrub program +40%' },
        { name: 'Findlay Kitchen', mood: 'r', note: '🔴 Late delivery × 2 · at risk' },
      ], flagged: 3,
    },
    dashboard: {
      deliveries: 62, open: 3, spend: '$4.1k', satisfaction: '7.8',
      trend: '↑ 8%', trendPeriod: '6wk', totalDeliveries: 62,
      sparkline: '0,22 25,20 50,24 75,18 100,16 125,14 150,12 175,10 200,8',
    },
    shield: { recent: [8, 7, 9, 5, 8], escalated: '1 complaint escalated · ops lead alerted 12m ago' },
    feed: [
      { dot: 'g', text: 'New inquiry — manufacturer, 120 staff', score: '91' },
      { dot: 'g', text: 'Quote request — medical office', score: '74' },
      { dot: 'r', text: 'Complaint flagged — missing delivery', score: '⚠ Shield', scoreColor: '#ef4444' },
    ],
  },
  dallas: {
    name: 'Dallas', region: 'DFW Metroplex',
    phone: '(513) 822-5130', phoneTel: '+15138225130',
    serviceArea: 'Dallas, Fort Worth, Plano, Frisco, Arlington, and surrounding DFW',
    chatGreeting: 'Hey! 👋 I can help with pricing, service areas, delivery schedules — or put together a quick quote for your DFW operation. What are you looking for?',
    route: {
      id: 'Route 3', stops: 12, est: '8h 40m',
      preview: [
        { name: 'Omni Dallas Hotel', mood: 'g', note: 'Volume up 15% — convention wk' },
        { name: 'Baylor Medical Tower', mood: 'y', note: '⚠ Scrub sizing complaints · 4d' },
        { name: 'Deep Ellum Collective', mood: 'g', note: 'New client · week 3' },
        { name: 'Legacy West Fitness', mood: 'r', note: '🔴 Comparing Cintas pricing' },
      ], flagged: 2,
    },
    dashboard: {
      deliveries: 84, open: 1, spend: '$6.2k', satisfaction: '8.9',
      trend: '↑ 18%', trendPeriod: '6wk', totalDeliveries: 84,
      sparkline: '0,24 25,20 50,16 75,14 100,12 125,10 150,8 175,6 200,3',
    },
    shield: { recent: [9, 9, 7, 8, 4], escalated: '1 complaint elevated · regional mgr notified 8m ago' },
    feed: [
      { dot: 'g', text: 'New inquiry — hotel, convention district', score: '88' },
      { dot: 'a', text: 'Existing customer — add mat program', score: '56' },
      { dot: 'r', text: 'Complaint flagged — quality issue', score: '⚠ Shield', scoreColor: '#ef4444' },
    ],
  },
};

const AIS_PRICING = {
  restaurant: {
    label: 'Restaurant / Food Service', icon: '🍽',
    items: [
      { name: 'Chef coats & pants', perPerson: [5, 7] },
      { name: 'Aprons', perPerson: [1.5, 3] },
      { name: 'Kitchen towels', flat: [40, 80], note: '80–150 towels/wk' },
      { name: 'Table linens', perSeat: [2, 4], seatRatio: 2.5, note: 'per seat/wk' },
      { name: 'Bar mops', flat: [15, 30], note: '50–100/wk' },
      { name: 'Floor mats (3)', flat: [15, 21] },
    ],
  },
  hotel: {
    label: 'Hotel / Hospitality', icon: '🏨',
    items: [
      { name: 'Bath towels (3/room)', perRoom: [3, 5], roomRatio: 4 },
      { name: 'Bed linens (queen sets)', perRoom: [3, 5], roomRatio: 4 },
      { name: 'Pool towels', flat: [30, 60], note: 'seasonal' },
      { name: 'Staff uniforms', perPerson: [5, 7] },
      { name: 'Banquet linens', flat: [40, 100], note: 'event-based' },
      { name: 'Floor mats (6)', flat: [30, 42] },
    ],
  },
  medical: {
    label: 'Medical / Dental', icon: '🏥',
    items: [
      { name: 'Scrubs', perPerson: [6, 9] },
      { name: 'Lab coats', perPerson: [6, 10] },
      { name: 'Patient gowns', flat: [20, 50], note: 'volume based' },
      { name: 'Towels', flat: [25, 50], note: '50–100/wk' },
      { name: 'Floor mats (4)', flat: [20, 28] },
    ],
  },
  manufacturing: {
    label: 'Manufacturing / Industrial', icon: '🏭',
    items: [
      { name: 'Work shirts', perPerson: [4, 6] },
      { name: 'Work pants', perPerson: [4, 6] },
      { name: 'Coveralls', perPerson: [6, 9], note: 'if needed' },
      { name: 'Shop towels', flat: [30, 60], note: '100–200/wk' },
      { name: 'Floor mats (4)', flat: [20, 28] },
    ],
  },
  gym: {
    label: 'Gym / Fitness Center', icon: '💪',
    items: [
      { name: 'Workout towels', perMember: [0.15, 0.25], memberRatio: 15, note: 'per active member' },
      { name: 'Shower towels', perMember: [0.10, 0.18], memberRatio: 15 },
      { name: 'Staff polos / tees', perPerson: [4, 6] },
      { name: 'Floor mats (6)', flat: [30, 42] },
    ],
  },
  salon: {
    label: 'Salon / Spa', icon: '💈',
    items: [
      { name: 'Towels (hair/face)', perPerson: [6, 10], note: '~40/station/wk' },
      { name: 'Capes & smocks', perPerson: [3, 5] },
      { name: 'Robes (spa)', flat: [20, 40], note: 'if applicable' },
      { name: 'Floor mats (2)', flat: [10, 14] },
    ],
  },
  auto: {
    label: 'Auto Detailing / Car Wash', icon: '🚗',
    items: [
      { name: 'Microfiber cloths', perPerson: [3, 5], note: '~30/bay/wk' },
      { name: 'Detail towels', perPerson: [2, 4] },
      { name: 'Floor mats (2)', flat: [10, 14] },
      { name: 'Staff uniforms', perPerson: [4, 6] },
    ],
  },
  office: {
    label: 'Corporate / Office', icon: '🏢',
    items: [
      { name: 'Floor mats (entry + restroom)', flat: [24, 48], note: '6–12 mats' },
      { name: 'Restroom towels', flat: [15, 30], note: 'cloth roll' },
      { name: 'Break room towels', flat: [8, 16] },
    ],
  },
};

function aisCalculateQuote(bizType, headcount) {
  const biz = AIS_PRICING[bizType];
  if (!biz) return null;
  const head = parseInt(headcount) || 0;
  if (head < 1) return null;

  let discount = 1;
  if (head > 200) discount = 0.75;
  else if (head > 100) discount = 0.80;
  else if (head > 50) discount = 0.85;
  else if (head > 25) discount = 0.90;

  const lineItems = [];
  let totalLow = 0, totalHigh = 0;

  for (const item of biz.items) {
    let lo, hi;
    if (item.perPerson) { lo = head * item.perPerson[0]; hi = head * item.perPerson[1]; }
    else if (item.perRoom) { const r = head * (item.roomRatio || 4); lo = r * item.perRoom[0]; hi = r * item.perRoom[1]; }
    else if (item.perMember) { const m = head * (item.memberRatio || 15); lo = m * item.perMember[0]; hi = m * item.perMember[1]; }
    else if (item.perSeat) { const s = head * (item.seatRatio || 2.5); lo = s * item.perSeat[0]; hi = s * item.perSeat[1]; }
    else if (item.flat) { lo = item.flat[0]; hi = item.flat[1]; }
    else continue;

    lo = Math.round(lo * discount);
    hi = Math.round(hi * discount);
    totalLow += lo; totalHigh += hi;
    lineItems.push({ name: item.name, lo, hi, note: item.note || '' });
  }

  return {
    business: biz.label, icon: biz.icon, headcount: head,
    discount: discount < 1 ? Math.round((1 - discount) * 100) + '% volume discount' : null,
    lineItems,
    weeklyLow: totalLow, weeklyHigh: totalHigh,
    monthlyLow: Math.round(totalLow * 4.33), monthlyHigh: Math.round(totalHigh * 4.33),
    annualLow: totalLow * 52, annualHigh: totalHigh * 52,
    includes: ['Pickup & delivery', 'Professional laundering', 'Repairs', 'Replacement', 'Size exchanges'],
  };
}

function aisGetChatResponses(cityKey) {
  const c = AIS_CITIES[cityKey] || AIS_CITIES.miami;
  return [
    `For a 30-person restaurant, uniform service typically runs <strong>$180–360/week</strong> depending on garment types. That includes weekly pickup, delivery, repairs, and replacement. Want me to break it down by item?`,
    `We cover all of <strong>${c.serviceArea}</strong>. Weekly delivery is included at no extra charge. Twice-weekly is available for high-volume accounts.`,
    `Getting started is quick: I can give you a ballpark right now — just tell me your business type and headcount. Or fill out the form below and a specialist follows up within a few hours, <strong>not days</strong>.`,
    `Most popular combo for restaurants: chef coats, pants, aprons, kitchen towels, and tablecloths. We also do floor mats, bar mops, and napkins. I can size a program if you tell me your headcount.`,
    `We're different because every interaction — this chat, phone calls, even your driver visits — feeds into one system. If something goes wrong, we know <strong>before you call</strong>. That's our Service Shield.`,
    `For hotels, pricing depends on room count. A 100-room property typically runs <strong>$1,200–2,000/week</strong> for full bath, bed, and pool towel service. Staff uniforms are separate.`,
    `Medical offices usually go with scrubs + lab coats. For a 20-person practice, that's roughly <strong>$240–380/week</strong> including towels and floor mats.`,
  ];
}
