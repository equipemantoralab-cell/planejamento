/* Aba "Pesquisa com IA": o Claude pesquisa na web (com fontes) tudo que o planejamento precisa.
   O resultado fica salvo no projeto e alimenta automaticamente a geração dos tópicos. */
const RESEARCH = [
  { id: 'mercado', title: 'Mercado e TAM · SAM · SOM', icon: '▲', feeds: ['mercado', 'projecoes', 'resumo'],
    ask: `Pesquise o tamanho e a dinâmica do mercado do nicho do cliente no Brasil (e referência global quando útil).
1. Explique brevemente o que são TAM, SAM e SOM e calcule os três pelo método bottom-up (nº de pessoas × ticket médio anual), mostrando a conta, as premissas e a faixa de faturamento realista do 1º ano de um entrante sem audiência grande.
2. Traga 3 números de contexto do setor (déficit de talentos, crescimento, adoção) com fonte e ano.
3. Liste 4 submercados quentes e pouco ocupados.
4. Dê a previsão de evolução para 5 anos, com fonte.` },
  { id: 'concorrencia', title: 'Concorrentes e brechas', icon: '⚔', feeds: ['conc', 'esteira', 'resumo'],
    ask: `Mapeie os 3 a 5 maiores concorrentes (diretos e indiretos) do cliente no Brasil e CONFIRME que são realmente do mesmo nicho.
Para cada um: quem é, produtos e preços atuais (planos e tickets), canais e tamanho de audiência, pontos fortes (4) e fracos/gaps (4), e a oportunidade para o cliente.
Termine com os 5 gaps críticos do mercado (produto, preço, público, formato, governança/outro) e uma frase de "espaço em branco" que o cliente pode ocupar.` },
  { id: 'publico', title: 'Público, dores e linguagem', icon: '☺', feeds: ['publico', 'marca', 'movimento'],
    ask: `Levante o perfil do público-alvo do cliente: dados demográficos (idade, gênero, renda, escolaridade, localização, situação) com fonte quando houver.
Depois, a partir de fóruns, YouTube, Reddit, LinkedIn, comentários e reviews, liste as 4 principais dores, os desejos, as objeções de compra e 10 expressões LITERAIS que o público usa para falar do problema.
Sugira 3 segmentos/personas candidatos, com prioridade e tamanho relativo.` },
  { id: 'produtos', title: 'Ofertas, preços e esteira do nicho', icon: '⇉', feeds: ['esteira', 'lancamento', 'projecoes'],
    ask: `Pesquise como o nicho monetiza: tipos de produto por nível (isca gratuita, low ticket, mid, high ticket, B2B), faixas de preço praticadas com exemplos reais, garantias, bônus e modelos de lançamento (perpétuo, CPL, desafio, webinário).
Indique o que funciona melhor para um entrante e uma esteira recomendada com tickets.` },
  { id: 'canais', title: 'Canais, formatos e horários', icon: '✦', feeds: ['posic', 'conteudo', 'diag'],
    ask: `Descubra onde o público do cliente está: plataformas mais usadas, horários de pico, formatos que performam (carrossel, reels, vídeo longo, newsletter, podcast), frequência de postagem dos concorrentes e benchmarks de engajamento, com fonte.
Recomende o papel de cada plataforma (principal, autoridade, aprofundamento, descoberta) e a frequência ideal.` },
  { id: 'benchmarks', title: 'Referências e benchmarks de posicionamento', icon: '★', feeds: ['diag', 'marca', 'posic'],
    ask: `Liste 3 a 5 especialistas ou marcas (nacionais e internacionais) que provam o modelo de posicionamento que o cliente quer ocupar. Para cada: o que fazem, tom de voz, canais, o que aprender e o que o cliente NÃO deve copiar.
Conclua com o espaço de posicionamento que nenhum deles ocupa.` },
  { id: 'tendencias', title: 'Tendências, regulação e riscos', icon: '↗', feeds: ['mercado', 'resumo', 'plano'],
    ask: `Levante as principais tendências do nicho nos próximos 24 meses, mudanças regulatórias ou de plataformas relevantes, riscos e ameaças (para o SWOT) e oportunidades emergentes, com fonte e data.` }
];

const RES_SYSTEM = `Você é pesquisador(a) de mercado sênior da Mantora Lab, agência de estratégia para especialistas e infoprodutores. Pesquise na web e entregue um relatório confiável.
Regras:
- Português do Brasil, linguagem simples e direta.
- Todo número ou afirmação factual deve ter fonte com link e ano. Prefira fontes oficiais, relatórios setoriais e páginas dos próprios concorrentes.
- Nunca invente dados. Se não encontrar, escreva "não encontrei dado confiável" e diga como estimar.
- Marque estimativas próprias como "estimativa" e mostre a conta.
- Formato: Markdown com seções "## Resumo" (até 6 linhas), "## Achados" (bullets com [fonte](url)), "## Análise para o cliente" e "## A confirmar". No máximo ~1200 palavras.`;

const resStore = P_ => (P_.research ||= {});
function researchContext(P_) {
  const b = P_.data.briefing || {}, ctx = ['nicho', 'avatar', 'momento', 'objetivo12', 'faturamento', 'produtos_atuais'].filter(k => String(b[k] || '').trim()).map(k => `- ${k}: ${b[k]}`).join('\n');
  const mat = typeof aiMaterial === 'function' ? aiMaterial(P_) : '';
  return `CLIENTE: ${P_.meta.cliente}\n${ctx ? `\nBRIEFING:\n${ctx}\n` : ''}${mat ? `\nMATERIAL-BASE DO CLIENTE:\n${mat.slice(0, 40000)}\n` : ''}`;
}
function researchPrompt(ask, P_) {
  return `${researchContext(P_)}\n---\nTAREFA DE PESQUISA:\n${ask}\n\nUse a busca na web. Entregue o relatório em Markdown no formato combinado.`;
}
// pesquisa relevante para o prompt de um tópico (prioriza os módulos ligados a ele)
function researchForPrompt(P_, secId) {
  const rs = P_.research || {}, ids = Object.keys(rs).filter(k => rs[k] && rs[k].text);
  if (!ids.length) return '';
  const prio = r => { const m = RESEARCH.find(x => x.id === r); return m && m.feeds.includes(secId) ? 0 : 1; };
  ids.sort((a, b) => prio(a) - prio(b));
  let out = '', total = 0;
  for (const id of ids) {
    const m = RESEARCH.find(x => x.id === id), t = `### ${m ? m.title : rs[id].title}\n${rs[id].text}\n`, cap = prio(id) === 0 ? 14000 : 5000;
    const part = t.length > cap ? t.slice(0, cap) + '…' : t;
    if (total + part.length > 36000) break;
    out += part; total += part.length;
  }
  return out;
}
function allSources(P_) {
  const seen = new Set(), out = [];
  Object.values(P_.research || {}).forEach(r => (r.sources || []).forEach(s => { if (s.url && !seen.has(s.url)) { seen.add(s.url); out.push(s); } }));
  return out;
}

/* ---- Markdown mínimo ---- */
function mdToHtml(src) {
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  const out = []; let ul = false;
  const close = () => { if (ul) { out.push('</ul>'); ul = false; } };
  String(src || '').split(/\r?\n/).forEach(line => {
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)/))) { close(); out.push(`<h4 style="margin:16px 0 6px;font-size:${m[1].length <= 2 ? 15.5 : 14}px">${inline(m[2])}</h4>`); }
    else if ((m = line.match(/^\s*[-*•]\s+(.*)/))) { if (!ul) { out.push('<ul style="margin:6px 0;padding-left:20px">'); ul = true; } out.push(`<li style="margin:3px 0">${inline(m[1])}</li>`); }
    else if (!line.trim()) close();
    else { close(); out.push(`<p style="margin:6px 0">${inline(line)}</p>`); }
  });
  close(); return out.join('');
}

/* ---- Execução ---- */
async function runResearch(id, customAsk, customTitle) {
  if (!AI.keyFor(researchProvider())) { openAiSettings(); return false; }
  const p = P(), mod = RESEARCH.find(x => x.id === id), ask = customAsk || (mod && mod.ask), title = customTitle || (mod && mod.title) || id;
  const text = await aiCall(researchPrompt(ask, p), { web: true, system: RES_SYSTEM, maxTokens: 12000, maxUses: 8, provider: researchProvider() });
  if (!text.trim()) throw new Error('A IA não devolveu texto. Tente novamente.');
  resStore(p)[id] = { title, ask: customAsk || '', text: text.trim(), sources: AI.lastSources.slice(), at: Date.now(), web: !AI.lastNoWeb && AI.lastSources.length > 0 };
  save(); return true;
}
async function runResearchOne(id, customAsk, customTitle) {
  if (!AI.keyFor(researchProvider())) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const mod = RESEARCH.find(x => x.id === id);
  AI.busy = true; aiStatus(`Pesquisando: ${customTitle || mod.title}… (1 a 3 minutos)`);
  try { await runResearch(id, customAsk, customTitle); toast('Pesquisa concluída. Revise e confira as fontes.'); }
  catch (e) { toast('IA: ' + (e.message || e)); }
  AI.busy = false; aiStatus(null); render();
}
async function runResearchAll(force) {
  if (!AI.keyFor(researchProvider())) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const rs = resStore(P()), todo = RESEARCH.filter(m => force || !(rs[m.id] && rs[m.id].text));
  if (!todo.length) return toast('Todas as pesquisas já foram feitas. Use "Refazer" em uma delas, se quiser atualizar.');
  if (!confirm(`O Claude vai pesquisar ${todo.length} tema(s) na web, um por vez (cerca de 1 a 3 minutos cada). Isso consome créditos da sua chave da API. Continuar?`)) return;
  AI.busy = true; AI.stop = false; const failed = [];
  for (let i = 0; i < todo.length; i++) {
    if (AI.stop) break;
    aiStatus(`Pesquisando ${i + 1}/${todo.length}: ${todo[i].title}`, () => { AI.stop = true; });
    try { await runResearch(todo[i].id); } catch (e) { failed.push(`${todo[i].title} (${e.message})`); if (/inválida|Limite/.test(e.message)) break; }
    renderNav();
  }
  AI.busy = false; aiStatus(null); render();
  toast(failed.length ? `Concluído com ${failed.length} falha(s): ${failed.join('; ')}` : AI.stop ? 'Pesquisa interrompida. O que já foi feito foi mantido.' : 'Pesquisa completa. Agora gere os tópicos — a IA usa estes dados.');
}

/* ---- Tela ---- */
function pesquisaView() {
  const p = P(), rs = resStore(p), customs = Object.keys(rs).filter(k => k.startsWith('extra_'));
  const done = RESEARCH.filter(m => rs[m.id] && rs[m.id].text).length, nsrc = allSources(p).length;
  const card = (id, title, icon, feeds, r) => {
    const has = r && r.text, when = has ? new Date(r.at).toLocaleDateString('pt-BR') : '';
    return `<div class="box" data-rc="${id}"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="font-size:20px;width:36px;height:36px;border-radius:10px;background:#eee8ff;color:#582aab;display:flex;align-items:center;justify-content:center">${icon}</div><div style="flex:1;min-width:200px"><h3 style="margin:0">${esc(title)}</h3><div class="mini" style="font-size:12.5px;color:var(--muted)">${has ? `${r.sources.length} fonte(s) · ${when}${r.web ? '' : ' · <b style="color:#9a6700">sem busca na web — confirme os dados</b>'}` : 'Ainda não pesquisado'}${feeds && feeds.length ? ` · alimenta: ${feeds.map(f => (SECTIONS.find(s => s.id === f) || { title: f }).title).join(', ')}` : ''}</div></div>
    <button class="btn ${has ? 'ghost' : ''} xs" data-run="${id}">${has ? '↻ Refazer' : '⌕ Pesquisar'}</button>${has ? `<button class="btn ghost xs" data-tog="${id}">Ver relatório</button>${id.startsWith('extra_') ? `<button class="btn danger xs" data-delres="${id}">Excluir</button>` : ''}` : ''}</div>
    ${has ? `<div id="rep_${id}" style="display:none;margin-top:14px"><div class="chip" style="margin-bottom:8px">Você pode editar o texto abaixo; ele alimenta os tópicos</div><textarea data-restext="${id}" rows="14" style="font-size:13px">${esc(r.text)}</textarea><div style="margin-top:12px;font-size:14px;line-height:1.5;border-top:1px solid var(--line);padding-top:6px">${mdToHtml(r.text)}</div>${r.sources.length ? `<div style="margin-top:10px"><b style="font-size:13px">Fontes consultadas</b><ul style="font-size:13px;padding-left:18px;margin:6px 0">${r.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(String(s.title).slice(0, 100))}</a></li>`).join('')}</ul></div>` : ''}</div>` : ''}</div>`;
  };
  return `<div class="wrap">${hero('Etapa 2 · Mercado', 'Pesquisa com IA', 'O Claude pesquisa na web, com fontes, tudo que o planejamento precisa: mercado, concorrentes, público, preços, canais, referências e tendências. O resultado alimenta automaticamente a geração de cada tópico.', `<button class="btn light" id="resAll">⌕ Pesquisar tudo</button><button class="btn dark" id="resSet">⚙ Configurar IA</button>${done ? '<button class="btn dark" id="resGen">Gerar tópicos com esta pesquisa →</button>' : ''}`)}
  ${!AI.keyFor(researchProvider()) ? `<div class="warn"><b>Conecte a IA primeiro:</b> clique em <b>⚙ Configurar IA</b> e cole sua chave (Claude, ChatGPT ou Gemini). Pesquisa agora: <b>${PROVIDERS[researchProvider()].name}</b>. A busca na web precisa estar ligada para trazer fontes atuais.</div>` : ''}
  <div class="grid2"><div class="box"><h3>Pesquisas concluídas</h3><p class="h">${done} de ${RESEARCH.length} temas</p><div class="prog"><div style="width:${Math.round(done / RESEARCH.length * 100)}%"></div></div></div><div class="box"><h3>Fontes reunidas</h3><p class="h">Entram na apresentação como slide de fontes</p><div class="stat">${nsrc}</div></div></div>
  ${RESEARCH.map(m => card(m.id, m.title, m.icon, m.feeds, rs[m.id])).join('')}
  ${customs.map(k => card(k, rs[k].title, '＋', [], rs[k])).join('')}
  <div class="box tools"><h3>Pesquisa extra</h3><p class="h">Tem uma dúvida específica do cliente? Escreva e o Claude pesquisa.</p><textarea id="resQ" rows="3" placeholder="Ex.: Quais eventos presenciais o público de tecnologia mais frequenta no Brasil e quanto custam os patrocínios?"></textarea><div style="margin-top:10px"><button class="btn xs" id="resExtra">⌕ Pesquisar</button></div></div></div>`;
}
function bindPesquisa() {
  const m = $('#main'), p = P();
  $('#resAll').onclick = () => runResearchAll(false);
  $('#resSet').onclick = openAiSettings;
  const g = $('#resGen'); if (g) g.onclick = () => { go('home'); setTimeout(aiFillAll, 50); };
  m.querySelectorAll('[data-run]').forEach(b => b.onclick = () => { const id = b.dataset.run, r = resStore(p)[id]; runResearchOne(id, r && r.ask, r && r.title); });
  m.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const e = document.getElementById('rep_' + b.dataset.tog); e.style.display = e.style.display === 'none' ? 'block' : 'none'; });
  m.querySelectorAll('[data-restext]').forEach(t => t.oninput = () => { resStore(p)[t.dataset.restext].text = t.value; save(); });
  m.querySelectorAll('[data-delres]').forEach(b => b.onclick = () => { if (confirm('Excluir esta pesquisa?')) { delete resStore(p)[b.dataset.delres]; save(); render(); } });
  $('#resExtra').onclick = () => { const q = $('#resQ').value.trim(); if (!q) return toast('Escreva a pergunta primeiro.'); runResearchOne('extra_' + uid(), q, q.length > 60 ? q.slice(0, 57) + '…' : q); };
}
