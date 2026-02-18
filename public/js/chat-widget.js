/**
 * laundry service — Chat Widget
 * Floating chat for miami, cincinnati, dallas branch pages
 * POSTs to /laundry/api/chat
 */
(function () {
  'use strict';

  const API_BASE = '/laundry/api';
  const SESSION_KEY = 'ls_chat_session';

  // Detect city from URL
  function getCity() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('miami')) return 'miami';
    if (path.includes('cincinnati')) return 'cincinnati';
    if (path.includes('dallas')) return 'dallas';
    return 'miami';
  }

  // Detect language preference
  function getLang() {
    return navigator.language?.startsWith('es') ? 'es' : 'en';
  }

  const city = getCity();
  const lang = getLang();

  const COPY = {
    en: {
      placeholder: 'Ask about pricing, services, or scheduling...',
      greeting: 'Hi there! I\'m the laundry service virtual assistant. Ask me about pricing, services, or scheduling — or just tell me about your property.',
      escalate_prompt: 'Want to leave your contact info so someone from our team can follow up?',
      name_prompt: 'What\'s your name?',
      email_prompt: 'And your email?',
      phone_prompt: 'Phone number? (optional)',
      thanks: 'Thanks! We\'ll be in touch soon. You can also reach us at (513) 822-5130.',
      title: 'laundry service',
      subtitle: 'usually replies instantly',
    },
    es: {
      placeholder: '¿Preguntas sobre precios, servicios o entregas?',
      greeting: '¡Hola! Soy el asistente virtual de laundry service. Puedo ayudarte con precios, servicios o programar una entrega.',
      escalate_prompt: '¿Quieres dejar tus datos para que alguien de nuestro equipo te contacte?',
      name_prompt: '¿Cuál es tu nombre?',
      email_prompt: '¿Y tu correo?',
      phone_prompt: '¿Número de teléfono? (opcional)',
      thanks: '¡Gracias! Nos pondremos en contacto pronto. También puedes llamarnos al (513) 822-5130.',
      title: 'laundry service',
      subtitle: 'responde al instante',
    },
  };

  const t = COPY[lang] || COPY.en;

  // Read CSS vars from host page for color matching
  const style = getComputedStyle(document.documentElement);
  const primaryColor = style.getPropertyValue('--charcoal').trim() || style.getPropertyValue('--ink').trim() || style.getPropertyValue('--earth').trim() || '#1a1a18';
  const accentColor = style.getPropertyValue('--copper').trim() || style.getPropertyValue('--blue').trim() || style.getPropertyValue('--terra').trim() || '#b87a4a';
  const bgColor = style.getPropertyValue('--white').trim() || '#fefdfb';
  const mutedColor = style.getPropertyValue('--drift').trim() || style.getPropertyValue('--fog').trim() || style.getPropertyValue('--saddle').trim() || '#7a7a70';

  // Session persistence
  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveSession(data) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
  }

  let session = getSession() || { id: null, messages: [], lead_data: {}, capture_stage: null };

  // Inject styles
  const css = `
  #ls-chat-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9998;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${primaryColor};
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
    outline: none;
  }
  #ls-chat-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  #ls-chat-btn .ls-icon-chat,
  #ls-chat-btn .ls-icon-close {
    position: absolute;
    transition: opacity 0.2s, transform 0.3s;
  }
  #ls-chat-btn .ls-icon-close { opacity: 0; transform: rotate(-90deg); }
  #ls-chat-btn.open .ls-icon-chat { opacity: 0; transform: rotate(90deg); }
  #ls-chat-btn.open .ls-icon-close { opacity: 1; transform: rotate(0); }

  #ls-chat-panel {
    position: fixed;
    bottom: 92px;
    right: 24px;
    z-index: 9997;
    width: 360px;
    max-width: calc(100vw - 32px);
    height: 520px;
    max-height: calc(100vh - 120px);
    background: ${bgColor};
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 16px;
    box-shadow: 0 16px 60px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: translateY(16px) scale(0.96);
    pointer-events: none;
    transition: opacity 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    font-family: inherit;
  }
  #ls-chat-panel.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  }
  .ls-panel-header {
    background: ${primaryColor};
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .ls-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${accentColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .ls-header-info { flex: 1; }
  .ls-header-title { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: 0.01em; }
  .ls-header-sub { font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 1px; }
  .ls-online-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }

  .ls-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,0,0,0.1) transparent;
  }
  .ls-messages::-webkit-scrollbar { width: 4px; }
  .ls-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

  .ls-msg {
    max-width: 82%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.5;
    word-break: break-word;
  }
  .ls-msg.bot {
    background: #f0f0ee;
    color: ${primaryColor};
    border-bottom-left-radius: 4px;
    align-self: flex-start;
  }
  .ls-msg.user {
    background: ${primaryColor};
    color: #fff;
    border-bottom-right-radius: 4px;
    align-self: flex-end;
  }
  .ls-msg.system-note {
    background: transparent;
    color: ${mutedColor};
    font-size: 12px;
    font-style: italic;
    align-self: center;
    text-align: center;
    padding: 4px 8px;
  }

  .ls-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    background: #f0f0ee;
    border-radius: 14px;
    border-bottom-left-radius: 4px;
    align-self: flex-start;
    max-width: 60px;
  }
  .ls-typing span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: ${mutedColor};
    animation: ls-bounce 1.2s infinite;
  }
  .ls-typing span:nth-child(2) { animation-delay: 0.2s; }
  .ls-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes ls-bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-5px); opacity: 1; }
  }

  .ls-capture-bar {
    padding: 10px 16px;
    background: rgba(0,0,0,0.03);
    border-top: 1px solid rgba(0,0,0,0.06);
    flex-shrink: 0;
  }
  .ls-capture-label { font-size: 11px; color: ${mutedColor}; margin-bottom: 6px; }
  .ls-capture-row { display: flex; gap: 8px; }
  .ls-capture-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 8px;
    font-size: 13px;
    background: #fff;
    color: ${primaryColor};
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .ls-capture-input:focus { border-color: ${accentColor}; }
  .ls-capture-btn {
    padding: 8px 14px;
    background: ${accentColor};
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: opacity 0.2s;
  }
  .ls-capture-btn:hover { opacity: 0.88; }

  .ls-input-bar {
    padding: 12px 16px;
    border-top: 1px solid rgba(0,0,0,0.06);
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    background: ${bgColor};
  }
  .ls-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 10px;
    font-size: 13.5px;
    font-family: inherit;
    background: #fff;
    color: ${primaryColor};
    outline: none;
    resize: none;
    transition: border-color 0.2s;
    line-height: 1.4;
    max-height: 80px;
    overflow-y: auto;
  }
  .ls-input:focus { border-color: ${accentColor}; }
  .ls-input::placeholder { color: ${mutedColor}; }
  .ls-send-btn {
    width: 38px;
    height: 38px;
    background: ${primaryColor};
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: opacity 0.2s, transform 0.15s;
    align-self: flex-end;
  }
  .ls-send-btn:hover { opacity: 0.85; transform: scale(0.97); }
  .ls-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // HTML structure
  const container = document.createElement('div');
  container.innerHTML = `
  <button id="ls-chat-btn" aria-label="Open chat">
    <svg class="ls-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="ls-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  </button>

  <div id="ls-chat-panel" role="dialog" aria-label="Chat with laundry service">
    <div class="ls-panel-header">
      <div class="ls-avatar">🧺</div>
      <div class="ls-header-info">
        <div class="ls-header-title">${t.title}</div>
        <div class="ls-header-sub">${t.subtitle}</div>
      </div>
      <div class="ls-online-dot"></div>
    </div>
    <div class="ls-messages" id="ls-messages"></div>
    <div id="ls-capture-bar" class="ls-capture-bar" style="display:none"></div>
    <div class="ls-input-bar">
      <textarea class="ls-input" id="ls-input" placeholder="${t.placeholder}" rows="1" aria-label="Chat message"></textarea>
      <button class="ls-send-btn" id="ls-send-btn" aria-label="Send message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
  `;
  document.body.appendChild(container);

  const btn = document.getElementById('ls-chat-btn');
  const panel = document.getElementById('ls-chat-panel');
  const messagesEl = document.getElementById('ls-messages');
  const inputEl = document.getElementById('ls-input');
  const sendBtn = document.getElementById('ls-send-btn');
  const captureBar = document.getElementById('ls-capture-bar');

  let isOpen = false;
  let isTyping = false;
  let hasGreeted = false;

  function toggleChat() {
    isOpen = !isOpen;
    btn.classList.toggle('open', isOpen);
    panel.classList.toggle('open', isOpen);

    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      // Restore session messages or show greeting
      if (session.messages.length > 0) {
        session.messages.forEach(m => addMessage(m.content, m.role === 'user' ? 'user' : 'bot', false));
      } else {
        setTimeout(() => addMessage(t.greeting, 'bot', true), 300);
      }
    }

    if (isOpen) {
      setTimeout(() => inputEl.focus(), 350);
    }
  }

  function addMessage(text, type, animate = false) {
    const div = document.createElement('div');
    div.className = `ls-msg ${type}`;
    div.textContent = text;
    if (animate) {
      div.style.opacity = '0';
      div.style.transform = 'translateY(6px)';
      messagesEl.appendChild(div);
      requestAnimationFrame(() => {
        div.style.transition = 'opacity 0.25s, transform 0.25s';
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      });
    } else {
      messagesEl.appendChild(div);
    }
    scrollToBottom();
    return div;
  }

  function addSystemNote(text) {
    addMessage(text, 'system-note', true);
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'ls-typing';
    div.id = 'ls-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function hideTyping() {
    const el = document.getElementById('ls-typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showCaptureBar(label, inputType, placeholder, onSubmit) {
    captureBar.style.display = 'block';
    captureBar.innerHTML = `
      <div class="ls-capture-label">${label}</div>
      <div class="ls-capture-row">
        <input class="ls-capture-input" type="${inputType}" placeholder="${placeholder}" id="ls-cap-input">
        <button class="ls-capture-btn" id="ls-cap-btn">Send</button>
      </div>
    `;
    const capInput = document.getElementById('ls-cap-input');
    const capBtn = document.getElementById('ls-cap-btn');
    capInput.focus();
    function submit() {
      const val = capInput.value.trim();
      if (!val) return;
      captureBar.style.display = 'none';
      onSubmit(val);
    }
    capBtn.addEventListener('click', submit);
    capInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  }

  async function handleEscalation() {
    if (session.capture_stage === 'done') return;
    session.capture_stage = 'name';

    addSystemNote(t.escalate_prompt);

    const captureField = async (stage, label, type, placeholder) => {
      return new Promise((resolve) => {
        showCaptureBar(label, type, placeholder, (val) => {
          addMessage(val, 'user', true);
          session.lead_data[stage] = val;
          saveSession(session);
          resolve(val);
        });
      });
    };

    const name = await captureField('name', t.name_prompt, 'text', 'Your name');
    const email = await captureField('email', t.email_prompt, 'email', 'email@example.com');
    const phone = await captureField('phone', t.phone_prompt, 'tel', '(555) 000-0000');

    session.capture_stage = 'done';
    saveSession(session);

    addMessage(t.thanks, 'bot', true);

    // Send lead to intake
    try {
      await fetch(`${API_BASE}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          business_type: session.lead_data.business_type,
          business_name: session.lead_data.business_name,
          message: session.messages.filter(m => m.role === 'user').map(m => m.content).join(' | ').slice(0, 500),
          source: `chat_widget_${city}`,
        }),
      });
    } catch {}
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    isTyping = true;
    sendBtn.disabled = true;
    inputEl.value = '';
    inputEl.style.height = 'auto';

    addMessage(text, 'user', true);
    session.messages.push({ role: 'user', content: text });
    saveSession(session);

    const typingEl = showTyping();

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          message: text,
          city,
          language: lang,
        }),
      });

      const data = await res.json();
      hideTyping();

      if (data.session_id && !session.id) {
        session.id = data.session_id;
      }

      const botText = data.response || (lang === 'es' ? 'Lo siento, hubo un error. Llámanos al (513) 822-5130.' : 'Sorry, something went wrong. Call us at (513) 822-5130.');
      addMessage(botText, 'bot', true);
      session.messages.push({ role: 'assistant', content: botText });

      // Merge lead data from server
      if (data.lead_data) {
        session.lead_data = { ...session.lead_data, ...data.lead_data };
      }
      saveSession(session);

      // Trigger escalation if needed
      if (data.should_escalate && session.capture_stage !== 'done' && session.messages.length >= 4) {
        setTimeout(handleEscalation, 1000);
      }
    } catch (err) {
      hideTyping();
      const errMsg = lang === 'es' ? 'Error de conexión. Por favor intenta de nuevo.' : 'Connection error. Please try again.';
      addMessage(errMsg, 'bot', true);
    }

    isTyping = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  // Event listeners
  btn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
  });

  // Restore open state from session
  if (session.messages.length > 0 && !isOpen) {
    hasGreeted = true; // will restore on open
  }

})();
