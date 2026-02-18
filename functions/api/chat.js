// Chat API — bilingual, city-aware, lead-capturing chat
async function callClaude(env, system, user, maxTokens = 600, messages = null) {
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
      messages: messages || [{ role: 'user', content: user }],
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

const CITY_CONTEXT = {
  miami: {
    en: 'South Florida (Miami-Dade, Broward, Palm Beach)',
    es: 'Sur de Florida (Miami-Dade, Broward, Palm Beach)',
    services: 'pool towels, bath towels, bed linens, spa towels, robes, restaurant napkins',
    personality: 'warm and bilingual. Many clients are Spanish-speaking.',
  },
  cincinnati: {
    en: 'Greater Cincinnati / Northern Kentucky',
    es: 'Cincinnati y norte de Kentucky',
    services: 'uniforms, work wear, shop towels, floor mats, kitchen linens',
    personality: 'professional and straightforward. Industrial clients.',
  },
  dallas: {
    en: 'DFW Metroplex (Dallas, Fort Worth, surrounding areas)',
    es: 'Área metropolitana de Dallas-Fort Worth',
    services: 'hotel linens, restaurant napkins, uniforms, spa towels, corporate wear',
    personality: 'confident and direct. Mix of hospitality and corporate clients.',
  },
};

function buildSystemPrompt(city, language, sessionHistory) {
  const ctx = CITY_CONTEXT[city] || CITY_CONTEXT.miami;
  const lang = language === 'es' ? 'es' : 'en';
  const area = ctx[lang];

  const base = lang === 'es'
    ? `Eres el asistente virtual de "laundry service", un servicio de renta de toallas y ropa de cama para negocios en ${area}.
Responde siempre en español a menos que el cliente cambie al inglés.
Eres ${ctx.personality}
Servicios disponibles: ${ctx.services}.
Sin contratos. Entregas semanales. Reemplazo automático de artículos desgastados.
Número de teléfono: (513) 822-5130.
Precio aproximado: $8-18 por empleado/unidad por semana dependiendo del tipo de negocio.`
    : `You are the virtual assistant for "laundry service", a towel and linen rental company serving businesses in ${area}.
You are ${ctx.personality}
Available services: ${ctx.services}.
No contracts. Weekly delivery routes. Automatic replacement of worn items.
Phone number: (513) 822-5130.
Pricing: roughly $8-18 per employee/unit per week depending on business type.`;

  const instructions = lang === 'es'
    ? `\n\nInstrucciones:
- Sé conversacional y útil. Máximo 3-4 oraciones por respuesta.
- Si preguntan por precio, da un rango basado en su tipo de negocio.
- Si muestran interés real, ofrece conectarlos con el equipo.
- Detecta si hay quejas o insatisfacción — señala que un especialista se pondrá en contacto.
- No pidas nombre/email/teléfono a menos que sea natural y necesario para seguimiento.`
    : `\n\nInstructions:
- Be conversational and genuinely helpful. Keep responses to 3-4 sentences max.
- If they ask about pricing, give a range based on their business type.
- If they show real interest, offer to connect them with the team.
- If you detect frustration or a complaint, acknowledge it and say a specialist will follow up.
- Don't ask for contact info unless naturally needed for a follow-up.`;

  return base + instructions;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body = await request.json();
    const { session_id, message, city = 'miami', language = 'en' } = body;

    if (!message) return new Response(JSON.stringify({ error: 'message required' }), { status: 400, headers });

    const sessionKey = `chat:${session_id || uid()}`;
    const sessionId = sessionKey.replace('chat:', '');

    // Load session history
    let session = { messages: [], city, language, created: new Date().toISOString(), lead_data: {} };
    if (env.DATA && session_id) {
      try {
        const stored = await env.DATA.get(sessionKey);
        if (stored) session = JSON.parse(stored);
      } catch {}
    }

    // Add user message to history
    session.messages.push({ role: 'user', content: message });
    if (session.messages.length > 20) session.messages = session.messages.slice(-20);

    // Build Claude messages (alternate user/assistant)
    const claudeMessages = session.messages.map(m => ({ role: m.role, content: m.content }));

    const systemPrompt = buildSystemPrompt(city, language, session.messages);
    const responseText = await callClaude(env, systemPrompt, message, 400, claudeMessages);

    // Add assistant response to history
    session.messages.push({ role: 'assistant', content: responseText });
    session.last_active = new Date().toISOString();

    // Detect lead opportunity and sentiment
    const analysisSystem = `Analyze this chat conversation for a commercial laundry service and return JSON only:
{
  "should_escalate": <boolean, true if user wants to get a quote, schedule service, or speaks to someone>,
  "sentiment": <1-10>,
  "is_complaint": <boolean>,
  "lead_data": {
    "name": <string or null>,
    "email": <string or null>,
    "phone": <string or null>,
    "business_type": <string or null>,
    "business_name": <string or null>,
    "services_needed": <array or []>
  },
  "needs_quote": <boolean>
}
Extract any contact info or business details mentioned naturally in the conversation.`;

    let analysisResult = { should_escalate: false, sentiment: 6, is_complaint: false, lead_data: {}, needs_quote: false };
    try {
      const conversationText = session.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      analysisResult = await callClaudeJSON(env, analysisSystem, conversationText);
    } catch {}

    // Merge lead data
    session.lead_data = { ...session.lead_data, ...Object.fromEntries(Object.entries(analysisResult.lead_data || {}).filter(([, v]) => v != null && v !== '')) };

    // Save session to KV
    if (env.DATA) {
      await env.DATA.put(sessionKey, JSON.stringify(session), { expirationTtl: 60 * 60 * 24 * 7 });

      // Update chat metrics
      let metrics = {};
      try { metrics = JSON.parse(await env.DATA.get('metrics:chats') || '{}'); } catch {}
      if (session.messages.length === 2) metrics.total = (metrics.total || 0) + 1; // first exchange
      if (analysisResult.should_escalate) metrics.escalated = (metrics.escalated || 0) + 1;
      metrics.avg_messages = Math.round(((metrics.avg_messages || 0) + session.messages.length) / 2);
      await env.DATA.put('metrics:chats', JSON.stringify(metrics));
    }

    // Handle complaint escalation via service-shield
    if (analysisResult.is_complaint && analysisResult.sentiment <= 4 && env.ANTHROPIC_API_KEY) {
      try {
        const shieldPayload = {
          source: 'chat',
          content: session.messages.filter(m => m.role === 'user').map(m => m.content).join(' | '),
          customer_name: session.lead_data.name,
          business: session.lead_data.business_name,
          contact_info: { email: session.lead_data.email, phone: session.lead_data.phone },
        };

        let shieldRecent = [];
        try { shieldRecent = JSON.parse(await env.DATA?.get('shield:recent') || '[]'); } catch {}
        const shieldId = uid();
        shieldRecent.unshift({ id: shieldId, timestamp: new Date().toISOString(), source: 'chat', sentiment: analysisResult.sentiment, urgency: analysisResult.sentiment <= 2 ? 'critical' : 'elevated', is_complaint: true, business: session.lead_data.business_name });
        shieldRecent = shieldRecent.slice(0, 50);
        if (env.DATA) await env.DATA.put('shield:recent', JSON.stringify(shieldRecent));
      } catch {}
    }

    // Handle lead escalation — send team email
    if (analysisResult.should_escalate && session.messages.length <= 6 && env.RESEND_API_KEY && env.ALERT_EMAIL) {
      const ld = session.lead_data;
      if (ld.email || ld.phone || ld.name) {
        try {
          await sendEmail(env, env.ALERT_EMAIL,
            `💬 Chat Lead: ${ld.name || 'Unknown'} — ${city}`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <h2 style="color:#1a1a18;margin-bottom:16px">Chat Lead Escalated</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0;font-weight:600">${ld.name || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${ld.email || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0">${ld.phone || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0">${ld.business_name || ld.business_type || '—'}</td></tr>
                <tr><td style="padding:8px 0;color:#666">City</td><td style="padding:8px 0">${city}</td></tr>
                <tr><td style="padding:8px 0;color:#666">Services</td><td style="padding:8px 0">${(ld.services_needed || []).join(', ') || '—'}</td></tr>
              </table>
              <div style="margin-top:20px;padding:16px;background:#f9f7f3;font-size:13px;color:#7a7a70">
                <strong>Last message:</strong> ${message}
              </div>
            </div>`
          );
        } catch {}
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      session_id: sessionId,
      response: responseText,
      should_escalate: analysisResult.should_escalate,
      lead_data: session.lead_data,
      sentiment: analysisResult.sentiment,
      needs_quote: analysisResult.needs_quote,
      session_messages: session.messages.length,
    }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
