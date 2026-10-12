/* Conexão com o Claude (API da Anthropic), direto do navegador.
   A chave fica só neste computador (localStorage) e só é enviada para api.anthropic.com. */
const AI = {
  get key() { try { return localStorage.getItem('ple.key') || ''; } catch (e) { return ''; } },
  set key(v) { try { v ? localStorage.setItem('ple.key', v) : localStorage.removeItem('ple.key'); } catch (e) {} },
  get model() { try { return localStorage.getItem('ple.model') || 'claude-sonnet-5-5'; } catch (e) { return 'claude-sonnet-5-5'; } },
  set model(v) { try { localStorage.setItem('ple.model', v); } catch (e) {} },
  get web() { try { return localStorage.getItem('ple.web') !== '0'; } catch (e) { return true; } },
  set web(v) { try { localStorage.setItem('ple.web', v ? '1' : '0'); } catch (e) {} },
  stop: false,
  busy: false
};
const AI_WEB_SECTIONS = ['mercado', 'conc'];

const AI_SYSTEM = `Você é estrategista sênior da Mantora Lab, agência de marketing focada em estratégia, posicionamento e crescimento para especialistas e infoprodutores. Você constrói planejamentos estratégicos com o método VMC (Virtude, Movimento, Conversão).
Regras:
- Escreva em português do Brasil, em linguagem simples, direta e sem jargão; tom anti-hype.
- Use SOMENTE fatos presentes no material do cliente ou em fontes que você consultou. Nunca invente números, depoimentos, cases ou credenciais. Quando faltar dado, escreva "[a confirmar]" no campo.
- Dimensionamentos (TAM/SAM/SOM, projeções) devem explicar a conta e citar a fonte quando houver.
- Mantenha coerência com o que já foi definido nos outros tópicos.
- Responda APENAS com o JSON pedido, sem texto antes ou depois e sem blocos de código.`;

async function aiCall(user, { web = false, maxTokens = 12000 } = {}) {
  const body = { model: AI.model, max_tokens: maxTokens, system: AI_SYSTEM, messages: [{ role: 'user', content: user }] };
  const useWeb = web && AI.web;
  if (useWeb) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
  const send = async b => {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': AI.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify(b)
    });
    const j = await r.json().catch(() => ({}));
    return { r, j };
  };
  let { r, j } = await send(body);
  if (!r.ok && useWeb && /tool|web_search/i.test(JSON.stringify(j.error || ''))) { delete body.tools; ({ r, j } = await send(body)); }
  if (!r.ok) {
    const msg = (j.error && j.error.message) || ('HTTP ' + r.status);
    if (r.status === 401) throw new Error('Chave de API inválida. Confira em ⚙ IA.');
    if (r.status === 429) throw new Error('Limite de uso da API atingido. Aguarde um minuto e tente de novo.');
    throw new Error(msg);
  }
  const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
  if (j.stop_reason === 'max_tokens') throw new Error('A resposta foi cortada por tamanho. Tente de novo ou gere em duas partes.');
  return text;
}

function aiMaterial(P) {
  const m = String((P.data.briefing || {}).material || '').trim();
  return m.length > 90000 ? m.slice(0, 90000) + '\n[material truncado]' : m;
}
function aiDigest(P, exceptId) {
  let out = '', total = 0;
  for (const s of SECTIONS) {
    if (s.id === exceptId || s.id === 'briefing' || pctSec(s) < 25) continue;
    const d = { ...(P.data[s.id] || {}) }; delete d.notas;
    const clean = JSON.stringify(d, (k, v) => (v === '' || (Array.isArray(v) && !v.length)) ? undefined : v);
    const part = `### ${s.title}\n${clean.length > 2500 ? clean.slice(0, 2500) + '…' : clean}\n`;
    if (total + part.length > 24000) break;
    out += part; total += part.length;
  }
  return out;
}
function aiUserPrompt(sec, P) {
  const b = P.data.briefing || {}, ctx = ['nicho', 'avatar', 'momento', 'objetivo12', 'faturamento', 'produtos_atuais'].filter(k => String(b[k] || '').trim()).map(k => `- ${k}: ${b[k]}`).join('\n');
  const mat = aiMaterial(P), dig = aiDigest(P, sec.id);
  return `CLIENTE: ${P.meta.cliente}\n${ctx ? `\nRESUMO DO BRIEFING:\n${ctx}\n` : ''}${mat ? `\nMATERIAL-BASE DO CLIENTE (briefing, DNA do Expert, pesquisas, call):\n${mat}\n` : '\n(Nenhum material-base foi anexado; trabalhe só com o resumo acima e sinalize o que precisar de confirmação.)\n'}${dig ? `\nJÁ DEFINIDO NOS OUTROS TÓPICOS (mantenha coerência):\n${dig}` : ''}\n---\n${buildPrompt(sec, P.meta.cliente, P)}`;
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
  if (!AI.key) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  AI.busy = true; aiStatus(`Gerando "${sec.title}"… (pode levar até 1 minuto)`);
  try { const n = await aiFill(sec); toast(`"${sec.title}": ${n} campo(s) preenchido(s). Revise antes de apresentar.`); }
  catch (e) { toast('IA: ' + (e.message || e)); }
  AI.busy = false; aiStatus(null); render();
}

async function aiFillAll() {
  if (!AI.key) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const p = P();
  if (!aiMaterial(p) && !confirm('Nenhum material-base foi colado/anexado no tópico "Briefing & DNA". A IA vai trabalhar só com o resumo do briefing e vai sinalizar o que precisa de confirmação. Continuar mesmo assim?')) return;
  const todo = SECTIONS.filter(s => s.id !== 'proposta' && pctSec(s) < 60);
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

function openAiSettings() {
  document.getElementById('aiDlg')?.remove();
  const d = document.createElement('div'); d.id = 'aiDlg';
  d.style.cssText = 'position:fixed;inset:0;background:rgba(20,6,34,.6);z-index:150;display:flex;align-items:center;justify-content:center;padding:20px';
  d.innerHTML = `<div class="box" style="max-width:520px;width:100%;margin:0"><h3 style="font-size:18px">⚙ Conectar o Claude</h3><p class="h">A plataforma chama a API da Anthropic direto do seu navegador para preencher os tópicos. Crie uma chave em <b>console.anthropic.com → API Keys</b>. A chave fica salva só neste computador e só é enviada para api.anthropic.com. O uso é cobrado na sua conta da Anthropic.</p>
  <label class="l">Chave da API</label><input type="text" id="aiKey" placeholder="sk-ant-..." value="${esc(AI.key)}" autocomplete="off" style="font-family:monospace">
  <label class="l">Modelo</label><select class="f" id="aiModel"><option value="claude-sonnet-5-5">Claude Sonnet 5.5 — rápido e econômico (recomendado)</option><option value="claude-opus-5-5">Claude Opus 5.5 — mais profundo, mais caro</option></select>
  <label class="chk" style="margin-top:14px"><input type="checkbox" id="aiWeb" ${AI.web ? 'checked' : ''}><span>Usar busca na web em Mercado e Concorrência (dados atuais, com fontes)</span></label>
  <div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap"><button class="btn" id="aiSave">Salvar</button><button class="btn ghost" id="aiTest">Testar conexão</button><button class="btn danger" id="aiClear">Remover chave</button><button class="btn ghost" id="aiClose" style="margin-left:auto">Fechar</button></div><p id="aiMsg" class="h" style="margin:12px 0 0"></p></div>`;
  document.body.appendChild(d);
  d.querySelector('#aiModel').value = AI.model;
  const save = () => { AI.key = d.querySelector('#aiKey').value.trim(); AI.model = d.querySelector('#aiModel').value; AI.web = d.querySelector('#aiWeb').checked; };
  d.querySelector('#aiSave').onclick = () => { save(); d.remove(); toast(AI.key ? 'Claude conectado.' : 'Chave removida.'); };
  d.querySelector('#aiClear').onclick = () => { AI.key = ''; d.querySelector('#aiKey').value = ''; d.querySelector('#aiMsg').textContent = 'Chave removida.'; };
  d.querySelector('#aiClose').onclick = () => d.remove();
  d.querySelector('#aiTest').onclick = async () => {
    save(); const m = d.querySelector('#aiMsg'); if (!AI.key) { m.textContent = 'Cole a chave primeiro.'; return; }
    m.textContent = 'Testando…';
    try { const r = await aiCall('Responda apenas com o JSON {"ok":true}', { maxTokens: 50 }); m.textContent = /true/.test(r) ? '✓ Conectado ao Claude.' : 'Conectou, mas a resposta foi inesperada: ' + r.slice(0, 80); } catch (e) { m.textContent = '✗ ' + (e.message || e); }
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
