// Rep Coaching Intelligence API — weekly RSR summaries for Cincinnati pilot

const REPS = [
  {
    id: 'mike-t',
    name: 'Mike T.',
    territory: 'Downtown / Over-the-Rhine',
    accounts_managed: 47,
    health_trend: 'declining',
    health_trend_delta: -4,
    health_trend_emoji: '↓',
    avg_account_health: 72,
    at_risk_accounts: [
      {
        name: 'FC Cincinnati Training Facility',
        risk_reason: '2 wrong-size complaints (jerseys) in 10 days; Dana Loftus has mentioned competitor pricing',
        suggested_action: 'Call Dana before today\'s route. Offer a sizing audit and a complimentary delivery credit. Contract up in 105 days.',
        urgency: 'this_week',
        churn_probability: 0.61,
        contract_value: 64000,
      },
      {
        name: 'Orchids at Palm Court (Hilton)',
        risk_reason: 'Open quality complaint on linens for 4 days; contract renewal in 45 days',
        suggested_action: 'Bring replacement linens and a formal resolution. Chef Reyes needs to see this closed before renewal discussion.',
        urgency: 'this_week',
        churn_probability: 0.41,
        contract_value: 42000,
      },
      {
        name: 'Kroger HQ Campus Cafeteria',
        risk_reason: 'Delivery timing complaint 10 days ago; no documented RSR follow-up on file',
        suggested_action: 'Proactive check-in with Marcus Webb. No complaint is minor when it goes unaddressed for 10 days.',
        urgency: 'this_month',
        churn_probability: 0.28,
        contract_value: 62000,
      },
    ],
    win_of_week: "Locked in 3-year renewal with Fifth Third Arena (Catering Ops) — $95K contract, best retention close of the quarter",
    coaching_focus: "Complaint follow-up speed is your gap. Two accounts (FC Cincinnati, Orchids) have open complaints with no documented RSR contact. Every unaddressed complaint within 48 hours doubles churn probability. Prioritize closures before any new account development this week.",
    metrics: {
      complaints_resolved_this_week: 1,
      avg_days_to_complaint_response: 4.2,
      upsell_opportunities_flagged: 3,
      upsell_closed: 1,
    },
  },
  {
    id: 'sandra-k',
    name: 'Sandra K.',
    territory: 'Northside / Clifton',
    accounts_managed: 38,
    health_trend: 'declining',
    health_trend_delta: -7,
    health_trend_emoji: '↓↓',
    avg_account_health: 65,
    at_risk_accounts: [
      {
        name: 'TriHealth Good Samaritan Hospital',
        risk_reason: '3 active complaints: sizing errors (XS delivered, L ordered), missed Monday pickup, billing dispute. Kevin Marsh has formally requested escalation.',
        suggested_action: 'CALL KEVIN MARSH BEFORE ROUTE. This is your highest-risk account ($78K, renewal in 62 days). Bring a written resolution plan. Escalate to branch manager if needed.',
        urgency: 'this_week',
        churn_probability: 0.71,
        contract_value: 78000,
      },
      {
        name: 'Uptown Fitness Clifton',
        risk_reason: 'Order volume down 15% over 2 months; Chad Evans has been less responsive',
        suggested_action: 'Ask directly: "Are you still happy with the program?" Offer to review their inventory count. Small account but easy win if you catch it now.',
        urgency: 'this_week',
        churn_probability: 0.44,
        contract_value: 28000,
      },
      {
        name: 'Yoga District Clifton',
        risk_reason: 'Sasha Park mentioned competitor pricing last visit; renewal in 30 days',
        suggested_action: 'Proactively offer a loyalty rate lock for 2 years. This account will leave if you wait for her to ask.',
        urgency: 'this_week',
        churn_probability: 0.38,
        contract_value: 14000,
      },
    ],
    win_of_week: "Perfect delivery record at Cincinnati Children's Hospital for 12 consecutive months — Rita Okafor sent a formal commendation to the branch",
    coaching_focus: "You're carrying the two highest-risk accounts on the roster right now. TriHealth is a $78K contract with 3 open complaints — this needs your full attention Monday morning. The pattern across your territory: sizing errors. This is a fulfillment process issue, not a relationship issue. Flag it to ops for a route-level sizing audit.",
    metrics: {
      complaints_resolved_this_week: 0,
      avg_days_to_complaint_response: 5.8,
      upsell_opportunities_flagged: 2,
      upsell_closed: 0,
    },
  },
  {
    id: 'james-r',
    name: 'James R.',
    territory: 'Kenwood / Hyde Park',
    accounts_managed: 52,
    health_trend: 'improving',
    health_trend_delta: 6,
    health_trend_emoji: '↑',
    avg_account_health: 81,
    at_risk_accounts: [
      {
        name: 'Hyde Park Grille',
        risk_reason: 'Owner reduced linen order by 20% after a billing error in November; relationship is cooling',
        suggested_action: 'Bring the corrected invoice and a goodwill credit. Owner Mike Donovan is old-school — in-person apology goes a long way.',
        urgency: 'this_month',
        churn_probability: 0.32,
        contract_value: 38000,
      },
      {
        name: 'Kenwood Towne Marriott',
        risk_reason: 'GM Rachel Bloom mentioned towel pilling in passing — not a formal complaint yet',
        suggested_action: 'Get ahead of it: swap out the oldest towel inventory proactively. Resolve before it becomes a ticket.',
        urgency: 'this_month',
        churn_probability: 0.27,
        contract_value: 56000,
      },
    ],
    win_of_week: "Upsell closed: added full floor mat program at Rookwood Pottery Restaurant ($8,400/yr incremental) after three months of consistent follow-up",
    coaching_focus: "You're the model right now — 6-point health improvement this month. The upsell close at Rookwood is exactly what the branch needs more of. Two things to extend this momentum: (1) document your follow-up cadence so we can share it with the team, and (2) James R. has the most untapped cross-sell opportunities on his route — start with mats and restroom supply pitches at 5 accounts that currently have uniform-only programs.",
    metrics: {
      complaints_resolved_this_week: 2,
      avg_days_to_complaint_response: 1.8,
      upsell_opportunities_flagged: 5,
      upsell_closed: 1,
    },
  },
  {
    id: 'carlos-p',
    name: 'Carlos P.',
    territory: 'Blue Ash / Mason',
    accounts_managed: 41,
    health_trend: 'declining',
    health_trend_delta: -3,
    health_trend_emoji: '↓',
    avg_account_health: 74,
    at_risk_accounts: [
      {
        name: 'Mason Medical Center',
        risk_reason: '2 complaints (wrong sizes, missed pickup), plus a billing dispute. Ellen Torres has sent a formal email to ops.',
        suggested_action: 'Bring a written resolution letter today. Ellen needs documentation that this is fixed — verbal assurance is not enough at this point.',
        urgency: 'this_week',
        churn_probability: 0.68,
        contract_value: 52000,
      },
      {
        name: "P&G Campus Cafeteria (Mason)",
        risk_reason: 'Company-wide vendor audit underway in Q1; Don O\'Brien mentioned "reviewing all service contracts"',
        suggested_action: 'Request a formal meeting with Don and his procurement manager before the audit. Bring a 2-year performance summary.',
        urgency: 'this_week',
        churn_probability: 0.52,
        contract_value: 87000,
      },
      {
        name: 'The Summit Hotel (Blue Ash)',
        risk_reason: 'November billing discrepancy still unresolved after 3 weeks; Carol Webb is tracking it',
        suggested_action: 'Close the billing ticket today. Bring a corrected invoice and offer a credit for the delay.',
        urgency: 'this_week',
        churn_probability: 0.34,
        contract_value: 48000,
      },
    ],
    win_of_week: "Marriott RiverCenter renewed 2-year contract without negotiation — Tom Halloran cited consistent 6am delivery as the deciding factor",
    coaching_focus: "Three at-risk accounts this week — all of them have billing or logistics issues at the root. This is a pattern: Mason Medical (missed pickup), Summit Hotel (billing error), P&G (vendor audit pressure). None of these require exceptional relationship skills; they require operational clean-up. Get billing tickets closed, confirm pickup schedules are locked, and document every resolution. The P&G account ($87K) is the one that needs a manager-level conversation — don't try to hold that alone.",
    metrics: {
      complaints_resolved_this_week: 1,
      avg_days_to_complaint_response: 3.4,
      upsell_opportunities_flagged: 4,
      upsell_closed: 0,
    },
  },
];

const BRANCH_COACHING_SUMMARY = `This week's branch pattern is clear: 7 of 9 active at-risk accounts have unresolved operational issues — wrong sizes, billing errors, or missed pickups — not relationship failures. The fix is upstream. A branch-wide sizing audit is recommended across Routes 7 and 9 before Friday. On the coaching side: Sandra K. needs priority support on TriHealth Good Samaritan ($78K, highest churn risk on the board). James R. is your model this week — his complaint resolution speed (1.8 days avg) and upsell close should be shared with the team. Key metric to track: average days-to-complaint-response. Branch average is currently 3.8 days. Target is under 2. Every day of delay after a complaint doubles the probability of churn.`;

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const repId = url.searchParams.get('rep');
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    if (repId) {
      const rep = REPS.find(r => r.id === repId);
      if (!rep) return new Response(JSON.stringify({ error: 'Rep not found', available: REPS.map(r => r.id) }), { status: 404, headers });
      return new Response(JSON.stringify({ rep, generated_at: new Date().toISOString() }), { headers });
    }

    return new Response(JSON.stringify({
      reps: REPS,
      branch_coaching_summary: BRANCH_COACHING_SUMMARY,
      branch_metrics: {
        total_at_risk_accounts: REPS.reduce((s, r) => s + r.at_risk_accounts.length, 0),
        avg_complaint_response_days: 3.8,
        total_revenue_at_risk: 329000,
        upsell_opportunities_open: 14,
      },
      week_starting: new Date().toISOString().slice(0, 10),
      generated_at: new Date().toISOString(),
      pilot: 'Cincinnati — 90-Day Pilot Demo',
    }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
