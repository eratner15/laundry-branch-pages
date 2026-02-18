// Route Intel — driver briefings and account deep-dives
// Supports Miami routes (route-12 legacy) + Cincinnati pilot routes (route-7, route-9, route-15)

const DEMO_ROUTES = {
  // ── LEGACY MIAMI ROUTE (preserved) ──────────────────────────────────────────
  'route-12': {
    route_id: 'route-12',
    driver: 'Carlos M.',
    territory: 'Miami Beach / South Beach',
    stops: 4,
    accounts: [
      {
        stop_number: 1, id: 'miami-beach-resort', name: 'Miami Beach Resort & Spa',
        address: '2300 Collins Ave, Miami Beach, FL', type: 'hotel_resort',
        contact: 'Marisol Reyes (GM)', contact_name: 'Marisol Reyes', contact_title: 'General Manager',
        phone: '(305) 555-0142', notes: 'Prefer delivery before 8am. Pool towel count runs high on weekends.',
        weekly_pieces: 320, open_issues: 0, account_health: 'green', health_score: 88, cross_sell_flag: null,
        last_delivery_rating: 'on_time', talking_points: ['Confirm weekend towel inventory', 'Discuss upcoming season volume'],
        est_arrival: '7:00 AM', service_duration_min: 30,
      },
      {
        stop_number: 2, id: 'sanctuary-spa', name: 'The Sanctuary Spa',
        address: '1680 James Ave, Miami Beach, FL', type: 'spa_salon',
        contact: 'Dr. Elena Voss', contact_name: 'Elena Voss', contact_title: 'Spa Director',
        phone: '(305) 555-0288', notes: 'Very particular about fold style on face cloths. Check in with front desk only.',
        weekly_pieces: 85, open_issues: 1, account_health: 'yellow', health_score: 65, cross_sell_flag: null,
        at_risk_summary: 'One open quality complaint — confirm resolution on arrival.',
        last_delivery_rating: 'on_time', talking_points: ['Confirm quality complaint is resolved', 'Ask about fold style satisfaction'],
        est_arrival: '8:00 AM', service_duration_min: 20,
      },
      {
        stop_number: 3, id: 'sunset-hoa', name: 'Sunset Palms HOA',
        address: '400 Meridian Ave, Miami Beach, FL', type: 'hoa_condo',
        contact: 'Raul Fontaine (Property Mgr)', contact_name: 'Raul Fontaine', contact_title: 'Property Manager',
        phone: '(305) 555-0399', notes: 'Pool closed Tuesdays. Leave with concierge.',
        weekly_pieces: 150, open_issues: 0, account_health: 'green', health_score: 91, cross_sell_flag: null,
        last_delivery_rating: 'on_time', talking_points: ['Leave with concierge if Raul not available', 'Note pool day closure'],
        est_arrival: '9:00 AM', service_duration_min: 15,
      },
      {
        stop_number: 4, id: 'ocean-drive-bistro', name: 'Ocean Drive Bistro',
        address: '918 Ocean Dr, Miami Beach, FL', type: 'restaurant',
        contact: 'Chef Marco', contact_name: 'Chef Marco', contact_title: 'Executive Chef',
        phone: '(305) 555-0471', notes: 'Kitchen towels and napkins. Needs chef coats on first of month.',
        weekly_pieces: 60, open_issues: 0, account_health: 'green', health_score: 87, cross_sell_flag: 'first_aid',
        last_delivery_rating: 'on_time', talking_points: ['Check if first of month — deliver chef coats', 'Pitch first aid cabinet program'],
        est_arrival: '10:00 AM', service_duration_min: 15,
      },
    ],
  },

  // ── CINCINNATI PILOT ROUTES ──────────────────────────────────────────────────
  'route-7': {
    route_id: 'route-7',
    driver: 'Mike T.',
    territory: 'Downtown / Over-the-Rhine',
    pilot: true,
    stops: 12,
    accounts: [
      {
        stop_number: 1, id: 'precinct-restaurant', name: 'The Precinct',
        address: '311 Delta Ave, Cincinnati, OH 45226', type: 'restaurant',
        contact: 'Tom Brennan (GM)', contact_name: 'Tom Brennan', contact_title: 'General Manager',
        phone: '(513) 321-5454', notes: 'High-volume steakhouse — linen-intensive. Table napkins must be pressed. Chef coats weekly.',
        weekly_pieces: 420, open_issues: 0, account_health: 'green', health_score: 91, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm napkin press quality', 'Ask about prospect referral follow-up', 'Monthly chef coat inventory check'],
        est_arrival: '6:30 AM', service_duration_min: 25,
      },
      {
        stop_number: 2, id: 'fc-cincinnati', name: 'FC Cincinnati Training Facility',
        address: '1400 Sports Dr, Newport, KY 41071', type: 'fitness',
        contact: 'Dana Loftus (Ops Mgr)', contact_name: 'Dana Loftus', contact_title: 'Operations Manager',
        phone: '(513) 977-5425', notes: 'Uniform + towel program. Count spikes on match days — confirm inventory Tuesday.',
        weekly_pieces: 680, open_issues: 2, account_health: 'red', health_score: 38, cross_sell_flag: 'first_aid',
        at_risk_summary: '2 open complaints: wrong jersey sizes for 2nd week running. Dana mentioned exploring Cintas direct. Call before you knock.',
        last_delivery_rating: 'delayed',
        talking_points: ['CALL DANA BEFORE ARRIVAL — competitor pricing mentioned', 'Deliver sizing audit offer', 'Bring service credit authorization', 'First aid cabinet pitch (if relationship allows)'],
        est_arrival: '7:30 AM', service_duration_min: 40,
      },
      {
        stop_number: 3, id: '21c-museum-hotel', name: '21c Museum Hotel',
        address: '609 Walnut St, Cincinnati, OH 45202', type: 'hotel_resort',
        contact: 'Priya Sharma (Dir of Ops)', contact_name: 'Priya Sharma', contact_title: 'Director of Operations',
        phone: '(513) 578-6600', notes: 'Boutique property — quality matters more than speed. Delivery must be before 7am.',
        weekly_pieces: 310, open_issues: 0, account_health: 'green', health_score: 94, cross_sell_flag: 'restroom',
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm 7am delivery window maintained', 'Pitch premium restroom supply program', 'Check linen quality satisfaction with Priya'],
        est_arrival: '8:30 AM', service_duration_min: 20,
      },
      {
        stop_number: 4, id: 'orchids-palm-court', name: 'Orchids at Palm Court (Hilton)',
        address: '35 W 5th St, Cincinnati, OH 45202', type: 'restaurant',
        contact: 'Chef Adriana Reyes', contact_name: 'Adriana Reyes', contact_title: 'Executive Chef',
        phone: '(513) 421-9100', notes: 'Fine dining — white tablecloths, pressed napkins, server vests. No substitutions.',
        weekly_pieces: 290, open_issues: 1, account_health: 'yellow', health_score: 58, cross_sell_flag: null,
        at_risk_summary: 'One linen quality complaint open 4 days. Contract renewal in 45 days — make it right today.',
        last_delivery_rating: 'on_time',
        talking_points: ['Bring replacement linens — close the open quality complaint', 'Initiate early renewal conversation', 'No item substitutions — verify all counts match order'],
        est_arrival: '9:00 AM', service_duration_min: 30,
      },
      {
        stop_number: 5, id: 'tafts-ale-house', name: "Taft's Ale House",
        address: '1429 Race St, Cincinnati, OH 45202', type: 'restaurant',
        contact: 'Kris Miller (Owner)', contact_name: 'Kris Miller', contact_title: 'Owner',
        phone: '(513) 334-1393', notes: 'Craft brewery + restaurant. Bar mops, aprons, kitchen towels. Delivery any time after 10am.',
        weekly_pieces: 140, open_issues: 0, account_health: 'green', health_score: 88, cross_sell_flag: 'mats',
        last_delivery_rating: 'on_time',
        talking_points: ["CLOSE THE FLOOR MAT UPSELL — Kris has asked twice", 'Bar mop count review', 'Confirm delivery window preference'],
        est_arrival: '10:00 AM', service_duration_min: 15,
      },
      {
        stop_number: 6, id: 'otr-brewing', name: 'OTR Brewing Company',
        address: '167 Broadway St, Cincinnati, OH 45202', type: 'restaurant',
        contact: 'Sam Ortega (Ops)', contact_name: 'Sam Ortega', contact_title: 'Operations Manager',
        phone: '(513) 246-3740', notes: 'Bar mops and aprons only. Small account — growth potential.',
        weekly_pieces: 55, open_issues: 0, account_health: 'green', health_score: 87, cross_sell_flag: 'restroom',
        last_delivery_rating: 'on_time',
        talking_points: ['Pitch restroom supply program — growing account', 'Review bar mop counts', 'Ask Sam about expansion plans'],
        est_arrival: '10:30 AM', service_duration_min: 10,
      },
      {
        stop_number: 7, id: 'findlay-market-anchor', name: 'Findlay Market (Anchor Stalls)',
        address: '1801 Race St, Cincinnati, OH 45202', type: 'other',
        contact: 'Beth Kramer (Market Dir)', contact_name: 'Beth Kramer', contact_title: 'Market Director',
        phone: '(513) 665-4839', notes: 'Multiple stalls sharing delivery. Coordinate with Beth — stall list on file.',
        weekly_pieces: 95, open_issues: 0, account_health: 'green', health_score: 82, cross_sell_flag: 'first_aid',
        last_delivery_rating: 'on_time',
        talking_points: ['Review stall list with Beth on arrival', 'Pitch first aid cabinet for market ops', 'Confirm all anchor stalls satisfied'],
        est_arrival: '11:00 AM', service_duration_min: 20,
      },
      {
        stop_number: 8, id: 'contemporary-arts-ctr', name: 'Contemporary Arts Center',
        address: '44 E 6th St, Cincinnati, OH 45202', type: 'other',
        contact: 'Lee Park (Events Mgr)', contact_name: 'Lee Park', contact_title: 'Events Manager',
        phone: '(513) 345-8400', notes: 'Event-driven volume. Always check event calendar — linens surge on opening nights.',
        weekly_pieces: 120, open_issues: 0, account_health: 'green', health_score: 83, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Check upcoming event calendar with Lee', 'Confirm linen inventory for any opening nights', 'Ask about Q2 event schedule'],
        est_arrival: '11:30 AM', service_duration_min: 15,
      },
      {
        stop_number: 9, id: 'st-elizabeth-downtown', name: 'St. Elizabeth Healthcare (Downtown Clinic)',
        address: '120 E 4th St, Cincinnati, OH 45202', type: 'medical',
        contact: 'Nurse Manager J. Walsh', contact_name: 'J. Walsh', contact_title: 'Nurse Manager',
        phone: '(859) 572-3100', notes: 'Lab coats and scrubs only. HIPAA-compliant delivery required. No contact with patients.',
        weekly_pieces: 210, open_issues: 0, account_health: 'green', health_score: 89, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Deliver to supply dock only — no patient areas', 'Confirm HIPAA delivery protocol followed', 'Verify lab coat sizes match order'],
        est_arrival: '12:00 PM', service_duration_min: 20,
      },
      {
        stop_number: 10, id: 'kroger-hq-cafe', name: 'Kroger HQ Campus Cafeteria',
        address: '1014 Vine St, Cincinnati, OH 45202', type: 'other',
        contact: 'Marcus Webb (Facilities)', contact_name: 'Marcus Webb', contact_title: 'Facilities Manager',
        phone: '(513) 762-4000', notes: 'Corporate cafeteria — aprons, kitchen towels, chef coats. Volume steady, low maintenance.',
        weekly_pieces: 185, open_issues: 0, account_health: 'yellow', health_score: 65, cross_sell_flag: 'mats',
        at_risk_summary: 'Minor delivery timing complaint 10 days ago. No follow-up from RSR on file — check in proactively.',
        last_delivery_rating: 'delayed',
        talking_points: ['Proactive check-in with Marcus on timing complaint', 'Pitch floor mat program for cafeteria', 'Document the follow-up in CRM today'],
        est_arrival: '12:45 PM', service_duration_min: 20,
      },
      {
        stop_number: 11, id: 'fifth-third-arena-catering', name: 'Fifth Third Arena (Catering Ops)',
        address: "2751 O'Varsity Way, Cincinnati, OH 45221", type: 'other',
        contact: 'Ray Dominguez (Catering Dir)', contact_name: 'Ray Dominguez', contact_title: 'Catering Director',
        phone: '(513) 556-4196', notes: 'Event-based volume — massive surges during UC basketball season. Plan ahead.',
        weekly_pieces: 380, open_issues: 0, account_health: 'green', health_score: 73, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Check upcoming basketball schedule for volume surges', 'Introduce yourself to Ray — new contact', 'Discuss fire protection service add-on'],
        est_arrival: '1:30 PM', service_duration_min: 30,
      },
      {
        stop_number: 12, id: 'enquirer-building-corp', name: 'The Enquirer Building (Corporate Services)',
        address: '312 Elm St, Cincinnati, OH 45202', type: 'other',
        contact: 'Janet Foley (Facilities)', contact_name: 'Janet Foley', contact_title: 'Facilities Manager',
        phone: '(513) 721-2700', notes: 'Restroom supplies and facility mats. Simple account, consistent.',
        weekly_pieces: 70, open_issues: 0, account_health: 'green', health_score: 90, cross_sell_flag: 'fire_protection',
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm mat count with Janet', 'Pitch fire protection services', 'Quick visit — leave if Janet not available'],
        est_arrival: '2:15 PM', service_duration_min: 10,
      },
    ],
  },

  'route-9': {
    route_id: 'route-9',
    driver: 'Sandra K.',
    territory: 'Northside / Clifton',
    pilot: true,
    stops: 10,
    accounts: [
      {
        stop_number: 1, id: 'uc-health-univ-hospital', name: 'UC Health University Hospital',
        address: '234 Goodman St, Cincinnati, OH 45219', type: 'medical',
        contact: 'Supply Chain: Maria L.', contact_name: 'Maria L.', contact_title: 'Supply Chain Manager',
        phone: '(513) 584-1000', notes: 'Large scrubs/lab coat program. Must coordinate with supply chain — never delivery dock directly.',
        weekly_pieces: 980, open_issues: 0, account_health: 'green', health_score: 82, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Coordinate with Maria directly — never dock delivery', 'Confirm counts with supply chain on arrival', 'Note renewal window: 120 days — schedule review meeting'],
        est_arrival: '6:00 AM', service_duration_min: 45,
      },
      {
        stop_number: 2, id: 'trihealth-good-sam', name: 'TriHealth Good Samaritan Hospital',
        address: '375 Dixmyth Ave, Cincinnati, OH 45220', type: 'medical',
        contact: 'Kevin Marsh (Ops Dir)', contact_name: 'Kevin Marsh', contact_title: 'Operations Director',
        phone: '(513) 862-1400', notes: 'CRITICAL ACCOUNT. Wrong scrub sizes for 3rd consecutive week. Kevin is on the verge of escalating.',
        weekly_pieces: 1240, open_issues: 3, account_health: 'red', health_score: 28, cross_sell_flag: null,
        at_risk_summary: '3 active complaints — sizing errors (XS scrubs delivered, L ordered), missed Monday delivery, billing dispute. Contract value $78K/yr. Renewal in 60 days. Kevin has requested escalation meeting. Sandra: call Kevin before route today.',
        last_delivery_rating: 'delayed',
        talking_points: ['CALL KEVIN BEFORE ARRIVAL — escalation requested', 'Bring written resolution plan for all 3 complaints', 'Offer billing credit authorization', 'Do not leave without a signed resolution acknowledgment'],
        est_arrival: '7:30 AM', service_duration_min: 60,
      },
      {
        stop_number: 3, id: 'cincinnati-childrens', name: "Cincinnati Children's Hospital (Clifton Campus)",
        address: '3333 Burnet Ave, Cincinnati, OH 45229', type: 'medical',
        contact: 'Rita Okafor (Materials Mgmt)', contact_name: 'Rita Okafor', contact_title: 'Materials Management',
        phone: '(513) 636-4200', notes: 'Pediatric-compliant handling. White lab coats and scrubs only. Perfect record here — maintain it.',
        weekly_pieces: 760, open_issues: 0, account_health: 'green', health_score: 97, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Perfect record — maintain it', 'White coats and scrubs only — no color mixing', 'Ask Rita about case study / testimonial opportunity'],
        est_arrival: '9:15 AM', service_duration_min: 35,
      },
      {
        stop_number: 4, id: 'xavier-university', name: 'Xavier University',
        address: '3800 Victory Pkwy, Cincinnati, OH 45207', type: 'other',
        contact: 'Facilities Coordinator', contact_name: 'Patricia Coen', contact_title: 'Facilities Director',
        phone: '(513) 745-3000', notes: 'University dining and facilities. Volume dips in summer — right-size the program proactively.',
        weekly_pieces: 280, open_issues: 0, account_health: 'yellow', health_score: 74, cross_sell_flag: 'mats',
        at_risk_summary: 'Order volume declining 10% — likely seasonal, but relationship check needed. Renewal in 140 days.',
        last_delivery_rating: 'on_time',
        talking_points: ['Meet with Patricia Coen — new to role', 'Discuss seasonal volume adjustment plan', 'Pitch floor mat program for common areas'],
        est_arrival: '10:30 AM', service_duration_min: 25,
      },
      {
        stop_number: 5, id: 'uptown-fitness-clifton', name: 'Uptown Fitness Clifton',
        address: '414 Ludlow Ave, Cincinnati, OH 45220', type: 'fitness',
        contact: 'Chad Evans (GM)', contact_name: 'Chad Evans', contact_title: 'General Manager',
        phone: '(513) 288-0100', notes: 'Towel program only. Count has dropped 15% over 2 months.',
        weekly_pieces: 110, open_issues: 1, account_health: 'yellow', health_score: 62, cross_sell_flag: 'first_aid',
        at_risk_summary: 'Declining order volume — possible membership drop or considering competing service. Check in with Chad on account health.',
        last_delivery_rating: 'on_time',
        talking_points: ['Ask Chad directly: "Are you still happy with the program?"', 'Offer inventory count review', 'Pitch first aid cabinet — fits fitness context'],
        est_arrival: '11:30 AM', service_duration_min: 15,
      },
      {
        stop_number: 6, id: 'uc-dining-commons', name: 'UC Dining Commons (Main Campus)',
        address: '2820 Bearcat Way, Cincinnati, OH 45219', type: 'other',
        contact: 'Facilities Coordinator', contact_name: 'Dining Facilities', contact_title: 'Facilities Coordinator',
        phone: '(513) 556-2910', notes: 'University dining — large apron + kitchen towel program. Seasonal volume dips in summer.',
        weekly_pieces: 320, open_issues: 0, account_health: 'green', health_score: 80, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm summer count adjustment plan', 'Review apron and kitchen towel inventory levels', 'Check if dining hours have changed'],
        est_arrival: '12:15 PM', service_duration_min: 20,
      },
      {
        stop_number: 7, id: 'northside-tavern', name: 'Northside Tavern',
        address: '4163 Hamilton Ave, Cincinnati, OH 45223', type: 'restaurant',
        contact: 'Donna Miles (Owner)', contact_name: 'Donna Miles', contact_title: 'Owner',
        phone: '(513) 542-3603', notes: 'Bar towels and aprons. Low volume, loyal customer. Always pays early.',
        weekly_pieces: 30, open_issues: 0, account_health: 'green', health_score: 93, cross_sell_flag: 'restroom',
        last_delivery_rating: 'on_time',
        talking_points: ['Quick delivery — Donna is easy', 'Pitch restroom supply program', 'Ask for a referral — loyal long-term customer'],
        est_arrival: '1:00 PM', service_duration_min: 10,
      },
      {
        stop_number: 8, id: 'clifton-market-coop', name: 'Clifton Market Co-op',
        address: '376 Ludlow Ave, Cincinnati, OH 45220', type: 'other',
        contact: 'Ana Ruiz (Store Mgr)', contact_name: 'Ana Ruiz', contact_title: 'Store Manager',
        phone: '(513) 931-8000', notes: 'Grocery co-op. Aprons and floor mats. Friendly account.',
        weekly_pieces: 50, open_issues: 0, account_health: 'green', health_score: 88, cross_sell_flag: 'mats',
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm mat and apron counts with Ana', 'Ask about expansion — co-op has been growing'],
        est_arrival: '1:30 PM', service_duration_min: 10,
      },
      {
        stop_number: 9, id: 'yoga-district-clifton', name: 'Yoga District Clifton',
        address: '255 Ludlow Ave, Cincinnati, OH 45220', type: 'fitness',
        contact: 'Sasha Park (Studio Owner)', contact_name: 'Sasha Park', contact_title: 'Studio Owner',
        phone: '(513) 731-9642', notes: 'Towel program. Mentioned a competitor quote last month — price sensitive.',
        weekly_pieces: 45, open_issues: 1, account_health: 'yellow', health_score: 68, cross_sell_flag: 'mats',
        at_risk_summary: 'Mentioned Cintas competitor pricing last visit. Small account but sentiment is declining. Offer loyalty pricing if prompted.',
        last_delivery_rating: 'on_time',
        talking_points: ['Offer 2-year loyalty rate lock proactively', 'Do not wait for Sasha to raise competitor quote', 'Renewal in 30 days — this is urgent'],
        est_arrival: '2:00 PM', service_duration_min: 10,
      },
      {
        stop_number: 10, id: 'clifton-heights-rehab', name: 'Clifton Heights Physical Therapy',
        address: '200 William Howard Taft Rd, Cincinnati, OH 45219', type: 'medical',
        contact: 'Dr. Michael Cho', contact_name: 'Dr. Michael Cho', contact_title: 'Practice Owner',
        phone: '(513) 281-3440', notes: 'Small clinic. Lab coats and therapy towels. Long-term account, consistent payer.',
        weekly_pieces: 65, open_issues: 0, account_health: 'green', health_score: 88, cross_sell_flag: 'first_aid',
        last_delivery_rating: 'on_time',
        talking_points: ['Quick delivery — confirm lab coat and towel counts', 'Pitch first aid cabinet — perfect fit for PT clinic', 'Long-term account — ask for referral'],
        est_arrival: '2:30 PM', service_duration_min: 10,
      },
    ],
  },

  'route-15': {
    route_id: 'route-15',
    driver: 'Carlos P.',
    territory: 'Blue Ash / Mason',
    pilot: true,
    stops: 11,
    accounts: [
      {
        stop_number: 1, id: 'mason-medical-center', name: 'Mason Medical Center',
        address: '5975 Deerfield Blvd, Mason, OH 45040', type: 'medical',
        contact: 'Ellen Torres (Admin Dir)', contact_name: 'Ellen Torres', contact_title: 'Administrative Director',
        phone: '(513) 336-7700', notes: 'Scrubs and lab coats. Ellen is meticulous — any issue gets escalated same day.',
        weekly_pieces: 520, open_issues: 2, account_health: 'red', health_score: 33, cross_sell_flag: null,
        at_risk_summary: '2 complaints: wrong sizes delivered and a missed pickup. Ellen sent a formal email to ops. $52K contract, renewal in 90 days. Bring a resolution letter today.',
        last_delivery_rating: 'missed',
        talking_points: ['Bring WRITTEN resolution letter — Ellen requires documentation', 'Confirm new pickup schedule in writing', 'Offer service credit for missed pickup', 'Do not leave without Ellen\'s signature on resolution plan'],
        est_arrival: '6:15 AM', service_duration_min: 45,
      },
      {
        stop_number: 2, id: 'marriott-rivercenter', name: 'Marriott at RiverCenter',
        address: '10 W RiverCenter Blvd, Covington, KY 41011', type: 'hotel_resort',
        contact: 'Tom Halloran (Dir Housekeeping)', contact_name: 'Tom Halloran', contact_title: 'Director of Housekeeping',
        phone: '(859) 261-2900', notes: 'Premium property. High linen standards — zero defects expected. Delivery by 6am.',
        weekly_pieces: 890, open_issues: 0, account_health: 'green', health_score: 95, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['6am delivery window — do not be late', 'Confirm zero defects standard maintained', 'Ask Tom for Marriott regional referral'],
        est_arrival: '7:30 AM', service_duration_min: 40,
      },
      {
        stop_number: 3, id: 'blue-ash-sports-center', name: 'Blue Ash Sports Center',
        address: '11380 Century Cir E, Blue Ash, OH 45242', type: 'fitness',
        contact: 'Amanda Nguyen (Ops Mgr)', contact_name: 'Amanda Nguyen', contact_title: 'Operations Manager',
        phone: '(513) 745-8500', notes: 'Towel program + uniforms for staff. Seasonal volume spike in Jan-Feb.',
        weekly_pieces: 280, open_issues: 0, account_health: 'green', health_score: 85, cross_sell_flag: 'first_aid',
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm Jan-Feb seasonal volume is covered', 'Pitch first aid cabinet — sports facility context', 'Review staff uniform counts with Amanda'],
        est_arrival: '8:45 AM', service_duration_min: 20,
      },
      {
        stop_number: 4, id: 'blue-ash-surgery-ctr', name: 'Blue Ash Surgery Center',
        address: '4760 E Galbraith Rd, Blue Ash, OH 45236', type: 'medical',
        contact: 'Patricia Moore (OR Coordinator)', contact_name: 'Patricia Moore', contact_title: 'OR Coordinator',
        phone: '(513) 563-9797', notes: 'Surgical gowns and scrubs. Sterile handling required. No exceptions.',
        weekly_pieces: 430, open_issues: 0, account_health: 'green', health_score: 92, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Sterile handling protocol — no exceptions', 'Confirm gown and scrub counts with Patricia', 'Ask about minor volume decline — scheduling changes?'],
        est_arrival: '9:30 AM', service_duration_min: 25,
      },
      {
        stop_number: 5, id: 'skyline-chili-corp', name: 'Skyline Chili (Corporate Accounts)',
        address: '3942 Miami Rd, Cincinnati, OH 45241', type: 'restaurant',
        contact: 'Corporate Ops: Brian Kim', contact_name: 'Brian Kim', contact_title: 'Corporate Operations',
        phone: '(513) 769-6400', notes: 'Covers 7 corporate-owned locations. Brian handles all locations centrally. Single invoice.',
        weekly_pieces: 700, open_issues: 0, account_health: 'green', health_score: 88, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm all 7 locations satisfied via Brian', 'Single invoice confirmed — no per-location billing', 'Pitch fire protection services across corporate portfolio'],
        est_arrival: '10:15 AM', service_duration_min: 20,
      },
      {
        stop_number: 6, id: 'procter-gamble-cafeteria', name: 'P&G Campus Cafeteria (Mason)',
        address: '8700 Mason-Montgomery Rd, Mason, OH 45040', type: 'other',
        contact: "Facilities: Don O'Brien", contact_name: "Don O'Brien", contact_title: 'Facilities Manager',
        phone: '(513) 983-1100', notes: 'Large corporate cafeteria. Steady volume, easy account. Don is very reliable.',
        weekly_pieces: 410, open_issues: 0, account_health: 'yellow', health_score: 51, cross_sell_flag: 'mats',
        at_risk_summary: 'Procurement review underway — Don mentioned a company-wide vendor audit in Q1. Reach out proactively about contract renewal.',
        last_delivery_rating: 'on_time',
        talking_points: ['Request formal meeting with Don + procurement manager', 'Bring 2-year performance summary', 'Pitch floor mat program — easy add-on conversation'],
        est_arrival: '11:00 AM', service_duration_min: 25,
      },
      {
        stop_number: 7, id: 'mason-grill-restaurant', name: 'The Mason Grill',
        address: '6801 Mason-Montgomery Rd, Mason, OH 45040', type: 'restaurant',
        contact: 'Owner: Steve Gallo', contact_name: 'Steve Gallo', contact_title: 'Owner',
        phone: '(513) 459-1900', notes: 'Table linens, napkins, chef coats. Steve prefers morning delivery.',
        weekly_pieces: 190, open_issues: 0, account_health: 'green', health_score: 87, cross_sell_flag: 'restroom',
        last_delivery_rating: 'on_time',
        talking_points: ['Morning delivery — Steve prefers early', 'Pitch restroom supply program', 'Confirm chef coat and napkin counts'],
        est_arrival: '11:45 AM', service_duration_min: 15,
      },
      {
        stop_number: 8, id: 'kenwood-towne-marriott', name: 'Kenwood Towne Courtyard (Marriott)',
        address: '7500 Kenwood Rd, Cincinnati, OH 45236', type: 'hotel_resort',
        contact: 'GM: Rachel Bloom', contact_name: 'Rachel Bloom', contact_title: 'General Manager',
        phone: '(513) 792-4800', notes: 'Standard Marriott program. Rachel recently mentioned some inconsistency in towel quality.',
        weekly_pieces: 560, open_issues: 1, account_health: 'yellow', health_score: 56, cross_sell_flag: 'restroom',
        at_risk_summary: 'Quality comment from GM about towel pilling — not yet a formal complaint. Address proactively.',
        last_delivery_rating: 'on_time',
        talking_points: ['Proactively swap oldest towel inventory today', 'Follow up in writing with Rachel after delivery', 'Pitch restroom supply upgrade for guest experience'],
        est_arrival: '12:30 PM', service_duration_min: 30,
      },
      {
        stop_number: 9, id: 'anderson-township-medical', name: 'Anderson Township Medical Group',
        address: '7675 Beechmont Ave, Cincinnati, OH 45255', type: 'medical',
        contact: 'Office Manager: Lisa Barr', contact_name: 'Lisa Barr', contact_title: 'Office Manager',
        phone: '(513) 232-5000', notes: 'Multi-physician practice. Lab coats and scrubs. Very organized — always confirm counts in advance.',
        weekly_pieces: 145, open_issues: 0, account_health: 'green', health_score: 77, cross_sell_flag: null,
        last_delivery_rating: 'on_time',
        talking_points: ['Confirm counts before arrival — Lisa is meticulous', 'Offer complimentary inventory count audit', 'Ask about minor volume decline — is it seasonal?'],
        est_arrival: '1:15 PM', service_duration_min: 15,
      },
      {
        stop_number: 10, id: 'blue-ash-brewing', name: 'Blue Ash Brewing Company',
        address: '4233 Cooper Rd, Blue Ash, OH 45242', type: 'restaurant',
        contact: 'Mike Frazier (Owner)', contact_name: 'Mike Frazier', contact_title: 'Owner',
        phone: '(513) 792-0900', notes: 'Bar mops and aprons. Good account. Mike has asked about floor mats twice — pitch today.',
        weekly_pieces: 80, open_issues: 0, account_health: 'green', health_score: 90, cross_sell_flag: 'mats',
        last_delivery_rating: 'on_time',
        talking_points: ['CLOSE THE FLOOR MAT UPSELL — Mike has asked twice', 'Confirm bar mop and apron counts', 'Document upsell close in CRM'],
        est_arrival: '1:45 PM', service_duration_min: 15,
      },
      {
        stop_number: 11, id: 'summit-hotel-blue-ash', name: 'The Summit Hotel (Blue Ash)',
        address: '7500 Walton Creek Rd, Blue Ash, OH 45242', type: 'hotel_resort',
        contact: 'Housekeeping Dir: Carol Webb', contact_name: 'Carol Webb', contact_title: 'Housekeeping Director',
        phone: '(513) 745-6300', notes: 'Mid-tier property. Towels and bed linens. Carol mentioned a billing issue last month.',
        weekly_pieces: 400, open_issues: 1, account_health: 'yellow', health_score: 66, cross_sell_flag: null,
        at_risk_summary: 'Billing discrepancy on November invoice — still unresolved. Carol is tracking it. Get this closed today.',
        last_delivery_rating: 'on_time',
        talking_points: ['Bring corrected November invoice', 'Offer credit for the billing delay', 'Document resolution — renewal in 75 days'],
        est_arrival: '2:15 PM', service_duration_min: 20,
      },
    ],
  },
};

function healthIcon(health) {
  if (health === 'green') return '🟢';
  if (health === 'yellow') return '🟡';
  if (health === 'red') return '🔴';
  return '🟢';
}

function healthLabel(health) {
  if (health === 'red') return 'AT RISK';
  if (health === 'yellow') return 'MONITOR';
  return 'HEALTHY';
}

function crossSellLabel(flag) {
  const map = { mats: 'Floor Mats Available', restroom: 'Restroom Supply Program', first_aid: 'First Aid Cabinets', fire_protection: 'Fire Protection Services' };
  return map[flag] || flag;
}

function deliveryRatingHtml(rating) {
  if (rating === 'on_time') return '<span style="color:#43a047">✓ On Time</span>';
  if (rating === 'delayed') return '<span style="color:#ff9800">⚠ Delayed</span>';
  if (rating === 'missed') return '<span style="color:#e53935">✗ Missed</span>';
  return '—';
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
  const atRiskCount = route.accounts.filter(a => a.account_health === 'red').length;
  const isPilot = !!route.pilot;

  const accountsHtml = route.accounts.map((account, idx) => {
    const shield = shieldByBusiness[account.id] || [];
    const latestShield = shield[0];
    const mood = latestShield ? moodIcon(latestShield.sentiment) : healthIcon(account.account_health);
    const hasComplaint = shield.some(s => s.is_complaint) || account.open_issues > 0;
    const hasChurnRisk = shield.some(s => s.churn_risk) || account.account_health === 'red';
    const isAtRisk = account.account_health === 'red';
    const isMonitor = account.account_health === 'yellow';
    const stopNum = account.stop_number || (idx + 1);
    const autoExpand = isAtRisk;
    const cardId = `stop-${account.id}`;

    const borderColor = isAtRisk ? '#e53935' : isMonitor ? '#ff9800' : '#2c3750';
    const healthDot = isAtRisk ? '🔴' : isMonitor ? '🟡' : '🟢';

    const talkingPointsHtml = (account.talking_points || []).map(tp =>
      `<li style="margin-bottom:4px">${tp}</li>`
    ).join('');

    const crossSellHtml = account.cross_sell_flag ? `
      <div style="background:rgba(0,61,165,0.12);border:1px solid rgba(0,61,165,0.25);padding:10px;border-radius:6px;margin-top:10px">
        <div style="font-size:10px;color:#6b9fd4;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px">Cross-Sell Opportunity</div>
        <div style="font-size:13px;color:#90bef0;font-weight:500">📦 ${crossSellLabel(account.cross_sell_flag)}</div>
      </div>` : '';

    const atRiskHtml = account.at_risk_summary ? `
      <div style="background:rgba(229,57,53,0.1);border:1px solid rgba(229,57,53,0.3);padding:10px 14px;border-radius:6px;font-size:13px;color:#ef5350;margin-top:10px;line-height:1.5">
        🚨 <strong>ACTION REQUIRED:</strong> ${account.at_risk_summary}
      </div>` : '';

    const complaintHtml = !account.at_risk_summary && hasComplaint ? `
      <div style="background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.3);padding:8px 12px;border-radius:6px;font-size:12px;color:#ff9800;margin-top:10px">
        ⚠️ Recent complaint on file — be proactive${hasChurnRisk ? ' · Churn risk elevated' : ''}
      </div>` : '';

    return `
<div class="stop-card" id="${cardId}" data-expanded="${autoExpand ? 'true' : 'false'}" style="border:1px solid ${borderColor};border-radius:10px;margin-bottom:10px;overflow:hidden;${isAtRisk ? 'border-left:4px solid #e53935;' : isMonitor ? 'border-left:4px solid #ff9800;' : ''}">
  <div class="stop-header" onclick="toggleStop('${cardId}')" style="background:#1e2840;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;">
    <div style="display:flex;align-items:center;gap:10px;min-width:0;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;color:#8899a6;background:#2c3750;padding:3px 8px;border-radius:3px;flex-shrink:0">STOP ${stopNum}</div>
      <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${account.name}</div>
      <div style="flex-shrink:0">${healthDot}</div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;margin-left:10px;">
      <div style="font-size:12px;color:#8899a6">${account.est_arrival || ''}</div>
      <div class="stop-chevron" style="font-size:14px;color:#8899a6;transition:transform 0.25s;transform:${autoExpand ? 'rotate(180deg)' : 'rotate(0deg)'}">▼</div>
    </div>
  </div>
  <div class="stop-body" style="display:${autoExpand ? 'block' : 'none'};padding:0 20px 20px;background:#1e2840;border-top:1px solid #2c3750;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-top:14px;margin-bottom:12px">
      <div>
        <div style="font-size:12px;color:#8899a6">${account.address}</div>
        <div style="font-size:13px;margin-top:4px"><strong>${account.contact_name || account.contact}</strong>${account.contact_title ? ` · <span style="color:#8899a6">${account.contact_title}</span>` : ''}</div>
        <div style="font-size:12px;color:#8899a6">${account.phone}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-size:22px;font-weight:700;color:#003DA5;line-height:1">${account.weekly_pieces.toLocaleString()}</div>
        <div style="font-size:10px;color:#8899a6">pieces</div>
        <div style="font-size:11px;color:#8899a6;margin-top:4px">~${account.service_duration_min || 20} min</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div style="background:#2c3750;padding:8px 10px;border-radius:6px">
        <div style="font-size:10px;color:#8899a6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Last Delivery</div>
        <div style="font-size:13px">${deliveryRatingHtml(account.last_delivery_rating)}</div>
      </div>
      <div style="background:#2c3750;padding:8px 10px;border-radius:6px">
        <div style="font-size:10px;color:#8899a6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px">Account Health</div>
        <div style="font-size:13px;font-weight:600;color:${isAtRisk ? '#e53935' : isMonitor ? '#ff9800' : '#43a047'}">${account.health_score || '—'}/100</div>
      </div>
    </div>

    ${account.notes ? `<div style="background:#2c3750;padding:10px;border-radius:6px;margin-bottom:10px;font-size:13px;color:#c9d1d9">📝 ${account.notes}</div>` : ''}

    ${(account.talking_points || []).length > 0 ? `
    <div style="margin-bottom:10px">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8899a6;margin-bottom:6px">Talking Points</div>
      <ul style="padding-left:16px;margin:0;font-size:13px;color:#c9d1d9;line-height:1.6">${talkingPointsHtml}</ul>
    </div>` : ''}

    ${crossSellHtml}
    ${atRiskHtml}
    ${complaintHtml}
  </div>
</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Route Briefing — ${route.route_id.toUpperCase()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#161e2d; color:#f0f3f6; padding:20px; -webkit-font-smoothing:antialiased; }
    .header { background:#1e2840; border:1px solid #2c3750; border-radius:10px; padding:20px 24px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; }
    .route-id { font-size:11px; color:#8899a6; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
    .route-name { font-size:18px; font-weight:700; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
    .stat { background:#1e2840; border:1px solid #2c3750; border-radius:8px; padding:14px; text-align:center; }
    .stat-val { font-size:22px; font-weight:700; color:#003DA5; }
    .stat-lbl { font-size:10px; color:#8899a6; text-transform:uppercase; letter-spacing:0.08em; margin-top:2px; }
    h2 { font-size:13px; color:#8899a6; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; }
    .demo-badge { font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8899a6;background:#2c3750;padding:3px 8px;border-radius:3px; }
    .stop-header:hover { background:#243050 !important; }
    @media(max-width:500px) { .stats { grid-template-columns:repeat(2,1fr); } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="route-id">${route.route_id.toUpperCase()} · ${today}</div>
      <div class="route-name">${route.territory}</div>
      <div style="font-size:13px;color:#8899a6;margin-top:4px">Driver: ${route.driver}</div>
    </div>
    <div style="text-align:right">
      ${isPilot ? '<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#003DA5;background:rgba(0,61,165,0.12);padding:4px 10px;border-radius:4px;margin-bottom:6px">CINCINNATI PILOT</div>' : ''}
      <div class="demo-badge">Demo Mode</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-val">${route.stops}</div><div class="stat-lbl">Stops</div></div>
    <div class="stat"><div class="stat-val">${totalPieces.toLocaleString()}</div><div class="stat-lbl">Total Pieces</div></div>
    <div class="stat"><div class="stat-val" style="color:${openIssues > 0 ? '#e53935' : '#43a047'}">${openIssues}</div><div class="stat-lbl">Open Issues</div></div>
    <div class="stat"><div class="stat-val" style="color:${atRiskCount > 0 ? '#e53935' : '#43a047'}">${atRiskCount}</div><div class="stat-lbl">At-Risk Accts</div></div>
  </div>

  ${atRiskCount > 0 ? `<div style="background:rgba(229,57,53,0.08);border:1px solid rgba(229,57,53,0.25);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#ef5350"><strong>${atRiskCount} account${atRiskCount > 1 ? 's' : ''} flagged at critical risk.</strong> These are expanded automatically — address them first.</div>` : ''}

  <h2>Account Briefings (${route.accounts.length} stops) — tap any stop to expand</h2>
  ${accountsHtml}

  <div style="text-align:center;color:#8899a6;font-size:11px;margin-top:20px;padding-top:16px;border-top:1px solid #2c3750">
    AI-generated briefing · ${new Date().toLocaleTimeString()} · Cincinnati Pilot Demo
  </div>

  <script>
    function toggleStop(id) {
      const card = document.getElementById(id);
      const body = card.querySelector('.stop-body');
      const chevron = card.querySelector('.stop-chevron');
      const isOpen = card.getAttribute('data-expanded') === 'true';
      if (isOpen) {
        body.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
        card.setAttribute('data-expanded', 'false');
      } else {
        body.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
        card.setAttribute('data-expanded', 'true');
      }
    }
  </script>
</body>
</html>`;
}

async function seedDemoData(env) {
  const shieldEvents = [
    { id: 'shield-001', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'phone_call', business: 'trihealth-good-sam', sentiment: 2, urgency: 'critical', is_complaint: true, churn_risk: true },
    { id: 'shield-002', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'chat', business: 'fc-cincinnati', sentiment: 3, urgency: 'elevated', is_complaint: true, churn_risk: false },
    { id: 'shield-003', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'intake_form', business: 'marriott-rivercenter', sentiment: 9, urgency: 'low', is_complaint: false, churn_risk: false },
    { id: 'shield-004', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), source: 'phone_call', business: 'mason-medical-center', sentiment: 2, urgency: 'critical', is_complaint: true, churn_risk: true },
  ];
  await env.DATA.put('shield:recent', JSON.stringify(shieldEvents));
  await env.DATA.put('metrics:calls', JSON.stringify({ total: 52, answered: 49, voicemails: 3, avg_duration: 156, hot_leads: 9 }));
  await env.DATA.put('metrics:chats', JSON.stringify({ total: 28, escalated: 8, avg_messages: 7 }));
  await env.DATA.put('metrics:leads', JSON.stringify({ total: 34, hot: 11, warm: 15, cool: 6, cold: 2 }));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = url.searchParams.get('route');
  const account = url.searchParams.get('account');
  const headers_json = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const headers_html = { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' };

  try {
    if (env.DATA) {
      const seeded = await env.DATA.get('demo:seeded');
      if (!seeded) {
        await seedDemoData(env);
        await env.DATA.put('demo:seeded', '1', { expirationTtl: 60 * 60 * 24 * 365 });
      }
    }

    if (account) {
      let shieldEvents = [];
      if (env.DATA) {
        try { shieldEvents = JSON.parse(await env.DATA.get(`shield:account:${account}`) || '[]'); } catch {}
      }
      const accountData = Object.values(DEMO_ROUTES).flatMap(r => r.accounts).find(a => a.id === account);
      return new Response(JSON.stringify({
        account_id: account,
        account_data: accountData || null,
        shield_events: shieldEvents.slice(0, 10),
        mood: shieldEvents.length ? (shieldEvents[0].sentiment >= 7 ? 'positive' : shieldEvents[0].sentiment >= 5 ? 'neutral' : 'negative') : 'unknown',
      }), { headers: headers_json });
    }

    if (route) {
      const routeData = DEMO_ROUTES[route];
      if (!routeData) {
        return new Response(JSON.stringify({ error: `Route ${route} not found`, available: Object.keys(DEMO_ROUTES) }), { status: 404, headers: headers_json });
      }

      const shieldByBusiness = {};
      if (env.DATA) {
        await Promise.all(routeData.accounts.map(async (acc) => {
          try {
            const events = JSON.parse(await env.DATA.get(`shield:account:${acc.id}`) || '[]');
            shieldByBusiness[acc.id] = events;
          } catch {}
        }));
        try {
          const allShield = JSON.parse(await env.DATA.get('shield:recent') || '[]');
          for (const event of allShield) {
            const matchedAcc = routeData.accounts.find(a => a.id === event.business);
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

    return new Response(JSON.stringify({
      routes: Object.keys(DEMO_ROUTES),
      pilot_routes: Object.entries(DEMO_ROUTES).filter(([, v]) => v.pilot).map(([k]) => k),
      usage: { route: '?route=route-7', account: '?account=trihealth-good-sam' },
    }), { headers: headers_json });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: headers_json });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
