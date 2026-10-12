/* Plataforma de Planejamento Estratégico — Mantora Lab */
document.getElementById('deckcss').textContent = DECK_CSS;
const $ = (s, r = document) => r.querySelector(s);
const KEY = 'ple.v1';
let state = loadState();
let view = 'home';
let assets = { idv: [], foto1: '', foto2: '', logo: '' };

/* ---------- Armazenamento ---------- */
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.projects) return s; } catch (e) {}
  return { cur: null, projects: {} };
}
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Não foi possível salvar localmente'); } }, 250); }
const P = () => state.projects[state.cur];

const idb = {
  db: null,
  open() { return new Promise((res, rej) => { if (this.db) return res(this.db); const r = indexedDB.open('ple-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async get(k) { const db = await this.open(); return new Promise(res => { const q = db.transaction('f').objectStore('f').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); }); },
  async set(k, v) { const db = await this.open(); return new Promise(res => { const tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put(v, k); tx.oncomplete = res; tx.onerror = res; }); },
  async del(k) { const db = await this.open(); return new Promise(res => { const tx = db.transaction('f', 'readwrite'); tx.objectStore('f').delete(k); tx.oncomplete = res; }); }
};
async function loadAssets() {
  const p = P(); assets = { idv: [], foto1: '', foto2: '', logo: '' };
  if (!p) return;
  try { for (const k of ['idv', 'foto1', 'foto2', 'logo']) assets[k] = (await idb.get(p.id + ':' + k)) || (k === 'idv' ? [] : ''); } catch (e) {}
}

/* ---------- Projetos ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const DEFAULT_META = () => ({ cliente: '', tagline: '', agencia: 'Mantora Lab', ano: String(new Date().getFullYear()), data: '', estrategista: '', estilo: 'mantora', logoMantora: true, brand: '#582aab', dark: '#400958', accent: '#704bfd', idvPos: 'before', idvExcl: [], off: [] });
function newProject(name, data) {
  const id = uid(), d = data || {};
  state.projects[id] = { id, name, meta: { ...DEFAULT_META(), cliente: name, ...(d.meta || {}) }, data: d.data || {}, check: d.check || {}, research: d.research || {}, validation: d.validation || {}, audit: d.audit || {} };
  state.cur = id; save(); return id;
}
async function switchProject(id) { state.cur = id; save(); await loadAssets(); view = 'home'; render(); }
function ensureSec(sec) {
  const d = (P().data[sec.id] ||= {});
  sec.fields.forEach(f => {
    if (f.t === 'rows') {
      d[f.k] = Array.isArray(d[f.k]) ? d[f.k] : [];
      const min = f.min || 1;
      while (d[f.k].length < min) { const base = {}; f.cols.forEach(c => base[c.k] = ''); d[f.k].push({ ...base, ...((f.def || [])[d[f.k].length] || {}) }); }
    } else if (f.t === 'list') d[f.k] = Array.isArray(d[f.k]) ? d[f.k] : [];
    else d[f.k] = d[f.k] ?? '';
  });
  d.notas = d.notas ?? '';
  return d;
}
function isDefault(f, r, c) { return (f.def || []).some(x => x[c] === r[c]); }
function pctSec(sec) {
  const d = P().data[sec.id] || {}; let n = 0, t = 0;
  sec.fields.forEach(f => {
    t++; const v = d[f.k];
    if (f.t === 'rows') { if ((v || []).some(r => f.cols.some(c => String(r[c.k] ?? '').trim() && !isDefault(f, r, c.k)))) n++; }
    else if (f.t === 'list') { if ((v || []).some(x => String(x).trim())) n++; }
    else if (String(v ?? '').trim()) n++;
  });
  return t ? Math.round(n / t * 100) : 0;
}
const pctAll = () => Math.round(SECTIONS.reduce((a, s) => a + pctSec(s), 0) / SECTIONS.length);
const isOff = id => (P().meta.off || []).includes(id);
function toggleOff(id, on) { const o = (P().meta.off ||= []), i = o.indexOf(id); if (on && i >= 0) o.splice(i, 1); if (!on && i < 0) o.push(id); save(); }
const secNum = s => String(SECTIONS.indexOf(s) + 1).padStart(2, '0');
// campos que ainda têm marcadores a revisar
function leftovers(sec) {
  const d = P().data[sec.id] || {}, bad = /\.\.\.|\[[^\]]*\]|lorem|xxx|preencher/i; let n = 0;
  sec.fields.filter(f => f.k !== 'material').forEach(f => { const v = d[f.k]; const txts = f.t === 'rows' ? (v || []).flatMap(r => Object.values(r)) : f.t === 'list' ? (v || []) : [v]; txts.forEach(x => { if (bad.test(String(x ?? ''))) n++; }); });
  return n;
}

/* ---------- Navegação ---------- */
const hero = (eb, title, desc, act = '') => `<div class="hero"><div class="arc a1"></div><div class="arc a2"></div><div class="heroin"><div class="eyebrow">${eb}</div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${act ? `<div class="heroact">${act}</div>` : ''}</div>`;
function renderNav() {
  const p = P(), nav = $('#nav');
  $('#brandLogo').innerHTML = typeof MANTORA_LOGO !== 'undefined' ? `<svg viewBox="${MANTORA_LOGO.full.vb.join(' ')}"><path d="${MANTORA_LOGO.full.d}"/></svg>` : '<b style="color:#fff;font-size:22px">mantora</b>';
  if (!p) { nav.innerHTML = ''; return; }
  let h = `<a data-v="home" class="${view === 'home' ? 'on' : ''}"><i>⌂</i>Visão geral & checklist</a><a data-v="pesquisa" class="${view === 'pesquisa' ? 'on' : ''}"><i>⌕</i>Pesquisa com IA<span class="pc ${Object.keys(P().research || {}).length >= 5 ? 'full' : ''}">${Object.keys(P().research || {}).length || '—'}</span></a><a data-v="projeto" class="${view === 'projeto' ? 'on' : ''}"><i>◐</i>Projeto & IDV<span class="pc ${assets.idv.length ? 'full' : ''}">${assets.idv.length ? assets.idv.length + ' págs' : '—'}</span></a>`;
  let last = '';
  SECTIONS.forEach(s => {
    if (s.stage !== last) { last = s.stage; h += `<div class="grp">${s.stage}</div>`; }
    const v = pctSec(s);
    h += `<a data-v="${s.id}" class="${view === s.id ? 'on' : ''} ${isOff(s.id) ? 'off' : ''}"><i>${secNum(s)}</i>${s.title}<span class="pc ${v >= 90 ? 'full' : ''}" data-pc="${s.id}">${v}%</span></a>`;
  });
  h += `<a data-v="deck" class="gen ${view === 'deck' ? 'on' : ''}"><i>▶</i>Revisar & gerar apresentação</a>`;
  nav.innerHTML = h;
  nav.querySelectorAll('a').forEach(a => a.onclick = () => go(a.dataset.v));
}
function renderProjSel() {
  const sel = $('#projSel'), ids = Object.keys(state.projects);
  sel.innerHTML = ids.map(i => `<option value="${i}" ${i === state.cur ? 'selected' : ''}>${esc(state.projects[i].name)}</option>`).join('') || '<option>Nenhum cliente</option>';
}
function go(v) { view = v; render(); $('#main').scrollTop = 0; }
function render() {
  renderProjSel(); renderNav();
  const m = $('#main');
  if (!P()) { m.innerHTML = welcome(); $('#wNew').onclick = () => $('#newProj').click(); const we = $('#wEx'); if (we) we.onclick = loadExample; return; }
  if (view === 'home') m.innerHTML = homeView();
  else if (view === 'projeto') m.innerHTML = projetoView();
  else if (view === 'pesquisa') m.innerHTML = pesquisaView();
  else if (view === 'deck') { m.innerHTML = deckView(); initDeck(); }
  else { const s = SECTIONS.find(x => x.id === view); m.innerHTML = sectionView(s); }
  bindMain();
  if (view === 'pesquisa') bindPesquisa();
}

/* ---------- Telas ---------- */
function welcome() {
  return `<div class="wrap">${hero('Mantora Lab · Planejamento estratégico', 'Do briefing à apresentação pronta', 'A estrategista preenche cada tópico, sobe a IDV do cliente e a plataforma entrega a apresentação — pronta para apresentar, exportar em PDF ou editar no Canva.', '<button class="btn light" id="wNew">+ Novo cliente</button>' + (typeof EXEMPLO !== 'undefined' ? '<button class="btn dark" id="wEx">Carregar exemplo (Adriano Atanes)</button>' : ''))}</div>`;
}
function homeView() {
  const p = P(), tot = pctAll();
  const chk = CHECKLIST.map((g, gi) => `<div class="box"><h3>${g.stage}</h3>${g.items.map((it, ii) => { const k = gi + '.' + ii, on = !!p.check[k]; return `<label class="chk ${on ? 'done' : ''}"><input type="checkbox" data-ck="${k}" ${on ? 'checked' : ''}><span>${esc(it)}</span></label>`; }).join('')}</div>`).join('');
  const done = Object.values(p.check).filter(Boolean).length, all = CHECKLIST.reduce((a, g) => a + g.items.length, 0);
  const filledN = SECTIONS.filter(s => pctSec(s) >= 60).length;
  return `<div class="wrap">${hero(esc(p.meta.agencia || 'Mantora Lab'), esc(p.name), 'Preencha os tópicos do menu na ordem, envie a IDV e gere a apresentação. Cada tópico traz um prompt pronto para o Claude devolver o conteúdo em JSON — é só colar.', '<button class="btn light" id="goNext">Continuar de onde parou →</button>')}
  <div class="grid2"><div class="box"><h3>Conteúdo preenchido</h3><p class="h">${filledN} de ${SECTIONS.length} tópicos com mais de 60%</p><div class="prog"><div style="width:${tot}%"></div></div><div class="stat">${tot}%</div></div>
  <div class="box"><h3>Checklist do processo</h3><p class="h">Etapas da planilha executiva</p><div class="prog"><div style="width:${Math.round(done / all * 100)}%"></div></div><div class="stat">${done}/${all}</div></div></div>
  <div class="box tools"><h3>① Contextualizar o Claude</h3><p class="h">Antes de rodar os prompts dos tópicos, crie o projeto do cliente no Claude, suba os arquivos (briefing, DNA do Expert, pesquisa de mercado, call) e cole este prompt. Ele se atualiza com os dados do tópico <b>Briefing & DNA</b>.</p><textarea id="ctxBox" readonly rows="6">${esc(contextPrompt(p))}</textarea><div style="margin-top:10px"><button class="btn ghost xs" id="cpCtx">Copiar prompt de contexto</button></div></div>
  <div class="box" style="background:linear-gradient(120deg,#400958,#582aab);color:#fff;border:0"><h3 style="font-size:17px">✨ Preencher tudo com IA</h3><p class="h" style="color:#dacdf6">Cole o material do cliente no tópico <b>Briefing & DNA</b> e deixe o Claude gerar todos os tópicos pendentes, em ordem, mantendo a coerência entre eles. ${AI.key ? 'IA conectada.' : 'Antes, conecte sua chave em ⚙ IA.'}</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn light" id="aiAll">Gerar todos os tópicos pendentes</button><button class="btn dark" id="aiSet">⚙ Configurar IA</button></div></div>
  <div class="box"><h3>Fluxo de trabalho</h3><p class="h" style="margin:0">1) <b>Projeto & IDV</b>: cores, fotos e upload da IDV · 2) <b>Tópicos</b>, na ordem do menu (prompt → Claude → colar JSON → revisar) · 3) <b>Revisar & gerar</b>: confira, apresente, exporte PDF ou baixe o PPTX para editar no Canva.</p></div>
  ${chk}</div>`;
}
function projetoView() {
  const m = P().meta;
  const ph = (k, t, d) => `<div class="ph"><b>${t}</b>${assets[k] ? `<img src="${assets[k]}">` : `<div style="color:var(--muted);font-size:12px;margin-bottom:8px">${d}</div>`}<label class="btn ghost xs" style="display:inline-block;cursor:pointer">${assets[k] ? 'Trocar' : 'Enviar'}<input type="file" accept="image/*" hidden data-photo="${k}"></label>${assets[k] ? ` <button class="btn danger xs" data-rmphoto="${k}">Remover</button>` : ''}</div>`;
  const grid = assets.idv.map((s, i) => `<div class="${(m.idvExcl || []).includes(i) ? 'off' : ''}"><img src="${s}"><span>${i + 1}</span><button class="btn xs ${((m.idvExcl || []).includes(i)) ? '' : 'danger'} x" data-idvx="${i}">${(m.idvExcl || []).includes(i) ? 'Incluir' : 'Ocultar'}</button></div>`).join('');
  const inp = (k, label, ph = '') => `<div><label class="l">${label}</label><input type="text" data-m="${k}" value="${esc(m[k])}" placeholder="${esc(ph)}"></div>`;
  return `<div class="wrap">${hero('Configuração', 'Projeto & IDV', 'Dados da capa, cores e estilo da apresentação e upload da IDV que abre o material.')}
  <div class="box"><h3>Dados do cliente e da apresentação</h3><div class="grid2">${inp('cliente', 'Nome do cliente')}${inp('tagline', 'Subtítulo da capa', 'IA aplicada à carreira e ao negócio em tecnologia')}${inp('estrategista', 'Estrategista responsável', 'Nome da estrategista')}${inp('data', 'Data da apresentação', 'Outubro de 2026')}${inp('agencia', 'Agência')}${inp('ano', 'Ano')}</div></div>
  <div class="box"><h3>Cores da IDV do cliente</h3><p class="h">Pegue da paleta da identidade visual — todos os slides se adaptam automaticamente.</p><div style="display:flex;gap:30px;flex-wrap:wrap"><div><label class="l" style="margin-top:0">Cor principal</label><input type="color" data-m="brand" value="${m.brand}"></div><div><label class="l" style="margin-top:0">Cor escura (fundos)</label><input type="color" data-m="dark" value="${m.dark}"></div><div><label class="l" style="margin-top:0">Cor de destaque</label><input type="color" data-m="accent" value="${m.accent}"></div></div>
  <div style="margin-top:20px;display:flex;gap:26px;flex-wrap:wrap;align-items:center"><div><label class="l" style="margin:0 0 6px">Estilo tipográfico dos slides</label><select class="f" data-m="estilo" style="width:auto"><option value="mantora" ${m.estilo === 'mantora' ? 'selected' : ''}>Mantora (fino, caixa alta)</option><option value="editorial" ${m.estilo !== 'mantora' ? 'selected' : ''}>Editorial (serifado)</option></select></div><label class="chk" style="margin-top:18px"><input type="checkbox" data-mchk="logoMantora" ${m.logoMantora !== false ? 'checked' : ''}><span>Exibir logo Mantora na capa e no encerramento</span></label></div></div>
  <div class="box"><h3>Fotos e logo do cliente</h3><p class="h">Foto de capa/divisórias (horizontal), retrato (arquétipo e bio) e logo do cliente (PNG).</p><div class="photos">${ph('foto1', 'Foto de capa', 'Fundo da capa e divisórias')}${ph('foto2', 'Foto retrato', 'Arquétipo e avatar da bio')}${ph('logo', 'Logo do cliente', 'Capa e encerramento')}</div></div>
  <div class="box"><h3>IDV do cliente</h3><p class="h">Envie o PDF da identidade visual (ou imagens). Cada página vira um slide, no início da apresentação.</p>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="btn" style="cursor:pointer">Enviar IDV (PDF ou imagens)<input type="file" id="idvFile" accept="application/pdf,image/*" multiple hidden></label>${assets.idv.length ? `<button class="btn danger xs" id="idvClear">Remover IDV</button>` : ''}<span id="idvStatus" class="chip" style="${assets.idv.length ? '' : 'display:none'}">${assets.idv.length} páginas</span></div>
  <div style="margin-top:14px"><label class="l" style="display:inline;margin-right:10px">Posição da IDV:</label><select class="f" data-m="idvPos" style="width:auto"><option value="before" ${m.idvPos !== 'after' ? 'selected' : ''}>Antes do planejamento</option><option value="after" ${m.idvPos === 'after' ? 'selected' : ''}>Depois do planejamento</option></select></div>
  <div class="idvgrid">${grid}</div></div></div>`;
}
function fieldHTML(sec, f, d) {
  const v = d[f.k], hint = f.hint ? `<small>${esc(f.hint)}</small>` : '';
  if (f.t === 'text') return `<label class="l">${f.label}${hint}</label><input type="text" data-f="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}">`;
  if (f.t === 'area') return `<label class="l">${f.label}${hint}</label><textarea data-f="${f.k}" placeholder="${esc(f.ph || '')}" rows="3">${esc(v)}</textarea>`;
  if (f.t === 'list') return `<label class="l">${f.label}<small>Um item por linha</small></label><textarea data-f="${f.k}" data-list="1" rows="4" placeholder="${esc(f.ph || '')}">${esc((v || []).join('\n'))}</textarea>`;
  const cols = f.cols.length <= 2 ? f.cols.length : 2;
  return `<label class="l">${f.label}</label>${v.map((row, i) => `<div class="rowc"><span class="rn">${i + 1}</span><button class="btn danger xs rx" data-rm="${f.k}:${i}">✕</button><div class="cols" style="grid-template-columns:repeat(${cols},1fr)">${f.cols.map(c => `<div class="c"><label>${c.label}</label>${c.t === 'area' ? `<textarea data-f="${f.k}" data-i="${i}" data-c="${c.k}" rows="2" placeholder="${esc(c.ph || '')}">${esc(row[c.k])}</textarea>` : `<input type="text" data-f="${f.k}" data-i="${i}" data-c="${c.k}" value="${esc(row[c.k])}" placeholder="${esc(c.ph || '')}">`}</div>`).join('')}</div></div>`).join('')}<button class="btn ghost xs" data-add="${f.k}">+ ${f.add || 'Adicionar'}</button>`;
}
function sectionView(sec) {
  const d = ensureSec(sec);
  const prompt = buildPrompt(sec, P().meta.cliente, P());
  const i = SECTIONS.indexOf(sec);
  return `<div class="wrap">${hero(`(${secNum(sec)}) ${sec.stage}`, sec.title, sec.desc)}
  ${sec.manual ? sprintBox() : ''}<div class="box tools" ${sec.manual ? 'style="display:none"' : ''}><h3>✨ Preencher com o Claude</h3><p class="h">Um clique em <b>Gerar com IA</b> preenche o tópico usando o material do cliente e o que já foi definido nos outros tópicos (conecte a chave em ⚙ IA). Ou copie o prompt, rode no Claude do projeto e cole a resposta abaixo. Sempre revise antes de apresentar.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn" id="aiGen">✨ Gerar com IA</button><button class="btn ghost xs" id="cpPrompt">Copiar prompt</button><button class="btn ghost xs" id="togPrompt">Ver prompt</button></div>
  <textarea id="promptBox" readonly rows="9" style="display:none;margin-bottom:12px">${esc(prompt)}</textarea>
  <textarea id="pasteJson" rows="3" placeholder="Cole aqui a resposta JSON do Claude…"></textarea><div style="margin-top:8px"><button class="btn xs" id="impJson">Importar resposta</button></div></div>
  <div class="box">${sec.fields.map(f => fieldHTML(sec, f, d)).join('')}${sec.id === 'briefing' ? '<div style="margin-top:10px"><label class="btn ghost xs" style="cursor:pointer">📎 Anexar arquivos (.txt .md .pdf) ao material-base<input type="file" id="attachFiles" accept=".txt,.md,.pdf,.json,.csv" multiple hidden></label></div>' : ''}</div>
  <div class="box"><h3>Notas de fala (script)</h3><p class="h">Opcional. O que falar ao apresentar estes slides — aparece no modo apresentação (tecla N) e nas notas do PPTX.</p><textarea data-f="notas" rows="4" placeholder="Pontos-chave, histórias, perguntas para o cliente…">${esc(d.notas)}</textarea>
  <label class="chk" style="margin-top:14px"><input type="checkbox" data-incl="${sec.id}" ${isOff(sec.id) ? '' : 'checked'}><span>Incluir este tópico na apresentação</span></label></div>
  <div style="display:flex;justify-content:space-between">${i > 0 ? `<button class="btn ghost" id="prevSec">← ${SECTIONS[i - 1].title}</button>` : '<span></span>'}<button class="btn" id="nextSec">${i < SECTIONS.length - 1 ? SECTIONS[i + 1].title + ' →' : 'Revisar & gerar →'}</button></div></div>`;
}
function sprintBox() {
  const st = sprintStatus(P());
  return `<div class="box" style="border-color:#d9ccff;background:#faf7ff"><h3>Critérios de pronto do sprint (POP, etapa 3)</h3><p class="h">Este passo é manual: copie as frases EXATAS, elas são matéria-prima direta de copy. A IA usa estes dados com prioridade sobre qualquer inferência.</p>${st.map(c => `<span class="chip ${c.ok ? 'ok' : 'mid'}" style="margin:0 6px 6px 0">${c.ok ? '✓' : '○'} ${esc(c.t)}</span>`).join('')}<p class="h" style="margin:10px 0 0">Onde buscar: facebook.com/ads/library (anúncios mais antigos = os que convertem) · 2 posts mais engajados de cada concorrente no Instagram/YouTube · "[concorrente] reclame aqui" · vídeo mais visto do problema principal no YouTube.</p></div>`;
}
function deckView() {
  const rows = SECTIONS.map(s => { const v = pctSec(s), lo = leftovers(s), off = isOff(s.id); return `<tr><td>${secNum(s)}</td><td><b>${s.title}</b></td><td><span class="chip ${v >= 80 ? 'ok' : v >= 30 ? 'mid' : 'no'}">${v}%</span>${lo ? ` <span class="chip mid" title="Campos com '...' ou [colchetes]">${lo} a revisar</span>` : ''}</td><td><label class="chk" style="padding:0"><input type="checkbox" data-incl="${s.id}" ${off ? '' : 'checked'}><span>incluir</span></label></td><td><button class="btn ghost xs" data-edit="${s.id}">Editar</button></td></tr>`; }).join('');
  const nsrc = typeof allSources === 'function' ? allSources(P()).length : 0;
  const rowsX = nsrc ? `<tr><td>⌕</td><td><b>Fontes da pesquisa</b></td><td><span class="chip ok">${nsrc} fontes</span></td><td><label class="chk" style="padding:0"><input type="checkbox" data-incl="pesquisa" ${isOff('pesquisa') ? '' : 'checked'}><span>incluir</span></label></td><td><button class="btn ghost xs" data-edit="pesquisa">Ver</button></td></tr>` : '';
  const vp = typeof validationProgress === 'function' ? validationProgress(P()) : { done: 0, total: 0 }, hasRes = Object.keys(P().research || {}).length;
  const rowsV = hasRes ? `<tr><td>✓</td><td><b>Validação da pesquisa (checklist)</b></td><td><span class="chip ${vp.done === vp.total ? 'ok' : 'mid'}">${vp.done}/${vp.total}</span></td><td></td><td><button class="btn ghost xs" data-edit="pesquisa">Abrir</button></td></tr>` : '';
  return `<div class="wrap" style="max-width:1180px">${hero('Etapa final', 'Revisar & gerar', 'Confira o que está pronto, escolha o que entra na apresentação e exporte.', '<button class="btn light" id="dPresent">▶ Apresentar</button><button class="btn dark" id="dPdf">⬇ PDF</button><button class="btn dark" id="dPptx">⬇ PPTX editável (Canva)</button><button class="btn dark" id="dDocx">⬇ Word (.docx)</button><button class="btn dark" id="dMd">⬇ Pacote .md</button><button class="btn dark" id="dHtml">⬇ HTML</button>')}
  <div class="box"><h3>Revisão dos tópicos</h3><p class="h">Tópicos vazios ou desmarcados não geram slides.</p><table class="rev">${rows}${rowsX}${rowsV}</table></div>
  ${!assets.idv.length ? `<div class="warn">Nenhuma IDV enviada ainda — a apresentação será gerada sem as páginas de identidade visual.</div>` : ''}
  <div class="sticky"><b id="cnt"></b><span class="sp"></span><button class="btn ghost xs" id="dRefresh">↻ Atualizar prévia</button></div>
  <div id="deckList"></div></div>`;
}

/* ---------- Deck ---------- */
let currentSlides = [], currentNotes = [];
function buildAll() {
  const p = P(), excl = p.meta.idvExcl || [], idv = idvSlides(assets, excl), after = p.meta.idvPos === 'after';
  const strat = buildSlides(p, { ...assets, idv: after ? [] : new Array(idv.length) });
  const z = idv.map(() => '');
  return { slides: after ? [...strat, ...idv] : [...idv, ...strat], notes: after ? [...strat.notes, ...z] : [...z, ...strat.notes] };
}
const allSlides = () => buildAll().slides;
function initDeck() {
  const list = $('#deckList');
  const draw = () => {
    const b = buildAll(); currentSlides = b.slides; currentNotes = b.notes;
    list.innerHTML = currentSlides.map((s, i) => `<div class="sw"><span class="no">${i + 1}</span>${currentNotes[i] ? '<span class="nt">com notas</span>' : ''}${s}</div>`).join('');
    $('#cnt').textContent = `${currentSlides.length} slides`; scaleDeck();
  };
  draw();
  $('#dRefresh').onclick = draw;
  $('#dPresent').onclick = () => present(0);
  $('#dPdf').onclick = exportPdf;
  $('#dHtml').onclick = exportHtml;
  $('#dDocx').onclick = exportDocx;
  $('#dMd').onclick = exportMdPack;
  $('#dPptx').onclick = exportPptxUI;
  window.onresize = scaleDeck;
  window.__redraw = draw;
}
function scaleDeck() { const l = $('#deckList'); if (!l) return; l.style.setProperty('--k', l.clientWidth / 1440); }
let pIdx = 0;
function present(i) {
  pIdx = i; const el = $('#present'); el.classList.add('on');
  try { el.requestFullscreen && el.requestFullscreen(); } catch (e) {}
  showP(); window.addEventListener('keydown', pKey); el.onclick = ev => { if (ev.target.closest('.nts')) return; pIdx = Math.min(currentSlides.length - 1, pIdx + 1); showP(); };
}
function showP() {
  const k = Math.min(innerWidth / 1440, innerHeight / 810), st = $('#stage');
  st.style.width = 1440 * k + 'px'; st.style.height = 810 * k + 'px';
  st.innerHTML = currentSlides[pIdx]; st.firstElementChild.style.transform = `scale(${k})`;
  const n = $('#nts'); n.textContent = currentNotes[pIdx] || '(sem notas de fala para este slide)';
}
function pKey(e) {
  if (e.key === 'Escape') { $('#present').classList.remove('on'); window.removeEventListener('keydown', pKey); if (document.fullscreenElement) document.exitFullscreen(); return; }
  if (e.key === 'n' || e.key === 'N') { const n = $('#nts'); n.style.display = n.style.display === 'block' ? 'none' : 'block'; return; }
  if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) pIdx = Math.min(currentSlides.length - 1, pIdx + 1);
  if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) pIdx = Math.max(0, pIdx - 1);
  showP();
}
function exportPdf() {
  $('#printDeck').innerHTML = allSlides().join('');
  toast('No diálogo: destino "Salvar como PDF", margens "Nenhuma" e ative "Gráficos de plano de fundo".');
  setTimeout(() => { window.print(); }, 400);
}
window.addEventListener('afterprint', () => { const p = $('#printDeck'); if (p) p.innerHTML = ''; });
const fileBase = () => (P().meta.cliente || 'planejamento').replace(/[^\w]+/g, '_');
const FONTS_LINK = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&family=Source+Serif+4:ital,wght@0,500;0,600;0,700;1,500&display=swap" rel="stylesheet">';
function exportHtml() {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Planejamento Estratégico · ${esc(P().meta.cliente)}</title>${FONTS_LINK}<style>html,body{margin:0;background:#0b0b1c}.sw{position:relative;margin:0 auto 18px;overflow:hidden}.sw .slide{position:absolute;left:0;top:0;transform-origin:0 0}@media print{@page{size:1440px 810px;margin:0}.sw{margin:0!important;width:1440px!important;height:810px!important}.sw .slide{transform:none!important}}${DECK_CSS}</style></head><body>${allSlides().map(s => `<div class="sw">${s}</div>`).join('')}<script>function fit(){var k=Math.min(innerWidth/1440,1.4);document.querySelectorAll('.sw').forEach(function(w){w.style.width=1440*k+'px';w.style.height=810*k+'px';w.firstElementChild.style.transform='scale('+k+')'})}fit();addEventListener('resize',fit)<\/script></body></html>`;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = `Planejamento_Estrategico_${fileBase()}.html`; a.click();
}
async function exportPptxUI() {
  const b = buildAll(), btn = $('#dPptx');
  try {
    btn.disabled = true;
    await exportPptx(b.slides, b.notes, { title: `Planejamento Estratégico · ${P().meta.cliente}`, fileName: `Planejamento_Estrategico_${fileBase()}.pptx`, onProgress: (i, n) => { btn.textContent = `Gerando ${i}/${n}…`; } });
    toast('PPTX baixado. No Canva: Criar um design → Importar arquivo → escolha o .pptx (textos e formas ficam editáveis).');
  } catch (e) { console.error(e); toast('Erro ao gerar o PPTX: ' + (e.message || e)); }
  btn.disabled = false; btn.textContent = '⬇ PPTX editável (Canva)';
}
window.__pptxBlob = async () => { const b = buildAll(); return exportPptx(b.slides, b.notes, { mode: 'blob' }); };

/* ---------- Eventos ---------- */
function bindMain() {
  const m = $('#main'), p = P(); if (!p) return;
  m.querySelectorAll('[data-ck]').forEach(c => c.onchange = () => { p.check[c.dataset.ck] = c.checked; c.parentElement.classList.toggle('done', c.checked); save(); });
  m.querySelectorAll('[data-m]').forEach(i => i.oninput = i.onchange = () => { p.meta[i.dataset.m] = i.value; if (i.dataset.m === 'cliente') { p.name = i.value || p.name; renderProjSel(); } save(); });
  m.querySelectorAll('[data-mchk]').forEach(i => i.onchange = () => { p.meta[i.dataset.mchk] = i.checked; save(); });
  m.querySelectorAll('[data-incl]').forEach(c => c.onchange = () => { toggleOff(c.dataset.incl, c.checked); renderNav(); if (view === 'deck') window.__redraw && window.__redraw(); });
  m.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => go(b.dataset.edit));
  m.querySelectorAll('[data-photo]').forEach(i => i.onchange = async () => { const f = i.files[0]; if (!f) return; const url = await imgToData(f, i.dataset.photo === 'logo' ? 600 : 1800); assets[i.dataset.photo] = url; await idb.set(p.id + ':' + i.dataset.photo, url); render(); });
  m.querySelectorAll('[data-rmphoto]').forEach(b => b.onclick = async () => { assets[b.dataset.rmphoto] = ''; await idb.del(p.id + ':' + b.dataset.rmphoto); render(); });
  const idv = $('#idvFile'); if (idv) idv.onchange = () => processIdv([...idv.files]);
  const ic = $('#idvClear'); if (ic) ic.onclick = async () => { assets.idv = []; p.meta.idvExcl = []; await idb.del(p.id + ':idv'); save(); render(); };
  m.querySelectorAll('[data-idvx]').forEach(b => b.onclick = () => { const i = +b.dataset.idvx, ex = (p.meta.idvExcl ||= []), at = ex.indexOf(i); at >= 0 ? ex.splice(at, 1) : ex.push(i); save(); render(); });
  if (view === 'home') {
    const g = $('#goNext'); if (g) g.onclick = () => { const s = SECTIONS.find(x => pctSec(x) < 60); go(!assets.idv.length && !s ? 'projeto' : s ? s.id : 'deck'); };
    const ga = $('#aiAll'); if (ga) ga.onclick = aiFillAll; const gs = $('#aiSet'); if (gs) gs.onclick = openAiSettings;
    const c = $('#cpCtx'); if (c) c.onclick = () => navigator.clipboard.writeText($('#ctxBox').value).then(() => toast('Contexto copiado! Cole no Claude do projeto.'));
  }
  const sec = SECTIONS.find(s => s.id === view);
  if (sec) {
    const d = P().data[sec.id];
    m.querySelectorAll('[data-f]').forEach(el => el.oninput = () => {
      const k = el.dataset.f;
      if (el.dataset.i !== undefined) d[k][+el.dataset.i][el.dataset.c] = el.value;
      else if (el.dataset.list) d[k] = el.value.split('\n').map(x => x.trim()).filter(Boolean);
      else d[k] = el.value;
      save(); const pc = document.querySelector(`[data-pc="${sec.id}"]`); if (pc) { const v = pctSec(sec); pc.textContent = v + '%'; pc.classList.toggle('full', v >= 90); }
    });
    m.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const f = sec.fields.find(x => x.k === b.dataset.add), r = {}; f.cols.forEach(c => r[c.k] = ''); d[f.k].push(r); save(); keepScroll(); });
    m.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const [k, i] = b.dataset.rm.split(':'); d[k].splice(+i, 1); save(); keepScroll(); });
    $('#aiGen').onclick = () => aiFillOne(sec);
    const af = $('#attachFiles'); if (af) af.onchange = () => aiAttachFiles([...af.files]);
    $('#cpPrompt').onclick = () => navigator.clipboard.writeText($('#promptBox').value).then(() => toast('Prompt copiado! Cole no Claude do projeto.'));
    $('#togPrompt').onclick = () => { const b = $('#promptBox'); b.style.display = b.style.display === 'none' ? 'block' : 'none'; };
    $('#impJson').onclick = () => importJson(sec, $('#pasteJson').value);
    const i = SECTIONS.indexOf(sec);
    $('#nextSec').onclick = () => go(i < SECTIONS.length - 1 ? SECTIONS[i + 1].id : 'deck');
    const pv = $('#prevSec'); if (pv) pv.onclick = () => go(SECTIONS[i - 1].id);
  }
}
function keepScroll() { const y = $('#main').scrollTop; render(); $('#main').scrollTop = y; }
function importJson(sec, raw, quiet = false) {
  let t = String(raw || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) t = t.slice(a, b + 1);
  let o; try { o = JSON.parse(t); } catch (e) { if (quiet) return 0; return toast('JSON inválido — confira se copiou a resposta inteira.'); }
  const d = ensureSec(sec); let n = 0;
  sec.fields.forEach(f => {
    if (!(f.k in o)) return; const v = o[f.k]; n++;
    if (f.t === 'rows') d[f.k] = (Array.isArray(v) ? v : []).map(r => { const x = {}; f.cols.forEach(c => x[c.k] = Array.isArray(r[c.k]) ? r[c.k].join('\n') : String(r[c.k] ?? '')); return x; });
    else if (f.t === 'list') d[f.k] = (Array.isArray(v) ? v : String(v).split('\n')).map(x => String(x).trim()).filter(Boolean);
    else d[f.k] = Array.isArray(v) ? v.join('\n') : String(v ?? '');
  });
  save(); ensureSec(sec); if (quiet) return n; render(); toast(n ? `Importado: ${n} campo(s) preenchido(s). Revise e ajuste.` : 'Nenhum campo reconhecido no JSON.');
}

/* ---------- Imagens & IDV ---------- */
function imgToData(file, max) {
  return new Promise(res => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / im.width), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; const x = c.getContext('2d'); if (!/png|svg/.test(file.type)) { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(im, 0, 0, c.width, c.height); res(/png|svg/.test(file.type) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .9)); }; im.src = r.result; }; r.readAsDataURL(file); });
}
let workerReady;
async function pdfSetup() {
  if (workerReady) return workerReady;
  workerReady = (async () => {
    const url = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    try { const t = await (await fetch(url)).text(); pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([t], { type: 'text/javascript' })); } catch (e) { pdfjsLib.GlobalWorkerOptions.workerSrc = url; }
  })();
  return workerReady;
}
async function processIdv(files) {
  const p = P(), st = $('#idvStatus'), out = [], setS = t => { st.style.display = ''; st.textContent = t; };
  try {
    for (const f of files) {
      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
        setS('Lendo PDF…'); await pdfSetup();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          setS(`Convertendo página ${i}/${pdf.numPages}…`);
          const pg = await pdf.getPage(i), vp0 = pg.getViewport({ scale: 1 }), k = 1600 / vp0.width, vp = pg.getViewport({ scale: k });
          const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
          await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          out.push(c.toDataURL('image/jpeg', .86)); pg.cleanup();
        }
      } else if (f.type.startsWith('image/')) { setS('Processando imagem…'); out.push(await imgToData(f, 1600)); }
    }
    assets.idv = [...assets.idv, ...out]; await idb.set(p.id + ':idv', assets.idv); toast(`IDV carregada: ${out.length} página(s).`); render();
  } catch (e) { console.error(e); toast('Erro ao ler a IDV: ' + (e.message || e)); }
}

/* ---------- Projeto: criar / exportar / importar / exemplo ---------- */
async function loadExample() {
  if (typeof EXEMPLO === 'undefined') return toast('Este pacote não inclui o exemplo de cliente.');
  newProject('Adriano Atanes', { meta: { ...EXEMPLO.meta }, data: JSON.parse(JSON.stringify(EXEMPLO.data)) });
  await loadAssets(); view = 'home'; render(); toast('Exemplo carregado. Envie a IDV em "Projeto & IDV" para completar.');
}
$('#newProj').onclick = async () => { const n = prompt('Nome do cliente:'); if (!n) return; newProject(n.trim()); await loadAssets(); view = 'projeto'; render(); };
$('#aiBtn').onclick = openAiSettings;
$('#projSel').onchange = e => switchProject(e.target.value);
$('#menuBtn').onclick = () => {
  const o = prompt('Digite o número:\n1 – Exportar projeto (JSON)\n2 – Importar projeto (JSON)\n3 – Carregar exemplo (Adriano Atanes)\n4 – Excluir este cliente');
  if (o === '1' && P()) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ meta: P().meta, data: P().data, check: P().check, research: P().research || {}, validation: P().validation || {}, audit: P().audit || {} }, null, 1)], { type: 'application/json' })); a.download = `projeto_${P().name.replace(/\W+/g, '_')}.json`; a.click(); }
  else if (o === '2') $('#importFile').click();
  else if (o === '3') loadExample();
  else if (o === '4' && P() && confirm(`Excluir "${P().name}" e todos os dados? Não dá para desfazer.`)) { const id = P().id; ['idv', 'foto1', 'foto2', 'logo'].forEach(k => idb.del(id + ':' + k)); delete state.projects[id]; state.cur = Object.keys(state.projects)[0] || null; save(); loadAssets().then(() => { view = 'home'; render(); }); }
};
$('#importFile').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { const o = JSON.parse(await f.text()); newProject(o.meta?.cliente || 'Importado', { meta: { ...o.meta }, data: o.data || {}, check: o.check || {}, research: o.research || {}, validation: o.validation || {}, audit: o.audit || {} }); await loadAssets(); view = 'home'; render(); toast('Projeto importado.'); } catch (err) { toast('Arquivo inválido.'); }
  e.target.value = '';
};
let tT;
function toast(t) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); clearTimeout(tT); tT = setTimeout(() => d.remove(), 5000); }

/* ---------- Início ---------- */
(async () => { if (!state.cur || !state.projects[state.cur]) state.cur = Object.keys(state.projects)[0] || null; await loadAssets(); render(); })();

/* Modo demonstração por URL: ?demo=1&view=mercado (usado para testes e apresentações rápidas) */
(async () => {
  const q = new URLSearchParams(location.search);
  if (!q.get('demo')) return;
  await new Promise(r => setTimeout(r, 400));
  if (!Object.values(state.projects).some(p => p.name === 'Adriano Atanes')) await loadExample();
  else { const id = Object.keys(state.projects).find(i => state.projects[i].name === 'Adriano Atanes'); await switchProject(id); }
  go(q.get('view') || 'home');
})();
