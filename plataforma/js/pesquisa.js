/* Aba "Pesquisa com IA" — baseada no POP de pesquisa da Mantora (Anexo A: prompt de pesquisa de mercado V01_2026).
   Etapas do POP cobertas: pesquisa com IA, cruzamento entre duas IAs, sprint manual de inteligência real,
   checklist de validação e geração dos documentos .md. */
const IMPORTANTE = `IMPORTANTE:
- Use dados reais e atualizados quando possível
- Faça estimativas conservadoras baseadas em padrões do mercado
- Seja específico com números e métricas
- Foque em insights acionáveis`;

const RESEARCH = [
  { id: 'escopo', grp: 'Núcleo (Anexo A)', title: 'Escopo, nicho e esteira de produtos', icon: '◎', feeds: ['briefing', 'esteira', 'resumo'],
    ask: `DEFINIÇÃO DO ESCOPO. Identifique e detalhe:\n- Nicho principal e subnichos\n- Produto/serviço ideal para lançamento e vendas perpétuas, sugerindo uma esteira de produto com produto inicial, produto mediano e produto de ticket mais alto\n- Proposta de valor única` },
  { id: 'avatar', grp: 'Núcleo (Anexo A)', title: 'Avatar: demografia, psicografia e comportamento digital', icon: '☺', feeds: ['publico', 'posic'],
    ask: `ANÁLISE DO AVATAR (CLIENTE IDEAL).\nDemografia — pesquise e defina: faixa etária predominante, gênero e distribuição, localização geográfica principal, faixa de renda média, nível de escolaridade comum e profissões mais frequentes.\nPsicografia — mapeie: 3 valores principais, estilo de vida característico, 2 principais aspirações, 3 medos mais comuns e 2 frustrações recorrentes.\nComportamento digital — identifique: 2 plataformas mais usadas, horários de pico online, tipos de conteúdo preferidos e influenciadores que seguem.` },
  { id: 'consciencia', grp: 'Núcleo (Anexo A)', title: 'Nível de consciência do mercado', icon: '◐', feeds: ['voz', 'conteudo'],
    ask: `NÍVEL DE CONSCIÊNCIA DO MERCADO. Com base no nicho e produto analisado, determine:\n- Qual o nível predominante de consciência do avatar sobre o problema? (Inconsciente / Consciente do problema / Consciente da solução / Consciente do produto / Mais consciente)\n- Justificativa: por que esse é o nível predominante?\n- Implicação para a comunicação: qual abordagem de copy se aplica neste nível e o que NÃO funciona comunicar diretamente\n- % estimada da audiência em cada nível (ex.: 60% consciente do problema, 30% consciente da solução, 10% mais consciente)` },
  { id: 'dores', grp: 'Núcleo (Anexo A)', title: 'Mapeamento de dores e desejos', icon: '✦', feeds: ['publico', 'voz', 'marca'],
    ask: `MAPEAMENTO DE DORES E DESEJOS. Liste as 5 principais dores com: descrição detalhada, como impacta a vida e nível de urgência (Alta/Média/Baixa).\nIdentifique também: estado atual vs. estado desejado, obstáculos percebidos e o sonho secreto não verbalizado.` },
  { id: 'concorrencia', grp: 'Núcleo (Anexo A)', title: 'Concorrentes, comunicação e gaps', icon: '⚔', feeds: ['conc', 'esteira', 'resumo'],
    ask: `ANÁLISE DA CONCORRÊNCIA. Pesquise e liste 5 concorrentes candidatos (diretos e indiretos misturados). Para cada um: nome, link, produto principal, ticket estimado e tamanho de audiência. CONFIRME que são do mesmo nicho e que existem de fato (Google/Instagram/YouTube). Classifique os 3 MAIS RELEVANTES para análise aprofundada, justificando a escolha.\nPara cada um dos 3 selecionados, analise: produtos & preços (todos os identificáveis, com preços); USP (promessa central/diferencial declarado); forças e fraquezas; ANÁLISE DE COMUNICAÇÃO (tom predominante, principais hooks e ângulos, tipo de prova social); e gaps (o que o público deles quer mas não encontra). Inclua também métricas de engajamento (seguidores, taxa estimada, comunidade) e se rodam anúncios pagos.\nAlém disso: 3 gaps consolidados entre todos os concorrentes e 1 espaço de posicionamento em aberto no mercado.` },
  { id: 'conteudo_mercado', grp: 'Núcleo (Anexo A)', title: 'Conteúdo do mercado', icon: '✎', feeds: ['conteudo', 'posic', 'tom'],
    ask: `ANÁLISE DO CONTEÚDO DE MERCADO. Identifique para o nicho: 3 formatos de conteúdo que mais geram engajamento e por quê; 2 temas/ângulos saturados (evitar repetir); 3 ângulos com baixa saturação e alta relevância para o avatar; qual plataforma tem maior gap de criadores qualificados; e 5 influenciadores do nicho (canal + tamanho de audiência aproximado).` },
  { id: 'mercado', grp: 'Núcleo (Anexo A)', title: 'Mercado: TAM · SAM · SOM, tendências e sazonalidade', icon: '▲', feeds: ['mercado', 'projecoes', 'resumo'],
    ask: `ANÁLISE DE MERCADO E METRIFICAÇÃO.\nExplique o que são TAM, SAM e SOM e calcule os três (bottom-up): TAM = população total × % mercado × ticket médio anual; SAM = TAM × % segmento × % alcance realista; SOM = SAM × % market share possível. Mostre a conta, as premissas e a faixa de faturamento realista do 1º ano para o porte atual do cliente. Cite as fontes com link.\nIdentifique também: volume de busca mensal do nicho; tendências em alta e em queda; sazonalidade (melhores e piores meses e eventos que movem a demanda); estágio, saturação e barreira de entrada do mercado; 3 números de contexto do setor; 4 submercados emergentes; e a previsão de 5 anos com fatores tecnológicos, sociais e econômicos.` },
  { id: 'keywords', grp: 'Núcleo (Anexo A)', title: 'Palavras-chave, custos e métricas de performance', icon: '⌕', feeds: ['mercado', 'projecoes', 'posic'],
    ask: `ANÁLISE DE PALAVRAS-CHAVE E CUSTOS. Pesquise as 5 principais palavras-chave com volume de busca mensal, CPC e CPM médios, dificuldade SEO e intenção de busca.\nCustos por plataforma — estime para Facebook, Google, YouTube e TikTok: CPM médio, CPC médio, CPL médio e taxa de conversão esperada.\nMÉTRICAS DE PERFORMANCE — benchmarks do mercado: CAC médio por canal, funil de conversão padrão (%), LTV médio e relação LTV:CAC, ROI esperado por canal. Sinalize quando for estimativa.` },
  { id: 'voz', grp: 'Núcleo (Anexo A)', title: 'Voz do mercado: objeções, linguagem e crenças', icon: '❝', feeds: ['voz', 'publico', 'movimento'],
    ask: `VOZ DO MERCADO. Use comentários reais, fóruns, YouTube, Reclame Aqui e avaliações.\nObjeções reais: liste as 5 principais objeções ao tipo de produto deste nicho; para cada uma, como é verbalizada, como contornar e intensidade (alta/média/baixa).\nLinguagem nativa do avatar: 10 frases que ele usa para descrever o problema (coloquial, como falaria a um amigo); 5 termos que RESSOAM; 5 termos que AFASTAM.\nCrenças limitantes: 5 crenças que impedem o público de resolver o problema, com como se formou cada uma e o argumento que a desfaz.\nSonho secreto não verbalizado: o que o avatar realmente quer além do resultado declarado.` },
  { id: 'historico', grp: 'Núcleo (Anexo A)', title: 'Histórico de vendas, preços, bônus e garantias', icon: '⇉', feeds: ['esteira', 'lancamento', 'projecoes'],
    ask: `HISTÓRICO DE VENDAS: 2 cases de sucesso (com números) e 1 fracasso notável com lições aprendidas.\nANÁLISE DE PREÇOS: faixas de preço (Low/Mid/High ticket) com exemplos reais, elasticidade e sensibilidade a preço, sweet spot de preço.\nBÔNUS E GARANTIAS: 3 bônus valorizados com valor percebido e o tipo de garantia ideal.` },
  { id: 'aquisicao', grp: 'Núcleo (Anexo A)', title: 'Estratégia de aquisição e projeções', icon: '➜', feeds: ['projecoes', 'plano', 'lancamento'],
    ask: `ESTRATÉGIA DE AQUISIÇÃO: mix ideal de canais (% do budget), budget por funil (captação, vendas e conteúdo) e CPL esperado por canal.\nPROJEÇÕES: 3 cenários (conservador / realista / otimista) com taxa de conversão, faturamento projetado e ROI esperado. Mostre as premissas.` },
  { id: 'sintese', grp: 'Núcleo (Anexo A)', title: 'Síntese estratégica e plano de ação', icon: '★', feeds: ['resumo', 'plano', 'identidade'],
    ask: `SÍNTESE ESTRATÉGICA: Big Idea única para o lançamento, promessa principal irresistível, mecanismo único de entrega, provas de conceito necessárias e meta SMART completa.\nPLANO DE AÇÃO: 7 próximos passos prioritários e práticos.` },
  { id: 'benchmarks', grp: 'Complementares', title: 'Referências e benchmarks de posicionamento', icon: '☆', feeds: ['diag', 'marca', 'posic'],
    ask: `Liste 3 a 5 especialistas ou marcas (nacionais e internacionais) que provam o modelo de posicionamento que o cliente quer ocupar. Para cada: o que fazem, tom de voz, canais, o que aprender e o que o cliente NÃO deve copiar. Conclua com o espaço de posicionamento que nenhum deles ocupa.` },
  { id: 'canais', grp: 'Complementares', title: 'Canais, formatos e horários', icon: '◍', feeds: ['posic', 'conteudo', 'diag'],
    ask: `Descubra onde o público do cliente está: plataformas mais usadas, horários de pico, formatos que performam, frequência de postagem dos concorrentes e benchmarks de engajamento, com fonte. Recomende o papel de cada plataforma (principal, autoridade, aprofundamento, descoberta) e a frequência ideal.` },
  { id: 'tendencias', grp: 'Complementares', title: 'Tendências, regulação e riscos', icon: '↗', feeds: ['mercado', 'resumo', 'plano'],
    ask: `Levante as principais tendências do nicho nos próximos 24 meses, mudanças regulatórias ou de plataformas relevantes, riscos e ameaças (para o SWOT) e oportunidades emergentes, com fonte e data.` }
];
const RES_IDS = RESEARCH.map(m => m.id);
const PROMPT_VERSION = 'Anexo A · Prompt de Pesquisa de Mercado V01_2026';

const RES_SYSTEM = `Você é pesquisador(a) de mercado sênior e especialista em vendas digitais da Mantora Lab, agência de estratégia para especialistas e infoprodutores. Pesquise na web e entregue um relatório confiável.
Regras:
- Português do Brasil, linguagem simples e direta.
- Todo número ou afirmação factual deve ter fonte com link e ano. Prefira fontes oficiais, relatórios setoriais e páginas dos próprios concorrentes.
- Nunca invente dados, concorrentes, preços ou números de CPM/CPC. Se não encontrar, escreva "não encontrei dado confiável" e diga como estimar.
- Marque estimativas próprias como "estimativa" e mostre a conta.
- Quando houver dados do "Sprint de inteligência real" (coletados à mão), eles têm PRIORIDADE sobre qualquer inferência.
- Formato: Markdown com "## Resumo" (até 6 linhas), "## Achados" (bullets com [fonte](url)), "## Análise para o cliente" e "## A confirmar". No máximo ~1300 palavras.`;

const resStore = P_ => (P_.research ||= {});

/* ---- Sprint de inteligência real (dados manuais) ---- */
function sprintMd(P_) {
  const d = (P_.data || {}).sprint || {}; const L = [];
  const rows = k => (d[k] || []).filter(r => Object.values(r).some(v => String(v || '').trim()));
  if (rows('anuncios').length) { L.push('### Meta Ads Library — anúncios ativos há mais tempo'); rows('anuncios').forEach(r => L.push(`- **${r.concorrente || '?'}** · promessa: ${r.promessa || '—'} · hook: "${r.hook || '—'}" · ativa: ${r.emocao || '—'} · formato: ${r.formato || '—'}`)); }
  if (rows('comentarios').length) { L.push('\n### Comentários reais (frases literais)'); rows('comentarios').forEach(r => { L.push(`**${r.concorrente || '?'}**`); String(r.frases || '').split('\n').filter(x => x.trim()).forEach(f => L.push(`- "${f.trim()}"`)); }); }
  if (rows('reclame').length) { L.push('\n### Reclame Aqui / Google — queixas recorrentes'); rows('reclame').forEach(r => L.push(`- ${r.concorrente || '?'}: ${r.queixa || ''}`)); }
  if (String(d.yt_busca || '').trim() || (d.yt_frases || []).length) { L.push(`\n### YouTube${d.yt_busca ? ' — ' + d.yt_busca : ''}`); (d.yt_frases || []).forEach(f => L.push(`- "${f}"`)); }
  return L.join('\n');
}

function researchContext(P_) {
  const b = P_.data.briefing || {}, ctx = ['nicho', 'avatar', 'momento', 'objetivo12', 'faturamento', 'produtos_atuais'].filter(k => String(b[k] || '').trim()).map(k => `- ${k}: ${b[k]}`).join('\n');
  const mat = typeof aiMaterial === 'function' ? aiMaterial(P_) : '', sp = sprintMd(P_);
  return `CLIENTE: ${P_.meta.cliente}\n${ctx ? `\nBRIEFING:\n${ctx}\n` : ''}${mat ? `\nMATERIAL-BASE DO CLIENTE:\n${mat.slice(0, 40000)}\n` : ''}${sp ? `\nSPRINT DE INTELIGÊNCIA REAL (dados coletados manualmente — prioridade máxima):\n${sp}\n` : ''}`;
}
function researchPrompt(ask, P_) {
  return `${researchContext(P_)}\n---\nTAREFA DE PESQUISA:\n${ask}\n\n${IMPORTANTE}\n\nUse a busca na web. Entregue o relatório em Markdown no formato combinado.`;
}
// pesquisa relevante para o prompt de um tópico (prioriza os módulos ligados a ele)
function researchForPrompt(P_, secId) {
  const rs = P_.research || {}, ids = Object.keys(rs).filter(k => rs[k] && rs[k].text), sp = sprintMd(P_);
  if (!ids.length && !sp) return '';
  const prio = r => { const m = RESEARCH.find(x => x.id === r); return m && m.feeds.includes(secId) ? 0 : 1; };
  ids.sort((a, b) => prio(a) - prio(b));
  let out = sp ? `### Sprint de inteligência real (coletado à mão — prioridade)\n${sp.slice(0, 12000)}\n` : '', total = out.length;
  for (const id of ids) {
    const m = RESEARCH.find(x => x.id === id), t = `### ${m ? m.title : rs[id].title}\n${rs[id].text}\n`, cap = prio(id) === 0 ? (AI.eco ? 6000 : 14000) : (AI.eco ? 2000 : 4500);
    const part = t.length > cap ? t.slice(0, cap) + '…' : t;
    if (total + part.length > (AI.eco ? 14000 : 40000)) break;
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

/* ---- Execução (com cruzamento opcional entre duas IAs) ---- */
const altProviders = () => Object.keys(PROVIDERS).filter(p => p !== researchProvider() && AI.has(p));
async function runResearch(id, customAsk, customTitle) {
  if (!AI.has(researchProvider())) { openAiSettings(); return false; }
  const p = P(), mod = RESEARCH.find(x => x.id === id), ask = customAsk || (mod && mod.ask), title = customTitle || (mod && mod.title) || id;
  const prompt = researchPrompt(ask, p), prim = researchProvider();
  const one = async prov => { const text = await aiCall(prompt, { web: true, system: RES_SYSTEM, maxTokens: AI.eco ? 8000 : 12000, maxUses: AI.eco ? 4 : 8, provider: prov }); return { prov, text: text.trim(), sources: AI.lastSources.slice(), web: !AI.lastNoWeb && AI.lastSources.length > 0 }; };
  const cross = AI.cross && altProviders().length;
  if (!cross) {
    const a = await one(prim); if (!a.text) throw new Error('A IA não devolveu texto. Tente novamente.');
    resStore(p)[id] = { title, ask: customAsk || '', text: a.text, sources: a.sources, at: Date.now(), web: a.web, by: [prim] }; save(); return true;
  }
  const alt = altProviders()[0], res = [];
  for (const prov of [prim, alt]) { try { const r = await one(prov); if (r.text) res.push(r); } catch (e) { if (/inválida|Limite/.test(e.message) && prov === prim) throw e; res.push({ prov, text: '', err: e.message, sources: [] }); } }
  const ok = res.filter(r => r.text);
  if (!ok.length) throw new Error('Nenhuma das IAs devolveu resultado. ' + res.map(r => r.err).filter(Boolean).join(' | '));
  let text = ok[0].text, note = '';
  if (ok.length === 2) {
    const cons = `Você recebeu dois relatórios independentes (A = ${PROVIDERS[ok[0].prov].short}, B = ${PROVIDERS[ok[1].prov].short}) sobre a MESMA pesquisa. Consolide o melhor dos dois em cada seção, em Markdown no mesmo formato (## Resumo, ## Achados, ## Análise para o cliente, ## A confirmar), preservando os links de fonte.\nQuando houver divergência de números, nomes, preços ou fatos, liste em "## Divergências entre as IAs" os dois valores, qual parece mais confiável e por quê. Marque "[verificar manualmente]" o que não puder ser confirmado nas fontes. NÃO invente dados novos.\n\n=== RELATÓRIO A ===\n${ok[0].text.slice(0, 30000)}\n\n=== RELATÓRIO B ===\n${ok[1].text.slice(0, 30000)}`;
    try { text = (await aiCall(cons, { web: false, system: RES_SYSTEM, maxTokens: 14000, provider: prim })).trim() || ok[0].text; } catch (e) { text = ok[0].text; note = `\n\n> Não foi possível consolidar automaticamente (${e.message}). Texto da primeira IA; compare com a segunda em "versões originais".`; }
  } else note = `\n\n> Só uma IA respondeu (${PROVIDERS[ok[0].prov].short}); a outra falhou: ${res.find(r => r.err) ? res.find(r => r.err).err : ''}.`;
  const seen = new Set(), sources = []; ok.forEach(r => r.sources.forEach(s => { if (!seen.has(s.url)) { seen.add(s.url); sources.push(s); } }));
  resStore(p)[id] = { title, ask: customAsk || '', text: text + note, sources, at: Date.now(), web: ok.some(r => r.web), by: ok.map(r => r.prov), versions: ok.map(r => ({ prov: r.prov, text: r.text })) }; save(); return true;
}
async function runResearchOne(id, customAsk, customTitle) {
  if (!AI.has(researchProvider())) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const mod = RESEARCH.find(x => x.id === id), cross = AI.cross && altProviders().length;
  AI.busy = true; aiStatus(`Pesquisando: ${customTitle || mod.title}${cross ? ' (2 IAs + consolidação)' : ''}… (1 a 6 minutos)`);
  try { await runResearch(id, customAsk, customTitle); toast('Pesquisa concluída. Confira as fontes e valide no checklist.'); }
  catch (e) { toast('IA: ' + (e.message || e)); }
  AI.busy = false; aiStatus(null); render();
}
async function runResearchAll(force) {
  if (!AI.has(researchProvider())) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const rs = resStore(P()), todo = RESEARCH.filter(m => force || !(rs[m.id] && rs[m.id].text));
  if (!todo.length) return toast('Todas as pesquisas já foram feitas. Use "Refazer" em uma delas, se quiser atualizar.');
  const cross = AI.cross && altProviders().length;
  if (!confirm(`O Claude/IA vai pesquisar ${todo.length} tema(s) na web, um por vez${cross ? ', cada um em 2 IAs com consolidação' : ''} (cerca de ${cross ? '3 a 6' : '1 a 3'} minutos cada). Isso consome créditos das suas chaves de API. Continuar?`)) return;
  AI.busy = true; AI.stop = false; const failed = [];
  for (let i = 0; i < todo.length; i++) {
    if (AI.stop) break;
    aiStatus(`Pesquisando ${i + 1}/${todo.length}: ${todo[i].title}`, () => { AI.stop = true; });
    try { await runResearch(todo[i].id); } catch (e) { failed.push(`${todo[i].title} (${e.message})`); if (/inválida|Limite/.test(e.message)) break; }
    renderNav();
  }
  AI.busy = false; aiStatus(null); render();
  toast(failed.length ? `Concluído com ${failed.length} falha(s): ${failed.join('; ')}` : AI.stop ? 'Pesquisa interrompida. O que já foi feito foi mantido.' : 'Pesquisa completa. Faça o sprint manual e a validação antes de gerar os tópicos.');
}

/* ---- Checklist de validação (Anexo B do POP) ---- */
const VALIDATION = [
  { g: 'Concorrentes', items: [['c1', 'Os concorrentes encontrados são do MESMO nicho que o cliente?'], ['c2', 'Pelo menos 2 têm produto com ticket similar ao do cliente?'], ['c3', 'Algum foi inventado? Todos foram verificados como existentes no Google/Instagram/YouTube?'], ['c4', 'Se algum estiver errado: substituí manualmente antes de continuar']] },
  { g: 'Avatar', items: [['a1', 'A faixa etária e renda fazem sentido com o nicho?'], ['a2', 'As dores listadas são específicas (e não genéricas demais)?'], ['a3', 'Existe pelo menos 1 "sonho secreto" não óbvio identificado?'], ['a4', 'O Nível de Consciência do mercado está mapeado e justificado?']] },
  { g: 'TAM/SAM/SOM', items: [['t1', 'O TAM tem fonte identificada (não é número inventado)?'], ['t2', 'O SOM é realista para o porte atual do cliente?']] },
  { g: 'Voz do mercado', items: [['v1', 'As frases de linguagem nativa soam como o público fala de verdade?'], ['v2', 'As objeções batem com o que já foi visto/ouvido deste tipo de cliente?']] },
  { g: 'Nível de consciência', items: [['n1', 'O nível mapeado faz sentido com a maturidade do mercado?']] },
  { g: 'Geral', items: [['g1', 'Revisei dados suspeitos que parecem inventados (ex.: "CPM médio no nicho é R$ 2,50") e não há nenhum sem fonte']] }
];
const VAL_KEYS = VALIDATION.flatMap(v => v.items.map(i => i[0]));
function validationProgress(P_) { const v = P_.validation || {}; return { done: VAL_KEYS.filter(k => v[k]).length, total: VAL_KEYS.length }; }

function auditPrompt(p) {
  const rs = resStore(p), ids = Object.keys(rs).filter(k => rs[k].text);
  const body = ids.map(id => `### ${(RESEARCH.find(m => m.id === id) || rs[id]).title}\n${rs[id].text.slice(0, AI.eco ? 3000 : 7000)}`).join('\n\n').slice(0, AI.eco ? 30000 : 70000);
  const items = VALIDATION.flatMap(v => v.items.map(([k, t]) => `${k}: [${v.g}] ${t}`)).join('\n'), sp = sprintMd(p);
  return `Você é auditor(a) de pesquisa de mercado. Avalie o material abaixo contra o checklist de validação. Seja cético: procure concorrentes possivelmente inexistentes, números sem fonte, TAM/SOM irreais para o porte do cliente, frases que não soam como o público fala e qualquer dado que pareça inventado. Cruze com o sprint manual quando houver.\n\nCLIENTE: ${p.meta.cliente}\n\nCHECKLIST:\n${items}\n\nMATERIAL:\n${body}\n\n${sp ? `SPRINT MANUAL (dados reais):\n${sp.slice(0, 8000)}\n\n` : ''}Responda APENAS com JSON: {"itens":[{"k":"c1","status":"ok"|"atencao","nota":"1 frase com o motivo"}]} — um objeto para cada chave do checklist.`;
}
function applyAudit(p, text) {
  const a = text.indexOf('{'), b = text.lastIndexOf('}'), j = JSON.parse(text.slice(a, b + 1)); p.audit = {};
  (j.itens || []).forEach(x => { if (VAL_KEYS.includes(x.k)) p.audit[x.k] = { status: x.status === 'ok' ? 'ok' : 'atencao', nota: String(x.nota || '') }; });
  save(); toast(`Auditoria aplicada: ${Object.values(p.audit).filter(x => x.status !== 'ok').length} ponto(s) de atenção.`);
}
function extractSources(text) {
  const seen = new Set(), out = [];
  String(text).replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, (m, ti, u) => { if (!seen.has(u)) { seen.add(u); out.push({ title: ti, url: u }); } return m; });
  String(text).replace(/https?:\/\/[^\s<>)\]]+/g, u => { u = u.replace(/[.,;]+$/, ''); if (!seen.has(u)) { seen.add(u); out.push({ title: u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 80), url: u }); } return u; });
  return out;
}
async function runAudit() {
  if (!AI.has(researchProvider())) { openAiSettings(); return; }
  if (AI.busy) return toast('Já existe uma geração em andamento.');
  const p = P(), rs = resStore(p), ids = Object.keys(rs).filter(k => rs[k].text);
  if (!ids.length) return toast('Faça a pesquisa antes de auditar.');
  AI.busy = true; aiStatus('Auditando a pesquisa em busca de dados suspeitos…');
  try {
    const text = await aiCall(auditPrompt(p), { web: false, system: AI_SYSTEM, maxTokens: 6000, provider: researchProvider() });
    applyAudit(p, text);
  } catch (e) { toast('IA: ' + (e.message || e)); }
  AI.busy = false; aiStatus(null); render();
}

/* ---- Tela ---- */
function pesquisaView() {
  const p = P(), rs = resStore(p), custom = Object.keys(rs).filter(k => !RES_IDS.includes(k));
  const done = RESEARCH.filter(m => rs[m.id] && rs[m.id].text).length, nsrc = allSources(p).length, vp = validationProgress(p), sp = sprintStatus(p), alts = altProviders();
  const card = (id, title, icon, feeds, r) => {
    const has = r && r.text, when = has ? new Date(r.at).toLocaleDateString('pt-BR') : '';
    const by = has && r.manual ? '' : has && r.by && r.by.length > 1 ? ` · cruzada: ${r.by.map(x => PROVIDERS[x] ? PROVIDERS[x].short : x).join(' + ')}` : (has && r.by && r.by[0] && PROVIDERS[r.by[0]] ? ` · ${PROVIDERS[r.by[0]].short}` : '');
    return `<div class="box" data-rc="${id}"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap"><div style="font-size:18px;width:36px;height:36px;border-radius:10px;background:#eee8ff;color:#582aab;display:flex;align-items:center;justify-content:center">${icon}</div><div style="flex:1;min-width:200px"><h3 style="margin:0">${esc(title)}</h3><div style="font-size:12.5px;color:var(--muted)">${has ? `${r.sources.length} fonte(s) · ${when}${by}${r.manual ? ' · colado manualmente' : (r.web ? '' : ' · <b style="color:#9a6700">sem busca na web — confirme os dados</b>')}` : 'Ainda não pesquisado'}${feeds && feeds.length ? ` · alimenta: ${feeds.map(f => (SECTIONS.find(s => s.id === f) || { title: f }).title).join(', ')}` : ''}</div></div>
    <button class="btn ${has ? 'ghost' : ''} xs" data-run="${id}">${has ? '↻ Refazer' : '⌕ Pesquisar'}</button><button class="btn ghost xs" data-cp="${id}" title="Copia o prompt para rodar no seu ChatGPT, Claude, Gemini ou Perplexity">📋 Copiar prompt</button><button class="btn ghost xs" data-pastetog="${id}">📥 Colar relatório</button>${has ? `<button class="btn ghost xs" data-tog="${id}">Ver relatório</button>` : ''}${has && !RES_IDS.includes(id) ? `<button class="btn danger xs" data-delres="${id}">Excluir</button>` : ''}</div>
    <div id="paste_${id}" style="display:none;margin-top:12px"><textarea data-pastetxt="${id}" rows="8" placeholder="Cole aqui o relatório que a IA gerou (com os links das fontes)…" style="font-size:13px"></textarea><div style="margin-top:8px"><button class="btn xs" data-pastesave="${id}">Salvar relatório</button></div></div>
    ${has ? `<div id="rep_${id}" style="display:none;margin-top:14px"><div class="chip" style="margin-bottom:8px">Você pode editar o texto abaixo; ele alimenta os tópicos</div><textarea data-restext="${id}" rows="14" style="font-size:13px">${esc(r.text)}</textarea><div style="margin-top:12px;font-size:14px;line-height:1.5;border-top:1px solid var(--line);padding-top:6px">${mdToHtml(r.text)}</div>${r.versions ? `<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:600;font-size:13px">Versões originais de cada IA (antes da consolidação)</summary>${r.versions.map(v => `<div style="margin-top:10px"><span class="chip">${PROVIDERS[v.prov] ? PROVIDERS[v.prov].name : v.prov}</span><div style="font-size:13.5px;line-height:1.5">${mdToHtml(v.text)}</div></div>`).join('')}</details>` : ''}${r.sources.length ? `<div style="margin-top:10px"><b style="font-size:13px">Fontes consultadas</b><ul style="font-size:13px;padding-left:18px;margin:6px 0">${r.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(String(s.title).slice(0, 100))}</a></li>`).join('')}</ul></div>` : ''}</div>` : ''}</div>`;
  };
  const groups = ['Núcleo (Anexo A)', 'Complementares'];
  const valHtml = VALIDATION.map(v => `<div style="margin-top:10px"><div class="sm" style="font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--p3);font-weight:700">${v.g}</div>${v.items.map(([k, t]) => { const a = (p.audit || {})[k]; return `<label class="chk ${(p.validation || {})[k] ? 'done' : ''}"><input type="checkbox" data-val="${k}" ${(p.validation || {})[k] ? 'checked' : ''}><span>${esc(t)}${a ? `<br><span class="chip ${a.status === 'ok' ? 'ok' : 'mid'}" style="margin-top:3px">${a.status === 'ok' ? 'IA: ok' : 'IA: atenção'} — ${esc(a.nota)}</span>` : ''}</span></label>`; }).join('')}</div>`).join('');
  return `<div class="wrap">${hero('Etapa 2 · Mercado', 'Pesquisa com IA', 'Segue o POP de pesquisa da Mantora: pesquisa na web com fontes (prompt do Anexo A), cruzamento entre IAs, sprint manual de inteligência real e checklist de validação. O resultado alimenta a geração dos tópicos.', `<button class="btn light" id="resAll">⌕ Pesquisar tudo</button><button class="btn dark" id="resSet">⚙ Configurar IA</button><button class="btn dark" id="resMd">⬇ Pacote .md (Manus/Claude)</button>`)}
  ${!AI.has(researchProvider()) ? `<div class="warn"><b>Sem IA conectada.</b> Você pode <b>conectar uma IA</b> em <b>⚙ Configurar IA</b> (Claude, ChatGPT, Gemini ou uma IA local) <b>ou usar o modo manual, sem custo de API</b>: em cada tema clique em <i>Copiar prompt</i>, rode no seu ChatGPT/Claude/Gemini/Perplexity e cole o resultado em <i>Colar relatório</i>. Pesquisa agora: <b>${PROVIDERS[researchProvider()].name}</b>. A busca na web precisa estar ligada para trazer fontes atuais.</div>` : ''}
  ${costTipsHtml()}
  <div class="grid2"><div class="box"><h3>Pesquisas concluídas</h3><p class="h">${done} de ${RESEARCH.length} temas · ${nsrc} fonte(s)</p><div class="prog"><div style="width:${Math.round(done / RESEARCH.length * 100)}%"></div></div></div>
  <div class="box"><h3>Validação de qualidade</h3><p class="h">${vp.done} de ${vp.total} itens do checklist</p><div class="prog"><div style="width:${Math.round(vp.done / vp.total * 100)}%"></div></div></div></div>
  <div class="box tools"><h3>Cruzar com duas IAs (etapa 2 do POP)</h3><p class="h">Roda cada pesquisa em duas IAs diferentes e consolida o melhor das duas, destacando divergências de números e fatos — como o POP pede (Claude/Perplexity + ChatGPT).</p>
  ${alts.length ? `<label class="chk" style="padding:0"><input type="checkbox" id="crossChk" ${AI.cross ? 'checked' : ''}><span>Pesquisar em <b>${PROVIDERS[researchProvider()].short}</b> + <b>${PROVIDERS[alts[0]].short}</b> e consolidar (dobra o tempo e o custo)</span></label>` : '<p class="h" style="margin:0"><b>Indisponível:</b> configure a chave de pelo menos duas IAs diferentes em ⚙ IA.</p>'}</div>
  ${groups.map(g => `<h3 style="margin:22px 0 10px;font-family:var(--hf);font-weight:400;letter-spacing:.14em;text-transform:uppercase;font-size:13px;color:var(--p3)">${g}</h3>${RESEARCH.filter(m => m.grp === g).map(m => card(m.id, m.title, m.icon, m.feeds, rs[m.id])).join('')}`).join('')}
  ${custom.length ? `<h3 style="margin:22px 0 10px;font-family:var(--hf);font-weight:400;letter-spacing:.14em;text-transform:uppercase;font-size:13px;color:var(--p3)">Pesquisas extras</h3>${custom.map(k => card(k, rs[k].title, '＋', [], rs[k])).join('')}` : ''}
  <div class="box tools"><h3>Pesquisa extra</h3><p class="h">Tem uma dúvida específica do cliente? Escreva e a IA pesquisa.</p><textarea id="resQ" rows="3" placeholder="Ex.: Quais eventos presenciais o público de tecnologia mais frequenta no Brasil e quanto custam os patrocínios?"></textarea><div style="margin-top:10px"><button class="btn xs" id="resExtra">⌕ Pesquisar</button></div></div>
  <h3 style="margin:26px 0 10px;font-family:var(--hf);font-weight:400;letter-spacing:.14em;text-transform:uppercase;font-size:13px;color:var(--p3)">Sprint de inteligência real (manual)</h3>
  <div class="box"><h3>Dados reais coletados à mão</h3><p class="h">Passo mais crítico do POP: Meta Ads Library, comentários dos concorrentes, Reclame Aqui e YouTube. A IA usa esses dados com prioridade sobre qualquer inferência.</p>${sp.map(c => `<span class="chip ${c.ok ? 'ok' : 'mid'}" style="margin:0 6px 6px 0">${c.ok ? '✓' : '○'} ${esc(c.t)}</span>`).join('')}<div style="margin-top:12px"><button class="btn ghost xs" id="goSprint">Abrir o Sprint de inteligência real →</button></div></div>
  <h3 style="margin:26px 0 10px;font-family:var(--hf);font-weight:400;letter-spacing:.14em;text-transform:uppercase;font-size:13px;color:var(--p3)">Validação de qualidade (Anexo B)</h3>
  <div class="box"><h3>Checklist de validação da pesquisa inicial</h3><p class="h">Percorra cada item e marque ✓ depois de conferir. Antes de gerar os tópicos o app avisa se o checklist estiver incompleto.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn xs" id="runAudit">✨ Auditar com IA (procurar dados suspeitos)</button><button class="btn ghost xs" id="cpAudit">📋 Copiar prompt da auditoria</button><button class="btn ghost xs" id="pasteAuditTog">📥 Colar resposta da auditoria</button></div><div id="auditPaste" style="display:none;margin-top:10px"><textarea id="auditTxt" rows="5" placeholder='Cole o JSON {"itens":[...]} que a IA devolveu…'></textarea><div style="margin-top:8px"><button class="btn xs" id="auditSave">Aplicar auditoria</button></div></div>${valHtml}</div>
  <div style="display:flex;justify-content:flex-end"><button class="btn" id="resGen">Gerar tópicos com esta pesquisa →</button></div></div>`;
}
function bindPesquisa() {
  const m = $('#main'), p = P();
  $('#resAll').onclick = () => runResearchAll(false);
  $('#resSet').onclick = openAiSettings;
  $('#resMd').onclick = () => typeof exportMdPack === 'function' && exportMdPack();
  $('#goSprint').onclick = () => go('sprint');
  $('#runAudit').onclick = runAudit;
  $('#cpAudit').onclick = () => { if (!Object.values(resStore(p)).some(r => r.text)) return toast('Faça ou cole a pesquisa antes de auditar.'); navigator.clipboard.writeText(auditPrompt(p)).then(() => toast('Prompt da auditoria copiado. Rode na sua IA e cole a resposta.')); };
  $('#pasteAuditTog').onclick = () => { const e = $('#auditPaste'); e.style.display = e.style.display === 'none' ? 'block' : 'none'; };
  $('#auditSave').onclick = () => { try { applyAudit(p, $('#auditTxt').value); render(); } catch (e) { toast('Não consegui ler o JSON. Cole a resposta completa da IA.'); } };
  m.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { const id = b.dataset.cp, mod = RESEARCH.find(x => x.id === id), r = resStore(p)[id], ask = mod ? mod.ask : (r && r.ask) || ''; navigator.clipboard.writeText(RES_SYSTEM + '\n\n' + researchPrompt(ask, p)).then(() => toast('Prompt copiado! Cole no ChatGPT, Claude, Gemini ou Perplexity (com busca ativa) e traga o relatório de volta em "Colar relatório".')); });
  m.querySelectorAll('[data-pastetog]').forEach(b => b.onclick = () => { const e = document.getElementById('paste_' + b.dataset.pastetog); e.style.display = e.style.display === 'none' ? 'block' : 'none'; });
  m.querySelectorAll('[data-pastesave]').forEach(b => b.onclick = () => { const id = b.dataset.pastesave, v = m.querySelector(`[data-pastetxt="${id}"]`).value.trim(); if (!v) return toast('Cole o relatório primeiro.'); const mod = RESEARCH.find(x => x.id === id), old = resStore(p)[id]; resStore(p)[id] = { title: (mod && mod.title) || (old && old.title) || id, ask: (old && old.ask) || '', text: v, sources: extractSources(v), at: Date.now(), web: true, manual: true, by: ['manual'] }; save(); toast('Relatório salvo (colado manualmente). Confira as fontes.'); render(); });
  const cc = $('#crossChk'); if (cc) cc.onchange = () => { AI.cross = cc.checked; };
  $('#resGen').onclick = () => { const vp = validationProgress(p); if (vp.done < vp.total && !confirm(`O checklist de validação está em ${vp.done}/${vp.total}. O POP manda validar a pesquisa antes de seguir. Gerar os tópicos mesmo assim?`)) return; go('home'); setTimeout(aiFillAll, 50); };
  m.querySelectorAll('[data-run]').forEach(b => b.onclick = () => { const id = b.dataset.run, r = resStore(p)[id]; runResearchOne(id, r && !RES_IDS.includes(id) ? r.ask : undefined, r && !RES_IDS.includes(id) ? r.title : undefined); });
  m.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const e = document.getElementById('rep_' + b.dataset.tog); e.style.display = e.style.display === 'none' ? 'block' : 'none'; });
  m.querySelectorAll('[data-restext]').forEach(t => t.oninput = () => { resStore(p)[t.dataset.restext].text = t.value; save(); });
  m.querySelectorAll('[data-delres]').forEach(b => b.onclick = () => { if (confirm('Excluir esta pesquisa?')) { delete resStore(p)[b.dataset.delres]; save(); render(); } });
  m.querySelectorAll('[data-val]').forEach(c => c.onchange = () => { (p.validation ||= {})[c.dataset.val] = c.checked; c.parentElement.classList.toggle('done', c.checked); save(); });
  $('#resExtra').onclick = () => { const q = $('#resQ').value.trim(); if (!q) return toast('Escreva a pergunta primeiro.'); runResearchOne('extra_' + uid(), q, q.length > 60 ? q.slice(0, 57) + '…' : q); };
}
