/* Conexão com IAs (Claude, ChatGPT e Gemini), direto do navegador.
   As chaves ficam só neste computador (localStorage) e cada uma só é enviada ao próprio provedor. */
const PROVIDERS = {
  anthropic: { name: 'Claude (Anthropic)', short: 'Claude', hint: 'sk-ant-...', where: 'console.anthropic.com → API Keys',
    models: [['claude-sonnet-5-5', 'Claude Sonnet 5.5 — rápido e econômico'], ['claude-opus-5-5', 'Claude Opus 5.5 — mais profundo'], ['claude-haiku-5-5', 'Claude Haiku 5.5 — o mais barato'], ['claude-fable-5-1', 'Claude Fable 5.1 — o mais capaz']] },
  openai: { name: 'ChatGPT (OpenAI)', short: 'ChatGPT', hint: 'sk-...', where: 'platform.openai.com → API keys',
    models: [['gpt-5', 'GPT-5'], ['gpt-5-mini', 'GPT-5 mini — mais barato'], ['gpt-4.1', 'GPT-4.1']] },
  gemini: { name: 'Gemini (Google)', short: 'Gemini', hint: 'AIza...', where: 'aistudio.google.com → Get API key',
    models: [['gemini-2.5-pro', 'Gemini 2.5 Pro'], ['gemini-2.5-flash', 'Gemini 2.5 Flash — rápido e barato']] },
  compat: { name: 'Outra IA (compatível com OpenAI)', short: 'Outra IA', hint: 'chave (deixe vazio no Ollama/LM Studio)', where: 'o provedor escolhido (Ollama e LM Studio rodam no seu computador, sem custo de API)',
    models: [] }
};
const COMPAT_PRESETS = [['Ollama — roda no seu computador (grátis)', 'http://localhost:11434/v1'], ['LM Studio — roda no seu computador (grátis)', 'http://localhost:1234/v1'], ['Groq', 'https://api.groq.com/openai/v1'], ['OpenRouter (tem modelos :free)', 'https://openrouter.ai/api/v1'], ['Mistral', 'https://api.mistral.ai/v1']];
const AI = {
  ls(k, d = '') { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
  put(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} },
  get provider() { const p = this.ls('ple.provider', 'anthropic'); return PROVIDERS[p] ? p : 'anthropic'; },
  set provider(v) { this.put('ple.provider', v); },
  keyFor(p) { return this.ls('ple.key.' + p) || (p === 'anthropic' ? this.ls('ple.key') : ''); },
  setKey(p, v) { this.put('ple.key.' + p, v); if (p === 'anthropic') this.put('ple.key', ''); },
  get key() { return this.keyFor(this.provider); },
  set key(v) { this.setKey(this.provider, v); },
  modelFor(p) { return this.ls('ple.model.' + p) || (p === 'anthropic' ? this.ls('ple.model') : '') || PROVIDERS[p].models[0][0]; },
  setModel(p, v) { this.put('ple.model.' + p, v); },
  get model() { return this.modelFor(this.provider); },
  set model(v) { this.setModel(this.provider, v); },
  get rprov() { const r = this.ls('ple.rprov', 'same'); return r === 'same' || PROVIDERS[r] ? r : 'same'; },
  set rprov(v) { this.put('ple.rprov', v); },
  get web() { return this.ls('ple.web', '1') !== '0'; },
  set web(v) { this.put('ple.web', v ? '1' : '0'); },
  get cross() { return this.ls('ple.cross', '0') === '1'; },
  set cross(v) { this.put('ple.cross', v ? '1' : '0'); },
  get base() { return this.ls('ple.base', ''); },
  set base(v) { this.put('ple.base', String(v || '').trim().replace(/\/+$/, '')); },
  has(p) { return p === 'compat' ? !!this.base : !!this.keyFor(p); },
  get eco() { return this.ls('ple.eco', '0') === '1'; },
  set eco(v) { this.put('ple.eco', v ? '1' : '0'); },
  price(p, m) { try { return JSON.parse(this.ls('ple.price.' + p + '|' + m, '{}')) || {}; } catch (e) { return {}; } },
  setPrice(p, m, o) { this.put('ple.price.' + p + '|' + m, JSON.stringify(o)); },
  track(prov, model, i, o, s) {
    try {
      const P_ = typeof P === 'function' ? P() : null; if (!P_) return;
      const u = (P_.usage ||= { calls: 0, by: {} }), k = prov + '|' + model, e = (u.by[k] ||= { prov, model, calls: 0, in: 0, out: 0, search: 0 });
      u.calls++; e.calls++; e.in += i || 0; e.out += o || 0; e.search += s || 0; if (typeof save === 'function') save();
    } catch (e) {}
  },
  lastSources: [], lastNoWeb: false, stop: false, busy: false
};
const researchProvider = () => (AI.rprov === 'same' ? AI.provider : AI.rprov);
const AI_WEB_SECTIONS = ['mercado', 'conc'];

const AI_SYSTEM = `Você é estrategista sênior da Mantora Lab, agência de marketing focada em estratégia, posicionamento e crescimento para especialistas e infoprodutores. Você constrói planejamentos estratégicos com o método VMC (Virtude, Movimento, Conversão).
Regras:
- Escreva em português do Brasil, em linguagem simples, direta e sem jargão; tom anti-hype.
- Use SOMENTE fatos presentes no material do cliente ou em fontes que você consultou. Nunca invente números, depoimentos, cases ou credenciais. Quando faltar dado, escreva "[a confirmar]" no campo.
- Dimensionamentos (TAM/SAM/SOM, projeções) devem explicar a conta e citar a fonte quando houver.
- Mantenha coerência com o que já foi definido nos outros tópicos.
- Responda APENAS com o JSON pedido, sem texto antes ou depois e sem blocos de código.`;

function httpFail(r, j, name) {
  const msg = (j && j.error && (j.error.message || j.error)) || ('HTTP ' + r.status);
  if (r.status === 401 || r.status === 403) throw new Error(`Chave de API inválida para ${name}. Confira em ⚙ IA.`);
  if (r.status === 429) throw new Error('Limite de uso da API atingido. Aguarde um minuto e tente de novo.');
  throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
}
const addSource = (seen, url, title) => { if (url && !seen.has(url)) { seen.add(url); AI.lastSources.push({ title: title || url, url }); } };

/* ---- Claude ---- */
async function callAnthropic(user, { web, maxTokens, system, maxUses }) {
  const body = { model: AI.modelFor('anthropic'), max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] };
  const useWeb = web && AI.web;
  if (useWeb) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: maxUses }]; else if (web) AI.lastNoWeb = true;
  const send = async b => {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': AI.keyFor('anthropic'), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify(b) });
    return { r, j: await r.json().catch(() => ({})) };
  };
  let text = '', seen = new Set();
  for (let turn = 0; turn < 5; turn++) {
    let { r, j } = await send(body);
    if (!r.ok && body.tools && /tool|web_search/i.test(JSON.stringify(j.error || ''))) { delete body.tools; AI.lastNoWeb = true; ({ r, j } = await send(body)); }
    if (!r.ok) httpFail(r, j, 'Claude');
    AI.track('anthropic', body.model, j.usage && j.usage.input_tokens, j.usage && j.usage.output_tokens, j.usage && j.usage.server_tool_use && j.usage.server_tool_use.web_search_requests);
    const blocks = j.content || [];
    for (const bl of blocks) {
      if (bl.type === 'web_search_tool_result' && Array.isArray(bl.content)) bl.content.forEach(x => addSource(seen, x.url, x.title));
      if (bl.type === 'text') { text += (text ? '\n' : '') + bl.text; (bl.citations || []).forEach(c => addSource(seen, c.url, c.title)); }
    }
    if (j.stop_reason === 'max_tokens') throw new Error('A resposta foi cortada por tamanho. Tente de novo ou gere em duas partes.');
    if (j.stop_reason === 'pause_turn') { body.messages = [...body.messages, { role: 'assistant', content: blocks }]; continue; }
    break;
  }
  return text;
}

/* ---- ChatGPT (Responses API) ---- */
async function callOpenAI(user, { web, maxTokens, system }) {
  const body = { model: AI.modelFor('openai'), instructions: system, input: user, max_output_tokens: Math.max(maxTokens, 16000) };
  const useWeb = web && AI.web;
  if (useWeb) body.tools = [{ type: 'web_search' }]; else if (web) AI.lastNoWeb = true;
  const send = async b => {
    const r = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + AI.keyFor('openai') }, body: JSON.stringify(b) });
    return { r, j: await r.json().catch(() => ({})) };
  };
  let { r, j } = await send(body);
  if (!r.ok && body.tools && /tool|web_search/i.test(JSON.stringify(j.error || ''))) { delete body.tools; AI.lastNoWeb = true; ({ r, j } = await send(body)); }
  if (!r.ok) httpFail(r, j, 'ChatGPT');
  AI.track('openai', body.model, j.usage && j.usage.input_tokens, j.usage && j.usage.output_tokens, (j.output || []).filter(it => it.type === 'web_search_call').length);
  let text = ''; const seen = new Set();
  (j.output || []).forEach(it => { if (it.type === 'message') (it.content || []).forEach(c => { if (c.type === 'output_text') { text += (text ? '\n' : '') + c.text; (c.annotations || []).forEach(a => { if (a.type === 'url_citation') addSource(seen, a.url, a.title); }); } }); });
  if (j.status === 'incomplete' && !text) throw new Error('A resposta foi cortada por tamanho. Tente de novo ou gere em duas partes.');
  return text;
}

/* ---- Gemini ---- */
async function callGemini(user, { web, maxTokens, system }) {
  const body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: Math.max(maxTokens, 16000) } };
  const useWeb = web && AI.web;
  if (useWeb) body.tools = [{ google_search: {} }]; else if (web) AI.lastNoWeb = true;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(AI.modelFor('gemini'))}:generateContent`;
  const send = async b => {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': AI.keyFor('gemini') }, body: JSON.stringify(b) });
    return { r, j: await r.json().catch(() => ({})) };
  };
  let { r, j } = await send(body);
  if (!r.ok && body.tools && /tool|search|ground/i.test(JSON.stringify(j.error || ''))) { delete body.tools; AI.lastNoWeb = true; ({ r, j } = await send(body)); }
  if (!r.ok) httpFail(r, j, 'Gemini');
  { const um = j.usageMetadata || {}, gm = ((j.candidates || [])[0] || {}).groundingMetadata || {}; AI.track('gemini', AI.modelFor('gemini'), um.promptTokenCount, (um.candidatesTokenCount || 0) + (um.thoughtsTokenCount || 0), (gm.webSearchQueries || []).length); }
  const cand = (j.candidates || [])[0];
  if (!cand) throw new Error('O Gemini não devolveu resposta' + (j.promptFeedback && j.promptFeedback.blockReason ? ` (bloqueada: ${j.promptFeedback.blockReason})` : '.'));
  const text = ((cand.content && cand.content.parts) || []).map(x => x.text || '').join('');
  const seen = new Set(); ((cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || []).forEach(g => g.web && addSource(seen, g.web.uri, g.web.title));
  if (cand.finishReason === 'MAX_TOKENS' && !text) throw new Error('A resposta foi cortada por tamanho. Tente de novo ou gere em duas partes.');
  return text;
}

/* ---- Outra IA compatível com OpenAI (Ollama, LM Studio, Groq, OpenRouter, Mistral…) ---- */
async function callCompat(user, { web, maxTokens, system }) {
  if (web) AI.lastNoWeb = true; // sem busca na web nesses provedores
  const model = AI.modelFor('compat'); if (!model) throw new Error('Informe o modelo da "Outra IA" em ⚙ IA (use "Carregar modelos").');
  const headers = { 'content-type': 'application/json' }; if (AI.keyFor('compat')) headers.authorization = 'Bearer ' + AI.keyFor('compat');
  let r, j;
  try { r = await fetch(AI.base + '/chat/completions', { method: 'POST', headers, body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) }); j = await r.json().catch(() => ({})); }
  catch (e) { throw new Error('Não consegui falar com ' + AI.base + '. Se for o Ollama, ele precisa estar aberto e iniciado com OLLAMA_ORIGINS=* (libera o navegador).'); }
  if (!r.ok) httpFail(r, j, 'Outra IA');
  AI.track('compat', model, j.usage && j.usage.prompt_tokens, j.usage && j.usage.completion_tokens, 0);
  const ch = (j.choices || [])[0]; if (!ch) throw new Error('A IA não devolveu resposta.');
  if (ch.finish_reason === 'length' && !(ch.message && ch.message.content)) throw new Error('A resposta foi cortada por tamanho.');
  return (ch.message && ch.message.content) || '';
}

async function aiCall(user, { web = false, maxTokens = 12000, system = AI_SYSTEM, maxUses = 5, provider } = {}) {
  const prov = provider && provider !== 'same' ? provider : AI.provider;
  if (!AI.has(prov)) throw new Error(`Configure ${prov === 'compat' ? 'o endereço' : 'a chave'} de ${PROVIDERS[prov].name} em ⚙ IA.`);
  AI.lastSources = []; AI.lastNoWeb = false;
  const fn = { anthropic: callAnthropic, openai: callOpenAI, gemini: callGemini, compat: callCompat }[prov];
  return fn(user, { web, maxTokens, system, maxUses });
}

// lista os modelos disponíveis na conta do usuário
async function aiListModels(prov, key) {
  if (prov === 'anthropic') { const r = await fetch('https://api.anthropic.com/v1/models?limit=100', { headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } }); const j = await r.json(); if (!r.ok) httpFail(r, j, 'Claude'); return (j.data || []).map(m => m.id); }
  if (prov === 'openai') { const r = await fetch('https://api.openai.com/v1/models', { headers: { authorization: 'Bearer ' + key } }); const j = await r.json(); if (!r.ok) httpFail(r, j, 'ChatGPT'); return (j.data || []).map(m => m.id).filter(id => /^(gpt|o\d|chatgpt)/.test(id) && !/(embed|audio|tts|whisper|image|realtime|transcribe|moderation|search-preview|instruct)/.test(id)).sort().reverse(); }
  if (prov === 'compat') { const h = key ? { authorization: 'Bearer ' + key } : {}; let r; try { r = await fetch(AI.base + '/models', { headers: h }); } catch (e) { throw new Error('Não consegui falar com ' + AI.base); } const j = await r.json().catch(() => ({})); if (!r.ok) httpFail(r, j, 'Outra IA'); return (j.data || j.models || []).map(m => m.id || m.name).filter(Boolean); }
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } }); const j = await r.json(); if (!r.ok) httpFail(r, j, 'Gemini');
  return (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace(/^models\//, '')).filter(id => /^gemini/.test(id) && !/(embed|tts|image|live|vision|aqa)/.test(id)).sort().reverse();
}

function aiMaterial(P) {
  const m = String((P.data.briefing || {}).material || '').trim();
  const cap = AI.eco ? 30000 : 90000;
  return m.length > cap ? m.slice(0, cap) + '\n[material truncado]' : m;
}
function aiDigest(P, exceptId) {
  let out = '', total = 0;
  for (const s of SECTIONS) {
    if (s.id === exceptId || s.id === 'briefing' || pctSec(s) < 25) continue;
    const d = { ...(P.data[s.id] || {}) }; delete d.notas;
    const clean = JSON.stringify(d, (k, v) => (v === '' || (Array.isArray(v) && !v.length)) ? undefined : v);
    const pc = AI.eco ? 1200 : 2500, part = `### ${s.title}\n${clean.length > pc ? clean.slice(0, pc) + '…' : clean}\n`;
    if (total + part.length > (AI.eco ? 8000 : 24000)) break;
    out += part; total += part.length;
  }
  return out;
}
function aiUserPrompt(sec, P) {
  const b = P.data.briefing || {}, ctx = ['nicho', 'avatar', 'momento', 'objetivo12', 'faturamento', 'produtos_atuais'].filter(k => String(b[k] || '').trim()).map(k => `- ${k}: ${b[k]}`).join('\n');
  const mat = aiMaterial(P), dig = aiDigest(P, sec.id), pesq = typeof researchForPrompt === 'function' ? researchForPrompt(P, sec.id) : '';
  return `CLIENTE: ${P.meta.cliente}\n${ctx ? `\nRESUMO DO BRIEFING:\n${ctx}\n` : ''}${mat ? `\nMATERIAL-BASE DO CLIENTE (briefing, DNA do Expert, pesquisas, call):\n${mat}\n` : '\n(Nenhum material-base foi anexado; trabalhe só com o resumo acima e sinalize o que precisar de confirmação.)\n'}${pesq ? `\nPESQUISA REALIZADA COM FONTES (use estes dados e cite a fonte quando relevante):\n${pesq}\n` : ''}${dig ? `\nJÁ DEFINIDO NOS OUTROS TÓPICOS (mantenha coerência):\n${dig}` : ''}\n---\n${buildPrompt(sec, P.meta.cliente, P)}`;
}

/* Preenche um tópico. Retorna nº de campos preenchidos. */
async function aiFill(sec, quiet = false) {
  const P_ = P();
  const text = await aiCall(aiUserPrompt(sec, P_), { web: AI_WEB_SECTIONS.includes(sec.id) });
  const n = importJson(sec, text, true);
  if (!n) throw new Error('A resposta não veio no formato esperado. Tente novamente.');
  return n;
}

function aiStatus(text, onStop) {
  let el = document.getElementById('aiStatus');
  if (!text) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'aiStatus'; el.style.cssText = 'position:fixed;right:22px;bottom:22px;z-index:120;background:#2c0640;color:#fff;padding:14px 18px;border-radius:16px;box-shadow:0 12px 34px rgba(44,6,64,.45);font-size:14px;max-width:360px;display:flex;gap:14px;align-items:center'; document.body.appendChild(el); }
  el.innerHTML = `<span style="width:14px;height:14px;border:2px solid #a68bff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .8s linear infinite;flex:none"></span><span>${esc(text)}</span>${onStop ? '<button class="btn dark xs" id="aiStop">Parar</button>' : ''}`;
  if (onStop) document.getElementById('aiStop').onclick = onStop;
}

async function aiFillOne(sec) {
  if (!AI.has(AI.provider)) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  AI.busy = true; aiStatus(`Gerando "${sec.title}"… (pode levar até 1 minuto)`);
  try { const n = await aiFill(sec); toast(`"${sec.title}": ${n} campo(s) preenchido(s). Revise antes de apresentar.`); }
  catch (e) { toast('IA: ' + (e.message || e)); }
  AI.busy = false; aiStatus(null); render();
}

async function aiFillAll() {
  if (!AI.has(AI.provider)) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const p = P();
  if (!Object.keys(p.research || {}).length && confirm('Ainda não há pesquisa feita para este cliente. Quer que o Claude pesquise o mercado na web ANTES de gerar os tópicos? (recomendado — os tópicos saem com dados e fontes reais)')) { await runResearchAll(false); if (AI.stop) return; }
  if (!aiMaterial(p) && !confirm('Nenhum material-base foi colado/anexado no tópico "Briefing & DNA". A IA vai trabalhar só com o resumo do briefing e vai sinalizar o que precisa de confirmação. Continuar mesmo assim?')) return;
  const todo = SECTIONS.filter(s => s.id !== 'proposta' && !s.manual && pctSec(s) < 60);
  if (typeof validationProgress === 'function' && Object.keys(p.research || {}).length) { const vp = validationProgress(p); if (vp.done < vp.total && !confirm(`O checklist de validação da pesquisa está em ${vp.done}/${vp.total}. O POP manda validar a pesquisa antes de seguir (aba Pesquisa com IA). Gerar os tópicos mesmo assim?`)) return; }
  if (!todo.length) return toast('Todos os tópicos já estão com mais de 60% — nada a gerar.');
  if (!confirm(`A IA vai preencher ${todo.length} tópico(s) com menos de 60% (tópicos já preenchidos são mantidos; a proposta comercial fica de fora). Isso faz várias chamadas e consome créditos da sua chave da API. Continuar?`)) return;
  AI.busy = true; AI.stop = false; const failed = [];
  for (let i = 0; i < todo.length; i++) {
    if (AI.stop) break;
    aiStatus(`Gerando ${i + 1}/${todo.length}: ${todo[i].title}`, () => { AI.stop = true; });
    try { await aiFill(todo[i]); } catch (e) { failed.push(`${todo[i].title} (${e.message})`); if (/inválida|Limite/.test(e.message)) break; }
    renderNav();
  }
  AI.busy = false; aiStatus(null); render();
  toast(failed.length ? `Concluído com ${failed.length} falha(s): ${failed.join('; ')}` : AI.stop ? 'Geração interrompida. O que já foi gerado foi mantido.' : 'Todos os tópicos foram gerados. Revise cada um antes de apresentar.');
}

const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(2).replace('.', ',') + ' mi' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',') + ' mil' : String(Math.round(n || 0));
function aiUsageHtml(P_) {
  const u = P_.usage; if (!u || !u.calls) return '<p class="h" style="margin:0">Nenhuma chamada de IA neste cliente ainda.</p>';
  let total = 0, unknown = 0;
  const rows = Object.values(u.by).map(e => {
    const pr = AI.price(e.prov, e.model), known = pr.in != null && pr.in !== '' && pr.out != null && pr.out !== '';
    const c = known ? (e.in * Number(pr.in) + e.out * Number(pr.out)) / 1e6 + e.search * Number(pr.search || 0) : null;
    if (c == null) unknown++; else total += c;
    return `<tr><td><b>${esc((PROVIDERS[e.prov] || { short: e.prov }).short)}</b> · ${esc(e.model)}</td><td>${e.calls}</td><td>${fmtN(e.in)} / ${fmtN(e.out)}</td><td>${e.search || '—'}</td><td>${c == null ? '<span style="color:var(--muted)">defina o preço</span>' : '≈ ' + c.toFixed(2).replace('.', ',')}</td></tr>`;
  }).join('');
  return `<table class="rev"><tr style="font-size:12px;color:var(--muted)"><td>Modelo</td><td>Chamadas</td><td>Tokens (entrada / saída)</td><td>Buscas</td><td>Custo (na moeda do preço)</td></tr>${rows}</table><p class="h" style="margin:8px 0 0">Total: ${u.calls} chamada(s)${unknown < Object.keys(u.by).length ? ` · ≈ ${total.toFixed(2).replace('.', ',')}${unknown ? ' (sem os modelos sem preço)' : ''}` : ''}. Estimativa a partir dos preços que você informou em ⚙ IA — a cobrança oficial é a do provedor.</p>`;
}

function costTipsHtml() {
  return `<details class="box" style="border-color:#d9ccff;background:#faf7ff"><summary style="cursor:pointer;font-weight:600">💡 Quanto custa a IA e como economizar</summary><div style="font-size:14px;line-height:1.55;margin-top:10px">
  <p style="margin:0 0 8px">Usar a IA pela API <b>tem custo</b>, cobrado na conta de quem criou a chave (Claude, ChatGPT ou Gemini). A plataforma, o GitHub e o Netlify não cobram nada neste uso. O que mais consome: <b>Pesquisa com IA</b> (busca na web em 14 temas), <b>Cruzar com duas IAs</b> (triplica cada pesquisa) e <b>Gerar todos os tópicos</b> (várias chamadas com muito contexto).</p>
  <p style="margin:0 0 4px"><b>Formas de gastar menos ou nada:</b></p>
  <ul style="margin:0 0 8px;padding-left:20px"><li><b>Modo manual (sem custo de API):</b> use <i>Copiar prompt</i> em cada tópico e em cada pesquisa, rode no seu ChatGPT, Claude, Gemini ou Perplexity (planos de assinatura) e cole o resultado de volta.</li><li><b>IA no seu computador</b> (Ollama ou LM Studio, em ⚙ IA → "Outra IA"): grátis e privada, mas sem busca na web e com qualidade menor.</li><li><b>Camadas gratuitas</b> do Gemini (Google AI Studio), Groq e OpenRouter (modelos <i>:free</i>), com limites que mudam — confira.</li><li><b>Modo econômico</b> e modelos mais baratos (Sonnet/Haiku, GPT mini, Gemini Flash) para rascunhos; deixe o cruzamento entre IAs desligado e ligue só em concorrência e TAM/SAM/SOM; defina um limite de gasto na conta do provedor.</li></ul>
  <p style="margin:0"><b>Recomendação:</b> pesquisa no modo manual (Perplexity ou ChatGPT com busca, na assinatura da equipe) e a API só para gerar os tópicos, no modelo mais barato. O contador "Uso de IA neste cliente" mostra o que foi gasto.</p></div></details>`;
}

function openAiSettings() {
  document.getElementById('aiDlg')?.remove();
  const d = document.createElement('div'); d.id = 'aiDlg';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(20,6,34,.6);z-index:150;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow:auto';
  const provOpts = sel => Object.entries(PROVIDERS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.name}</option>`).join('');
  d.innerHTML = `<div class="box" style="max-width:600px;width:100%;margin:auto"><h3 style="font-size:18px">⚙ Conectar a IA</h3>
  <div class="tools" style="border-radius:12px;padding:12px 14px;margin:10px 0 4px;font-size:13px"><b>Quer evitar custo de API?</b><ul style="margin:6px 0 0;padding-left:18px"><li><b>Modo manual (sem chave):</b> em cada tópico e em cada pesquisa use <i>Copiar prompt</i>, rode no seu ChatGPT, Claude, Gemini ou Perplexity (planos de assinatura) e cole o resultado de volta.</li><li><b>IA no seu computador (Ollama / LM Studio):</b> grátis e privada, mas sem busca na web e com qualidade menor. Escolha "Outra IA" abaixo.</li><li><b>Camadas gratuitas:</b> Gemini (Google AI Studio), Groq e OpenRouter (modelos <i>:free</i>) costumam ter uso gratuito com limites. Confira as regras atuais de cada um.</li></ul></div>
  <p class="h" style="margin:10px 0 0">A plataforma chama a API direto do seu navegador. Cada chave fica salva só neste computador e só é enviada ao próprio provedor.</p>
  <label class="l">Provedor para gerar os tópicos</label><select class="f" id="aiProv">${provOpts(AI.provider)}</select>
  <div id="aiWhere" class="h" style="margin:6px 0 0"></div>
  <div id="aiBaseBox" style="display:none"><label class="l">Endereço da API <small>Compatível com OpenAI (termina em /v1). Escolha um atalho ou digite.</small></label><select class="f" id="aiPreset" style="margin-bottom:6px"><option value="">Atalhos…</option>${COMPAT_PRESETS.map(([n, u]) => `<option value="${u}">${n}</option>`).join('')}</select><input type="text" id="aiBase" placeholder="http://localhost:11434/v1" autocomplete="off"><p class="h" style="margin:6px 0 0">Ollama: deixe-o aberto e inicie com a variável <code>OLLAMA_ORIGINS=*</code> para liberar o navegador.</p></div>
  <label class="l">Chave da API</label><input type="text" id="aiKey" autocomplete="off" style="font-family:monospace">
  <label class="l">Modelo <small>Se o nome não existir na sua conta, use “Carregar modelos”.</small></label>
  <input type="text" id="aiModel" list="aiModels" autocomplete="off"><datalist id="aiModels"></datalist>
  <div style="margin-top:8px"><button class="btn ghost xs" id="aiLoad">↻ Carregar modelos</button></div>
  <label class="l">Preço deste modelo <small>Opcional, só para estimar o custo no contador. Preço por 1 milhão de tokens e por busca web, na sua moeda (veja a tabela do provedor).</small></label>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><input type="text" id="pIn" placeholder="entrada / 1M"><input type="text" id="pOut" placeholder="saída / 1M"><input type="text" id="pSearch" placeholder="por busca web"></div>
  <label class="l">Provedor da aba Pesquisa <small>Quem faz a busca na web. Gemini e ChatGPT têm busca própria; o Claude usa a ferramenta de busca da Anthropic. “Outra IA” não tem busca.</small></label>
  <select class="f" id="aiRprov"><option value="same">O mesmo dos tópicos</option>${provOpts(AI.rprov)}</select>
  <label class="chk" style="margin-top:14px"><input type="checkbox" id="aiWeb" ${AI.web ? 'checked' : ''}><span>Usar busca na web em Mercado, Concorrência e na aba Pesquisa (dados atuais, com fontes)</span></label>
  <label class="chk"><input type="checkbox" id="aiEco" ${AI.eco ? 'checked' : ''}><span><b>Modo econômico:</b> menos contexto e menos buscas por chamada (gasta menos, pode perder detalhe)</span></label>
  <div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap"><button class="btn" id="aiSave">Salvar</button><button class="btn ghost" id="aiTest">Testar conexão</button><button class="btn danger" id="aiClear">Remover esta chave</button><button class="btn ghost" id="aiClose" style="margin-left:auto">Fechar</button></div><p id="aiMsg" class="h" style="margin:12px 0 0"></p>
  <div style="border-top:1px solid var(--line);margin-top:14px;padding-top:12px"><h3 style="font-size:15px">Uso de IA neste cliente</h3>${typeof P === 'function' && P() ? aiUsageHtml(P()) : ''}</div></div>`;
  document.body.appendChild(d);
  const $d = q => d.querySelector(q);
  d.querySelector('#aiRprov').value = AI.rprov;
  let cur = AI.provider;
  const fill = () => {
    const pv = PROVIDERS[cur];
    $d('#aiWhere').innerHTML = `Crie a chave em <b>${pv.where}</b>`;
    $d('#aiBaseBox').style.display = cur === 'compat' ? 'block' : 'none'; $d('#aiBase').value = AI.base;
    $d('#aiKey').value = AI.keyFor(cur); $d('#aiKey').placeholder = pv.hint;
    $d('#aiModel').value = cur === 'compat' ? (AI.ls('ple.model.compat') || '') : AI.modelFor(cur);
    $d('#aiModels').innerHTML = pv.models.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
    const pr = AI.price(cur, $d('#aiModel').value.trim()); $d('#pIn').value = pr.in ?? ''; $d('#pOut').value = pr.out ?? ''; $d('#pSearch').value = pr.search ?? '';
  };
  const store = () => {
    AI.setKey(cur, $d('#aiKey').value.trim()); const m = $d('#aiModel').value.trim(); if (m) AI.setModel(cur, m);
    if (cur === 'compat') AI.base = $d('#aiBase').value;
    if (m) AI.setPrice(cur, m, { in: $d('#pIn').value.trim(), out: $d('#pOut').value.trim(), search: $d('#pSearch').value.trim() });
    AI.rprov = $d('#aiRprov').value; AI.web = $d('#aiWeb').checked; AI.eco = $d('#aiEco').checked;
  };
  $d('#aiProv').onchange = () => { store(); cur = $d('#aiProv').value; AI.provider = cur; fill(); $d('#aiMsg').textContent = ''; };
  $d('#aiPreset').onchange = () => { if ($d('#aiPreset').value) $d('#aiBase').value = $d('#aiPreset').value; };
  $d('#aiModel').onchange = () => { const pr = AI.price(cur, $d('#aiModel').value.trim()); $d('#pIn').value = pr.in ?? ''; $d('#pOut').value = pr.out ?? ''; $d('#pSearch').value = pr.search ?? ''; };
  fill();
  $d('#aiSave').onclick = () => { store(); AI.provider = cur; d.remove(); toast(AI.has(cur) ? `${PROVIDERS[cur].short} conectado.` : 'Nenhuma conexão configurada para este provedor.'); if (typeof render === 'function') render(); };
  $d('#aiClear').onclick = () => { AI.setKey(cur, ''); $d('#aiKey').value = ''; $d('#aiMsg').textContent = 'Chave removida.'; };
  $d('#aiClose').onclick = () => d.remove();
  $d('#aiLoad').onclick = async () => {
    const m = $d('#aiMsg'), k = $d('#aiKey').value.trim(); if (cur !== 'compat' && !k) { m.textContent = 'Cole a chave primeiro.'; return; }
    if (cur === 'compat') AI.base = $d('#aiBase').value; m.textContent = 'Carregando modelos…';
    try { const ids = await aiListModels(cur, k); $d('#aiModels').innerHTML = ids.map(id => `<option value="${id}">${id}</option>`).join(''); m.textContent = `${ids.length} modelo(s) disponíveis. Clique no campo Modelo e escolha.`; } catch (e) { m.textContent = '✗ ' + (e.message || e); }
  };
  $d('#aiTest').onclick = async () => {
    store(); AI.provider = cur; const m = $d('#aiMsg'); if (!AI.has(cur)) { m.textContent = cur === 'compat' ? 'Informe o endereço da API primeiro.' : 'Cole a chave primeiro.'; return; }
    m.textContent = 'Testando…';
    try { const r = await aiCall('Responda apenas com o JSON {"ok":true}', { maxTokens: 200, provider: cur }); m.textContent = /true/.test(r) ? `✓ Conectado: ${PROVIDERS[cur].name}, modelo ${AI.modelFor(cur)}.` : 'Conectou, mas a resposta foi inesperada: ' + r.slice(0, 80); } catch (e) { m.textContent = '✗ ' + (e.message || e); }
  };
}

// anexar arquivos de texto/PDF ao material-base do briefing
async function aiAttachFiles(files) {
  const p = P(), d = (p.data.briefing ||= {}); let add = '';
  for (const f of files) {
    try {
      let t = '';
      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
        await pdfSetup(); const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) { const pg = await pdf.getPage(i), c = await pg.getTextContent(); t += c.items.map(x => x.str).join(' ') + '\n'; }
      } else t = await f.text();
      add += `\n\n=== ${f.name} ===\n${t.trim()}`;
    } catch (e) { toast(`Não consegui ler ${f.name}: ${e.message || e}`); }
  }
  if (add) { d.material = ((d.material || '') + add).trim(); save(); render(); toast('Arquivo(s) adicionado(s) ao material-base.'); }
}
