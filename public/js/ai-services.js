/**
 * ai-services.js — Interactive AI Services Section
 * Requires: ai-services-data.js loaded first
 */
const AiServices = (() => {
  const CSS = `
.ais-section{padding:clamp(5rem,10vh,8rem) clamp(2rem,5vw,4rem);position:relative;-webkit-font-smoothing:antialiased}
.ais-inner{max-width:1280px;margin:0 auto;position:relative;z-index:1}
.ais-hdr{margin-bottom:clamp(3rem,6vh,5rem);display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:1.5rem}
.ais-hdr-left{max-width:620px}
.ais-lbl{font-size:.68rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:1rem;opacity:.65}
.ais-ttl{font-size:clamp(2rem,3.5vw,2.8rem);font-weight:300;line-height:1.15;letter-spacing:-.03em;margin-bottom:1rem}
.ais-ttl em{font-style:italic;opacity:.55}
.ais-sub{font-size:.95rem;line-height:1.75;opacity:.5}
.ais-live{display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:4px;font-size:.72rem;font-weight:600;letter-spacing:.04em;white-space:nowrap}
.ais-pulse{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:aisPulse 2s infinite}
@keyframes aisPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(74,222,128,.5)}50%{opacity:.7;box-shadow:0 0 0 6px rgba(74,222,128,0)}}
.ais-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.ais-card{padding:clamp(24px,3vw,36px);position:relative;cursor:pointer;transition:all .4s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;background:rgba(255,255,255,.55)}
.ais-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.06)}
.ais-feat{cursor:default}
.ais-badge{position:absolute;top:18px;right:18px;font-size:.56rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;padding:4px 10px;border-radius:2px}
.ais-b-live{background:rgba(196,168,114,.12)}
.ais-b-try{color:#16a34a;background:rgba(74,222,128,.1)}
.ais-b-demo{opacity:.55}
.ais-ico{margin-bottom:16px;opacity:.7}
.ais-card h3{font-size:.92rem;font-weight:600;margin-bottom:6px}
.ais-card>p{font-size:.8rem;opacity:.5;line-height:1.65}
.ais-cta{display:inline-flex;align-items:center;gap:6px;margin-top:auto;padding-top:14px;font-size:.74rem;font-weight:600;letter-spacing:.04em;text-decoration:none;opacity:.65;align-self:flex-start;transition:opacity .3s;color:inherit}
.ais-card:hover .ais-cta{opacity:1}
.ais-cta svg{width:12px;height:12px;transition:transform .3s}
.ais-card:hover .ais-cta svg{transform:translateX(3px)}
.ais-prev{margin-top:18px;padding-top:14px;border-top:1px solid rgba(128,128,128,.1)}
.ais-feed{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
.ais-fi{display:flex;align-items:center;gap:8px;font-size:.68rem;opacity:.7;padding:5px 0;animation:aisFI .5s ease-out both}
.ais-fi:nth-child(1){animation-delay:.1s}.ais-fi:nth-child(2){animation-delay:.3s}.ais-fi:nth-child(3){animation-delay:.5s}
@keyframes aisFI{from{opacity:0;transform:translateX(-8px)}to{opacity:.7;transform:none}}
.ais-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.ais-dg{background:#4ade80}.ais-da{background:#fbbf24}.ais-dr{background:#ef4444}
.ais-sc{font-weight:700;margin-left:auto;font-variant-numeric:tabular-nums;font-size:.66rem}
.ais-calc{display:flex;gap:8px;flex-wrap:wrap}
.ais-calc select,.ais-calc input{font-family:inherit;font-size:.74rem;padding:9px 12px;border:1px solid rgba(128,128,128,.2);border-radius:3px;background:rgba(255,255,255,.8);outline:none;flex:1;min-width:100px;color:inherit}
.ais-calc select:focus,.ais-calc input:focus{border-color:rgba(184,122,74,.6)}
.ais-cbtn{font-family:inherit;font-size:.7rem;font-weight:600;padding:9px 16px;border:none;border-radius:3px;cursor:pointer;letter-spacing:.02em;background:#b87a4a;color:#fff;transition:opacity .2s}
.ais-cbtn:hover{opacity:.85}
.ais-qr{margin-top:12px}
.ais-qr-big{font-size:1.3rem;font-weight:300;line-height:1;margin-top:10px}
.ais-qr-det{font-size:.7rem;opacity:.5;margin-top:4px}
.ais-qr-line{font-size:.68rem;display:flex;justify-content:space-between;padding:3px 0;opacity:.55}
.ais-qr-disc{font-size:.68rem;color:#16a34a;margin-top:2px}
.ais-qr-incl{font-size:.64rem;opacity:.35;margin-top:6px;font-style:italic}
.ais-qr-act{font-size:.72rem;font-weight:600;margin-top:8px;opacity:.7}
.ais-ss{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
.ais-pill{display:inline-flex;font-size:.66rem;font-weight:600;padding:3px 8px;border-radius:20px;transition:transform .3s}
.ais-pg{background:rgba(74,222,128,.1);color:#16a34a}.ais-pn{background:rgba(251,191,36,.1);color:#d97706}.ais-pr{background:rgba(239,68,68,.1);color:#dc2626}
.ais-sm{font-size:.66rem;opacity:.4;margin-top:6px}
.ais-sa{font-size:.66rem;font-weight:600;color:#dc2626;display:flex;align-items:center;gap:4px;margin-top:4px}
.ais-rh{display:flex;justify-content:space-between;margin-bottom:8px}
.ais-rh span:first-child{font-size:.66rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em}
.ais-rh span:last-child{font-size:.62rem;opacity:.4}
.ais-rr{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:.72rem;border-bottom:1px solid rgba(0,0,0,.03)}
.ais-rr:last-of-type{border-bottom:none}
.ais-rd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.ais-rdg{background:#4ade80}.ais-rdy{background:#fbbf24}.ais-rdr{background:#ef4444}
.ais-rn{font-weight:600}.ais-rnt{margin-left:auto;font-size:.66rem;opacity:.45}
.ais-rm{font-size:.64rem;opacity:.35;padding-top:6px;font-style:italic}
.ais-dg2{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
.ais-dc{background:rgba(0,0,0,.02);padding:10px;border-radius:3px;text-align:center}
.ais-dn{font-size:1.15rem;font-weight:300;line-height:1}
.ais-dng{color:#16a34a}.ais-dna{color:#d97706}.ais-dnc{color:#b87a4a}
.ais-dl{font-size:.58rem;opacity:.4;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}
.ais-spk{margin-top:10px;display:flex;align-items:center;gap:8px}
.ais-spkt{font-size:.62rem;color:#5a6e56;font-weight:600;white-space:nowrap}
.ais-spkl{font-size:.62rem;opacity:.35;margin-top:4px}
.ais-bot{margin-top:clamp(2rem,4vh,3rem);padding-top:clamp(2rem,4vh,3rem);border-top:1px solid rgba(128,128,128,.12);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.ais-bot-t{font-size:.85rem;font-style:italic;opacity:.45}
.ais-bot-a{font-size:.76rem;font-weight:600;letter-spacing:.06em;text-decoration:none;border-bottom:1.5px solid currentColor;padding-bottom:2px;color:inherit}
.ais-ct{position:fixed;bottom:28px;right:28px;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:all .3s;z-index:10000}
.ais-ct:hover{transform:scale(1.08)}
.ais-cp{position:fixed;bottom:96px;right:28px;width:370px;max-height:500px;border-radius:12px;box-shadow:0 12px 48px rgba(0,0,0,.15);overflow:hidden;z-index:10000;opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;transition:all .35s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column}
.ais-cp.ais-open{opacity:1;transform:none;pointer-events:all}
.ais-ch{padding:14px 18px;display:flex;justify-content:space-between;align-items:center}
.ais-cht{font-size:.84rem;font-weight:600}
.ais-chs{font-size:.66rem;opacity:.55;display:flex;align-items:center;gap:6px;margin-top:2px}
.ais-chs .ais-pulse{width:5px;height:5px}
.ais-cx{background:none;border:none;cursor:pointer;font-size:1.3rem;opacity:.5;color:inherit}.ais-cx:hover{opacity:1}
.ais-cb{padding:16px 18px;overflow-y:auto;flex:1;max-height:340px}
.ais-m{margin-bottom:12px;max-width:86%}
.ais-mb{margin-right:auto}.ais-mu{margin-left:auto}
.ais-bub{padding:10px 14px;border-radius:14px;font-size:.82rem;line-height:1.55}
.ais-mb .ais-bub{background:rgba(128,128,128,.08);border-bottom-left-radius:4px}
.ais-mu .ais-bub{border-bottom-right-radius:4px}
.ais-typ{display:flex;gap:4px;padding:10px 14px}
.ais-typ span{width:6px;height:6px;border-radius:50%;opacity:.3;background:currentColor;animation:aisT 1.4s infinite}
.ais-typ span:nth-child(2){animation-delay:.2s}.ais-typ span:nth-child(3){animation-delay:.4s}
@keyframes aisT{0%,60%,100%{opacity:.3}30%{opacity:1}}
.ais-cbar{display:flex;gap:8px;padding:12px 14px;border-top:1px solid rgba(128,128,128,.1)}
.ais-cin{flex:1;border:1px solid rgba(128,128,128,.2);border-radius:20px;padding:9px 16px;font-family:inherit;font-size:.82rem;outline:none;color:inherit;background:transparent}
.ais-cin:focus{border-color:rgba(184,122,74,.5)}
.ais-csnd{width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#b87a4a;color:#fff}
@media(max-width:900px){.ais-grid{grid-template-columns:1fr 1fr}.ais-cp{width:calc(100vw - 32px);right:16px;bottom:92px}.ais-dg2{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.ais-grid{grid-template-columns:1fr}.ais-hdr{flex-direction:column;align-items:flex-start}}
`;

  const I = {
    phone: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    chat: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    quote: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    shield: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    eye: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    grid: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
    arr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    warn: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  let cityKey, cityData, chatOpen = false, chatIdx = 0;

  function pc(s) { return s >= 8 ? 'ais-pg' : s >= 5 ? 'ais-pn' : 'ais-pr'; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function buildCards() {
    const c = cityData;
    const bizOpts = Object.entries(AIS_PRICING).map(([k,v]) => `<option value="${k}">${v.icon} ${v.label}</option>`).join('');
    const pills = c.shield.recent.map(s => `<span class="ais-pill ${pc(s)}">${s}</span>`).join('');
    const routes = c.route.preview.map(r => `<div class="ais-rr"><span class="ais-rd ais-rd${r.mood}"></span><span class="ais-rn">${r.name}</span><span class="ais-rnt">${r.note}</span></div>`).join('');
    const feed = c.feed.map(f => `<div class="ais-fi"><span class="ais-dot ais-d${f.dot}"></span> ${f.text} <span class="ais-sc" ${f.scoreColor?`style="color:${f.scoreColor}"`:''}>${f.score}</span></div>`).join('');
    const d = c.dashboard;

    return `
    <div class="ais-hdr">
      <div class="ais-hdr-left">
        <div class="ais-lbl">Powered by AI</div>
        <div class="ais-ttl">Six services. <em>One platform.</em></div>
        <p class="ais-sub">Not features on a roadmap — these are live. Call the number. Open the chat. Request a quote. Every interaction feeds one dashboard.</p>
      </div>
      <div class="ais-live"><span class="ais-pulse"></span> 3 services live · <span id="aisTime"></span></div>
    </div>
    <div class="ais-grid">
      <div class="ais-card ais-feat">
        <div class="ais-badge ais-b-live">Live 24/7</div>
        <div class="ais-ico">${I.phone}</div>
        <h3>AI Phone Agent</h3>
        <p>Call anytime. AI answers, qualifies your needs, scores the lead, routes the right person back. English &amp; Spanish.</p>
        <div class="ais-feed">${feed}</div>
        <a href="tel:${c.phoneTel}" class="ais-cta">Call ${c.phone} ${I.arr}</a>
      </div>
      <div class="ais-card" onclick="AiServices.openChat()">
        <div class="ais-badge ais-b-try">Try it</div>
        <div class="ais-ico">${I.chat}</div>
        <h3>Instant Chat</h3>
        <p>Pricing, service area, scheduling — answered in seconds, around the clock. No phone call needed.</p>
        <span class="ais-cta">Open chat now ${I.arr}</span>
      </div>
      <div class="ais-card" onclick="event.stopPropagation()" style="cursor:default">
        <div class="ais-badge ais-b-try">Try it</div>
        <div class="ais-ico">${I.quote}</div>
        <h3>Smart Quoting</h3>
        <p>Pick your business type, enter headcount. Get a detailed estimate in seconds.</p>
        <div class="ais-prev">
          <div class="ais-calc">
            <select id="aisQBiz" onclick="event.stopPropagation()"><option value="">Business type…</option>${bizOpts}</select>
            <input type="number" id="aisQHead" placeholder="# staff" min="1" max="2000" onclick="event.stopPropagation()" onkeydown="if(event.key==='Enter'){event.stopPropagation();AiServices.quote()}">
            <button class="ais-cbtn" onclick="event.stopPropagation();AiServices.quote()">Get estimate →</button>
          </div>
          <div class="ais-qr" id="aisQR"></div>
        </div>
      </div>
      <div class="ais-card">
        <div class="ais-badge ais-b-live">Live</div>
        <div class="ais-ico">${I.shield}</div>
        <h3>Service Shield</h3>
        <p>Every interaction scored for satisfaction in real time. Problems get caught before they escalate.</p>
        <div class="ais-prev">
          <div class="ais-ss" id="aisShield">${pills}</div>
          <div class="ais-sm">Last 5 interactions · Phone, Chat, Form</div>
          <div class="ais-sa">${I.warn} ${c.shield.escalated}</div>
        </div>
        <a href="../ops/" class="ais-cta">View ops dashboard ${I.arr}</a>
      </div>
      <div class="ais-card">
        <div class="ais-badge ais-b-demo">Demo</div>
        <div class="ais-ico">${I.eye}</div>
        <h3>Route Intelligence</h3>
        <p>Drivers arrive knowing the account — open issues, mood, upsell signals. Every stop briefed by AI.</p>
        <div class="ais-prev">
          <div class="ais-rh"><span>${c.route.id} · Today</span><span>${c.route.stops} stops · ${c.route.est} est.</span></div>
          ${routes}
          <div class="ais-rm">+ ${c.route.stops - c.route.preview.length} more stops · ${c.route.flagged} accounts flagged this week</div>
        </div>
        <a href="../ops/" class="ais-cta">View full briefing ${I.arr}</a>
      </div>
      <div class="ais-card">
        <div class="ais-badge ais-b-demo">Demo</div>
        <div class="ais-ico">${I.grid}</div>
        <h3>Customer Dashboard</h3>
        <p>Delivery history, open issues, spend tracking, satisfaction trend. Everything at a glance.</p>
        <div class="ais-prev">
          <div class="ais-dg2">
            <div class="ais-dc"><div class="ais-dn ais-dng">${d.deliveries}</div><div class="ais-dl">Deliveries</div></div>
            <div class="ais-dc"><div class="ais-dn ais-dna">${d.open}</div><div class="ais-dl">Open</div></div>
            <div class="ais-dc"><div class="ais-dn ais-dnc">${d.spend}</div><div class="ais-dl">Feb spend</div></div>
            <div class="ais-dc"><div class="ais-dn ais-dng">${d.satisfaction}</div><div class="ais-dl">Avg sat.</div></div>
          </div>
          <div class="ais-spk">
            <svg width="100%" height="28" viewBox="0 0 200 28" preserveAspectRatio="none" style="flex:1"><polyline points="${d.sparkline}" fill="none" stroke="#5a6e56" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${d.sparkline}" fill="url(#aisSpG)" stroke="none"/><defs><linearGradient id="aisSpG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(90,110,86,.15)"/><stop offset="100%" stop-color="rgba(90,110,86,0)"/></linearGradient></defs></svg>
            <span class="ais-spkt">${d.trend} ${d.trendPeriod}</span>
          </div>
          <div class="ais-spkl">Satisfaction trend · last ${d.trendPeriod} · across ${d.totalDeliveries} deliveries</div>
        </div>
        <a href="../ops/" class="ais-cta">Open demo portal ${I.arr}</a>
      </div>
    </div>
    <div class="ais-bot">
      <span class="ais-bot-t">Every touchpoint. One platform. Zero dropped balls.</span>
      <a href="../ops/" class="ais-bot-a">See the full operations dashboard →</a>
    </div>`;
  }

  function buildChatWidget() {
    return `
    <button class="ais-ct" onclick="AiServices.toggleChat()" id="aisCBtn">${I.chat}</button>
    <div class="ais-cp" id="aisCP">
      <div class="ais-ch"><div><div class="ais-cht">${cityData.name} Laundry Service</div><div class="ais-chs"><span class="ais-pulse"></span> Usually responds instantly</div></div><button class="ais-cx" onclick="AiServices.toggleChat()">×</button></div>
      <div class="ais-cb" id="aisCB"><div class="ais-m ais-mb"><div class="ais-bub">${cityData.chatGreeting}</div></div></div>
      <div class="ais-cbar"><input class="ais-cin" id="aisCI" placeholder="Ask about pricing, services…" onkeydown="if(event.key==='Enter')AiServices.sendChat()"><button class="ais-csnd" onclick="AiServices.sendChat()">${I.send}</button></div>
    </div>`;
  }

  function applyTheme(mount, chatEl) {
    const cs = getComputedStyle(document.body);
    const bg = cs.backgroundColor;
    const fg = cs.color;
    const ff = cs.fontFamily;
    mount.style.fontFamily = ff;
    mount.style.color = fg;
    const feat = mount.querySelector('.ais-feat');
    if (feat) { feat.style.background = fg; feat.style.color = bg; }
    const live = mount.querySelector('.ais-live');
    if (live) { live.style.background = fg; live.style.color = bg; }
    const ct = chatEl.querySelector('.ais-ct');
    const ch = chatEl.querySelector('.ais-ch');
    const cp = chatEl.querySelector('.ais-cp');
    if (ct) { ct.style.background = fg; ct.style.color = bg; }
    if (ch) { ch.style.background = fg; ch.style.color = bg; }
    if (cp) { cp.style.background = bg; cp.style.color = fg; }
  }

  function tick() {
    const el = document.getElementById('aisTime');
    if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function cycleShield() {
    const strip = document.getElementById('aisShield');
    if (!strip) return;
    const pills = strip.querySelectorAll('.ais-pill');
    const idx = Math.floor(Math.random() * pills.length);
    const s = Math.floor(Math.random() * 10) + 1;
    pills[idx].className = `ais-pill ${pc(s)}`;
    pills[idx].textContent = s;
    pills[idx].style.transform = 'scale(1.15)';
    setTimeout(() => pills[idx].style.transform = '', 300);
  }

  return {
    init(opts = {}) {
      cityKey = opts.city || 'miami';
      cityData = AIS_CITIES[cityKey] || AIS_CITIES.miami;
      const sty = document.createElement('style');
      sty.textContent = CSS;
      document.head.appendChild(sty);
      let mount = document.getElementById('ai-services-mount');
      if (!mount) {
        const existing = document.querySelector('[id="ai"]');
        if (existing) {
          mount = document.createElement('section');
          mount.id = 'ai';
          existing.parentNode.replaceChild(mount, existing);
        } else {
          console.warn('AiServices: no mount point (#ai-services-mount or #ai)');
          return;
        }
      }
      mount.className = 'ais-section';
      mount.innerHTML = `<div class="ais-inner">${buildCards()}</div>`;
      const cw = document.createElement('div');
      cw.id = 'ais-cw';
      cw.innerHTML = buildChatWidget();
      document.body.appendChild(cw);
      applyTheme(mount, cw);
      tick(); setInterval(tick, 30000);
      setInterval(cycleShield, 4000);
    },
    toggleChat() {
      chatOpen = !chatOpen;
      const p = document.getElementById('aisCP');
      if (p) p.classList.toggle('ais-open', chatOpen);
      if (chatOpen) setTimeout(() => { const i = document.getElementById('aisCI'); if (i) i.focus(); }, 100);
    },
    openChat() { if (!chatOpen) this.toggleChat(); },
    sendChat() {
      const inp = document.getElementById('aisCI');
      const body = document.getElementById('aisCB');
      if (!inp || !body) return;
      const txt = inp.value.trim();
      if (!txt) return;
      const cs = getComputedStyle(document.body);
      body.innerHTML += `<div class="ais-m ais-mu"><div class="ais-bub" style="background:${cs.color};color:${cs.backgroundColor}">${esc(txt)}</div></div>`;
      inp.value = '';
      body.scrollTop = body.scrollHeight;
      const tid = 'aisT' + Date.now();
      body.innerHTML += `<div class="ais-m ais-mb" id="${tid}"><div class="ais-bub"><div class="ais-typ"><span></span><span></span><span></span></div></div></div>`;
      body.scrollTop = body.scrollHeight;
      const responses = aisGetChatResponses(cityKey);
      setTimeout(() => {
        const el = document.getElementById(tid);
        if (el) el.querySelector('.ais-bub').innerHTML = responses[chatIdx % responses.length];
        chatIdx++;
        body.scrollTop = body.scrollHeight;
      }, 800 + Math.random() * 700);
    },
    quote() {
      const biz = document.getElementById('aisQBiz')?.value;
      const head = document.getElementById('aisQHead')?.value;
      const res = document.getElementById('aisQR');
      if (!res) return;
      if (!biz || !head || parseInt(head) < 1) {
        res.innerHTML = '<div class="ais-qr-det" style="padding-top:4px">Select a business type and enter headcount.</div>';
        return;
      }
      const q = aisCalculateQuote(biz, head);
      if (!q) return;
      const lines = q.lineItems.map(li =>
        `<div class="ais-qr-line"><span>${li.name}${li.note ? ` <span style="opacity:.5">(${li.note})</span>` : ''}</span><span>${li.lo}–${li.hi}/wk</span></div>`
      ).join('');
      res.innerHTML = `
        <div class="ais-qr-big">${q.weeklyLow.toLocaleString()}–${q.weeklyHigh.toLocaleString()}/week</div>
        <div class="ais-qr-det">${q.icon} ${q.business} · ${q.headcount} staff · ~${q.monthlyLow.toLocaleString()}–${q.monthlyHigh.toLocaleString()}/mo</div>
        ${q.discount ? `<div class="ais-qr-disc">✓ ${q.discount}</div>` : ''}
        <div style="margin-top:8px;border-top:1px solid rgba(128,128,128,.08);padding-top:4px">${lines}</div>
        <div class="ais-qr-incl">Includes: ${q.includes.join(' · ')}</div>
        <div class="ais-qr-act">Want exact pricing? Fill out the form below ↓</div>`;
    },
  };
})();
