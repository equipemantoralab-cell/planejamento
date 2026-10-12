// Estrutura do planejamento: cada seção = um tópico preenchido pela estrategista.
// Tipos de campo: text | area | list (uma linha por item) | rows (tabela de itens)
const T = (k, label, ph, hint) => ({ k, t: 'text', label, ph, hint });
const A = (k, label, ph, hint) => ({ k, t: 'area', label, ph, hint });
const L = (k, label, ph, hint) => ({ k, t: 'list', label, ph, hint });
const R = (k, label, cols, o = {}) => ({ k, t: 'rows', label, cols, ...o });
const C = (k, label, ph, type = 'text') => ({ k, label, ph, t: type });

const SECTIONS = [
  { id: 'diag', stage: 'Etapa 1 · Diagnóstico', title: 'Presença digital & Benchmark', icon: '◎',
    desc: 'Onde o cliente já está e quais referências inspiram o posicionamento.',
    prompt: 'Com base no briefing e no DNA do Expert de {CLIENTE}, liste os canais digitais atuais (com seguidores) e 3 referências de benchmark do nicho (educadores/marcas que provam o modelo que ele vai ocupar). Aponte qual espaço nenhum deles ocupa.',
    fields: [
      R('canais', 'Canais digitais atuais', [C('plataforma', 'Plataforma', 'Instagram'), C('handle', 'Perfil / @', '@cliente'), C('audiencia', 'Audiência', '5.318 seguidores')], { add: 'Adicionar canal', min: 3 }),
      A('bench_intro', 'Frase de abertura do benchmark', 'Educadores que provam o modelo "autoridade real + linguagem simples" — a régua que o cliente vai ocupar no recorte X.'),
      R('bench', 'Referências de inspiração (3)', [C('nome', 'Nome', 'Filipe Deschamps'), C('desc', 'O que ensinam / por que são referência', '', 'area')], { add: 'Adicionar referência', min: 3 }),
      A('bench_licao', 'Lição / espaço que ninguém ocupa', 'Lição: nenhum deles ocupa "X". Esse é o espaço do cliente.')
    ] },

  { id: 'marca', stage: 'Etapa 4 · VMC — Virtude', title: 'Marca & Valores', icon: '◆',
    desc: 'Personalidade do especialista e valores inegociáveis (vêm do DNA do Expert).',
    prompt: 'Com base no DNA do Expert e no briefing de {CLIENTE}, defina: 6 traços de personalidade da marca (nome + 1 frase) e os 6 valores fundamentais (nome + frase/citação na voz dele, usando trechos reais do briefing sempre que possível).',
    fields: [
      R('tracos', 'Personalidade (6 traços)', [C('nome', 'Traço', 'Anti-hype'), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar traço', min: 6 }),
      R('valores', 'Valores fundamentais (6)', [C('titulo', 'Valor', 'Disciplina acima do Talento'), C('citacao', 'Citação / explicação', '', 'area')], { add: 'Adicionar valor', min: 6 })
    ] },

  { id: 'expertise', stage: 'Etapa 4 · VMC — Virtude', title: 'Expertise & Arquétipo', icon: '★',
    desc: 'O diferencial incopiável e o arquétipo dominante.',
    prompt: 'Para {CLIENTE}, escreva: (1) a especialidade principal em 1 frase, (2) o diferencial técnico em 1 frase, (3) 3 a 4 credenciais com números reais, (4) o arquétipo dominante (nome + subtítulo + texto de ~80 palavras).',
    fields: [
      A('especialidade', 'Especialidade principal', 'IA aplicada à rotina de quem já trabalha com tecnologia...'),
      A('diferencial', 'Diferencial técnico', 'Diferencial técnico: o olhar de...'),
      R('credenciais', 'Credenciais (3 a 4)', [C('titulo', 'Título', '17+ anos em tecnologia'), C('desc', 'Detalhe', '', 'area')], { add: 'Adicionar credencial', min: 3 }),
      T('arq_nome', 'Arquétipo', 'O Sábio + O Herói'),
      T('arq_sub', 'Subtítulo do arquétipo', 'O Mentor Realista'),
      A('arq_texto', 'Texto do arquétipo', '')
    ] },

  { id: 'origem', stage: 'Etapa 4 · VMC — Virtude', title: 'História de origem', icon: '↗',
    desc: 'A jornada que gera conexão: origem, virada e decisão autoral.',
    prompt: 'Conte a história de origem de {CLIENTE} em 4 etapas (título curto + 3 a 4 linhas cada), a partir do DNA do Expert. Termine com a "lição transformadora" em uma citação na voz dele.',
    fields: [
      T('orig_titulo', 'Título da história', 'A travessia da rua alagada'),
      R('etapas', 'Etapas da história (4)', [C('titulo', 'Título', 'A rua alagada'), C('texto', 'Texto', '', 'area')], { add: 'Adicionar etapa', min: 4 }),
      A('licao', 'Lição transformadora (citação)', '"Eu nunca fui o mais talentoso da sala..."'),
      T('licao_autor', 'Assinatura da citação', 'Nome do cliente')
    ] },

  { id: 'movimento', stage: 'Etapa 4 · VMC — Movimento', title: 'Movimento, inimigo & mantras', icon: '⚑',
    desc: 'Inimigo comum, crenças a quebrar, mantras e manifesto.',
    prompt: 'Extraia o MOVIMENTO de {CLIENTE}: inimigo comum (nome, descrição, 3 danos que causa, missão contra ele), 4 crenças limitantes com a "virada de chave", 10 mantras/aforismos (frase + 1 linha explicando) e um manifesto de 8 a 12 parágrafos curtos na voz dele.',
    fields: [
      T('inimigo_nome', 'Inimigo comum', 'O hype vazio da IA'),
      A('inimigo_desc', 'Descrição do inimigo', ''),
      L('danos', 'Por que isso prejudica as pessoas (3 a 4)', ''),
      A('missao', 'Missão contra o inimigo', 'A missão contra isso: ...'),
      R('crencas', 'Quebrando crenças', [C('crenca', 'Crença limitante', '', 'area'), C('virada', 'Virada de chave', '', 'area')], { add: 'Adicionar crença', min: 3 }),
      R('mantras', 'Mantras do movimento (até 10)', [C('frase', 'Frase', 'Use a IA, não construa a IA.'), C('nota', 'Explicação curta', '')], { add: 'Adicionar mantra', min: 4 }),
      A('manifesto', 'Manifesto (separe parágrafos com uma linha em branco)', '', 'Deixe uma linha em branco entre os parágrafos — o sistema divide em slides automaticamente.')
    ] },

  { id: 'mercado', stage: 'Etapa 2 · Mercado', title: 'Análise de mercado', icon: '▲',
    desc: 'TAM/SAM/SOM, números do setor, oportunidades e previsão. Sempre cite fonte.',
    prompt: 'Faça uma pesquisa sobre TAM, SAM e SOM do nicho de {CLIENTE}. Deixe links das fontes de cada parte e explique o que é TAM, SAM e SOM. Estime não só o tamanho do mercado, mas a capacidade de faturamento com algum ticket médio (bottom-up). Traga também 3 números de contexto, o público quantificado, 4 submercados emergentes e a previsão de 5 anos.',
    fields: [
      T('mercado_titulo', 'Título da seção', 'Educação em IA Aplicada'),
      A('mercado_sub', 'Frase-resumo do mercado', 'Mercado de baixos bilhões/ano, em forte expansão...'),
      R('tss', 'TAM · SAM · SOM', [C('sigla', 'Sigla', 'TAM'), C('valor', 'Valor', 'R$ 1,8 bi'), C('sufixo', 'Sufixo', '/ano'), C('desc', 'Como foi calculado', '', 'area')], { add: 'Adicionar linha', min: 3, def: [{ sigla: 'TAM' }, { sigla: 'SAM' }, { sigla: 'SOM' }] }),
      A('tss_nota', 'Nota de rodapé (método e fontes)', 'Dimensionamento estratégico (método bottom-up). Fontes: ...'),
      R('numeros', 'Mercado em números (3)', [C('valor', 'Número', '30,2%'), C('titulo', 'Título', 'Déficit de talentos'), C('desc', 'Explicação + fonte', '', 'area')], { add: 'Adicionar número', min: 3 }),
      A('insight', 'Insight estratégico', 'Insight: o gargalo do cliente não é o tamanho do mercado, é...'),
      R('quant', 'Público-alvo quantificado', [C('label', 'Item', 'Número total no Brasil'), C('valor', 'Valor', '')], { add: 'Adicionar item', min: 4 }),
      R('oport', 'Oportunidades emergentes (4)', [C('titulo', 'Submercado', ''), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar oportunidade', min: 4 }),
      A('cenario', 'Cenário até 2030 (um ponto por linha)', ''),
      R('horizontes', 'Horizontes (curto, médio, longo prazo)', [C('titulo', 'Prazo', 'Curto prazo (6 meses)'), C('desc', 'Meta', '', 'area')], { add: 'Adicionar horizonte', min: 3 })
    ] },

  { id: 'conc', stage: 'Etapa 2 · Mercado', title: 'Concorrência & gaps', icon: '⚔',
    desc: 'Os maiores players, seus pontos fortes/fracos e o espaço em branco.',
    prompt: 'Pesquise a fundo os 3 concorrentes do nicho de {CLIENTE} (confirme que são do mesmo nicho, quais produtos e tickets têm). Para cada um: subtítulo, preços, 4 pontos fortes, 4 fracos/gaps e a oportunidade para {CLIENTE}. Depois liste os 5 gaps críticos do mercado e o "espaço em branco" em 1 frase.',
    fields: [
      A('conc_intro', 'Frase de abertura', 'Os 3 maiores players...: mas nenhum ocupa "X".'),
      R('concorrentes', 'Concorrentes (3)', [C('nome', 'Nome', 'Alura'), C('sub', 'Quem é', 'A maior plataforma...'), C('precos', 'Preços / planos', ''), C('fortes', 'Pontos fortes (um por linha)', '', 'area'), C('fracos', 'Fracos / gaps (um por linha)', '', 'area'), C('oport', 'Oportunidade para o cliente', '', 'area')], { add: 'Adicionar concorrente', min: 3 }),
      R('gaps', 'Gaps críticos do mercado (5)', [C('titulo', 'Gap de…', 'Gap de Produto'), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar gap', min: 5 }),
      A('branco', 'O espaço em branco do mercado (frase)', '"IA aplicada à rotina de ..., com método, governança e ganho medível."'),
      A('branco_nota', 'Contraste com os concorrentes', 'X ensina a construir · Y é buffet · Z é trilha longa...')
    ] },

  { id: 'publico', stage: 'Etapa 3 · Público & Personas', title: 'Público-alvo & segmentos', icon: '☺',
    desc: 'Quem é o público-base, o que tira o sono dele e os 3 segmentos/personas.',
    prompt: 'Complete o doc de Público-Alvo Base de {CLIENTE}: resumo em 2 linhas, perfil demográfico (idade, gênero, renda, escolaridade, localização, situação), as 4 principais dores e as 3 personas/segmentos com prioridade, descrição e tamanho relativo.',
    fields: [
      A('publico_resumo', 'Resumo do público-alvo base', ''),
      R('demo', 'Perfil demográfico (6)', [C('label', 'Item', 'Idade'), C('valor', 'Descrição', '', 'area')], { add: 'Adicionar item', min: 6, def: [{ label: 'Idade' }, { label: 'Gênero' }, { label: 'Renda' }, { label: 'Escolaridade' }, { label: 'Localização' }, { label: 'Situação' }] }),
      R('dores', 'Principais dores (4)', [C('titulo', 'Dor', ''), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar dor', min: 4 }),
      R('segmentos', 'Segmentos / personas (3)', [C('tag', 'Etiqueta', 'PRIORIDADE'), C('nome', 'Nome da persona', ''), C('desc', 'Descrição', '', 'area'), C('tamanho', 'Tamanho', 'Maior fatia')], { add: 'Adicionar segmento', min: 3 })
    ] },

  { id: 'esteira', stage: 'Etapa 5 · Esteira de Produtos', title: 'Promessas & esteira de produtos', icon: '⇉',
    desc: 'Promessa central, arquitetura da esteira, isca digital e tabela completa.',
    prompt: 'Traga 3 ideias de promessa central para {CLIENTE} e a esteira de produtos: 1 isca digital gratuita, 2 low ticket, 1 mid ticket e 1 high ticket (nome, promessa, público, entregáveis, ticket). Depois detalhe a isca digital.',
    fields: [
      R('promessas', 'Possíveis promessas (3)', [C('titulo', 'Caminho', 'Deslanchar na carreira'), C('frase', 'Promessa', '', 'area')], { add: 'Adicionar promessa', min: 3 }),
      A('promessa_rec', 'Promessa recomendada / escolhida', 'Recomendada para liderar a marca: "..."'),
      R('estagios', 'Arquitetura financeira (4 estágios)', [C('nome', 'Estágio', 'Atração de Base'), C('desc', 'O que entra', '', 'area'), C('preco', 'Faixa de preço', 'Gratuito')], { add: 'Adicionar estágio', min: 4, def: [{ nome: 'Atração de Base' }, { nome: 'Produtos de Caixa' }, { nome: 'Produtos de Lucro' }, { nome: 'Escala de Elite' }] }),
      A('motor', 'Motor de tração (produto que abre a esteira)', 'Motor de tração: ...'),
      T('isca_nome', 'Isca digital — nome', 'Mapa de 25 Usos de IA'),
      A('isca_promessa', 'Isca — promessa', ''),
      T('isca_formato', 'Isca — formato', 'PDF / Notion (2 páginas) · Captura de e-mail'),
      L('isca_entregaveis', 'Isca — entregáveis (um por linha)', ''),
      A('isca_avatar', 'Isca — avatar', '"Lucas, 22, dev júnior em SP..."'),
      R('tabela', 'Esteira completa (tabela)', [C('produto', 'Produto', ''), C('ticket', 'Ticket', 'R$ 97'), C('publico', 'Público', ''), C('objetivo', 'Objetivo', '')], { add: 'Adicionar produto', min: 4 }),
      A('tabela_nota', 'Nota sobre a arquitetura', 'Arquitetura: atração → caixa → lucro → elite.')
    ] },

  { id: 'posic', stage: 'Etapa 6 · Posicionamento', title: 'Posicionamento & canais', icon: '✦',
    desc: 'Papel de cada plataforma, site, bio e estrutura de links.',
    prompt: 'Gere o posicionamento global de {CLIENTE} seguindo o doc "07_Posicionamento Para Redes Sociais": papel de cada plataforma (objetivo, tom de voz, tipos de conteúdo, frequência), estrutura do site, sugestão de bio do Instagram e estrutura de links.',
    fields: [
      A('posic_intro', 'Frase-resumo do posicionamento', 'Base: VMC + Promessa Central + 3 personas. Núcleo de autoridade em...'),
      R('plataformas', 'Plataformas (1 slide por plataforma)', [C('nome', 'Plataforma', 'Instagram'), C('papel', 'Papel', 'Plataforma principal · Comunidade'), C('objetivo', 'Objetivo', '', 'area'), C('tom', 'Tom de voz', '', 'area'), C('tipos', 'Tipos de conteúdo (um por linha)', '', 'area'), C('freq', 'Frequência', 'Feed 5–7x/semana')], { add: 'Adicionar plataforma', min: 3 }),
      A('site_obj', 'Site — função', 'Credibilidade, conversão, SEO e centralização...'),
      R('site_pag', 'Site — páginas', [C('nome', 'Página', 'Página Inicial'), C('desc', 'Conteúdo', '', 'area')], { add: 'Adicionar página', min: 4 }),
      T('bio_handle', 'Bio — @ sugerido', '@cliente'),
      A('bio_linhas', 'Bio — texto (uma linha por linha)', ''),
      A('bio_porque', 'Bio — por quê', ''),
      R('links', 'Estrutura de links da bio', [C('titulo', 'Link', ''), C('destino', 'Destino / função', '')], { add: 'Adicionar link', min: 4 }),
      A('links_nota', 'Ferramenta sugerida para os links', 'Ferramenta sugerida: página própria no site.')
    ] },

  { id: 'conteudo', stage: 'Etapa 7 · Estratégia de Conteúdo', title: 'Estratégia de conteúdo', icon: '✎',
    desc: 'Método VMC, camadas do funil, tipos de conteúdo, stories, ativos e as 14 primeiras ideias.',
    prompt: 'Crie a estratégia de conteúdo de {CLIENTE}: os 4 tipos de conteúdo (Técnico, Autoridade, Conexão, Objeção+Oferta) com descrição, fórmula e 4 exemplos cada; as 3 camadas de funil; estratégia de stories por dia da semana; os ativos que reforçam autoridade; e 14 ideias de postagens (2 semanas) usando a estrutura VMC + banco de headlines + as 3 personas.',
    fields: [
      A('vmc_v', 'VMC — Virtude', 'Demonstrar superioridade intelectual e princípios universais que estabelecem a autoridade...'),
      A('vmc_m', 'VMC — Movimento', 'Quebrar crenças populares, identificar o inimigo comum e apresentar a linguagem própria que mobiliza a audiência.'),
      A('vmc_c', 'VMC — Conversão', 'Transformar audiência em clientes através de ofertas estratégicas e demonstração de ganho medível e concreto.'),
      R('tipos', 'Tipos de conteúdo (1 slide por tipo)', [C('nome', 'Tipo', 'Técnico'), C('desc', 'O que faz', '', 'area'), C('formula', 'Fórmula', 'Tema forte → conteúdo → CTA', 'area'), C('exemplos', 'Exemplos (um por linha)', '', 'area')], { add: 'Adicionar tipo', min: 4, def: [{ nome: 'Técnico' }, { nome: 'Autoridade' }, { nome: 'Conexão' }, { nome: 'Objeção + Oferta' }] }),
      T('freq_nota', 'Frequência sugerida', '3x/semana (consistência) ou 7x/semana (escala)'),
      R('camadas', 'Camadas de conteúdo no funil (3)', [C('nome', 'Camada', 'Topo de Funil'), C('frase', 'Pensamento do público', '"Preciso saber mais disso"'), C('desc', 'Papel', '', 'area'), C('usa', 'Usa quais tipos', 'Usa TÉCNICO + CONEXÃO')], { add: 'Adicionar camada', min: 3 }),
      T('stories_qtd', 'Stories por dia', '3–5'),
      A('stories_nota', 'Stories — orientação', 'Mantenha proximidade sem sobrecarregar a audiência.'),
      R('stories_dias', 'Stories — pauta por dia', [C('dia', 'Dia', 'Segunda'), C('acao', 'Pauta', '')], { add: 'Adicionar dia', min: 6, def: [{ dia: 'Segunda' }, { dia: 'Terça' }, { dia: 'Quarta' }, { dia: 'Quinta' }, { dia: 'Sexta' }, { dia: 'Sáb / Dom' }] }),
      R('recursos', 'Recursos do movimento (ativos de autoridade)', [C('titulo', 'Ativo', 'Livro / Podcast / Newsletter'), C('desc', 'Como usar', '', 'area')], { add: 'Adicionar recurso', min: 6 }),
      R('posts', 'Ideias de postagem (14 = 2 semanas)', [C('semana', 'Semana', 'Semana 1'), C('tema', 'Tema (V / M / C)', 'Virtude'), C('titulo', 'Título / headline', ''), C('dev', 'Desenvolvimento', '', 'area')], { add: 'Adicionar post', min: 14 })
    ] },

  { id: 'plano', stage: 'Etapa 11 · Plano de Ação', title: 'Plano de ação, funil & KPIs', icon: '➜',
    desc: 'Fases, funil de vendas, quick wins e KPIs.',
    prompt: 'Monte o plano de ação de {CLIENTE}: 3 fases (Meses 0–6, 6–12, Ano 2) com foco, resultado esperado e 5 ações-chave; o funil de vendas em 5 etapas; 5 quick wins para os primeiros 30 dias; e os KPIs de acompanhamento com meta.',
    fields: [
      A('plano_intro', 'Frase de abertura do plano', 'Aquisição orgânico-first em..., esteira..., meta do 1º ciclo: R$ ...'),
      R('fases', 'Fases do plano (1 slide por fase)', [C('rotulo', 'Rótulo', 'FASE 1 · MESES 0–6'), C('nome', 'Nome', 'Validação + Audiência'), C('foco', 'Foco da fase', '', 'area'), C('resultado', 'Resultado esperado', '', 'area'), C('acoes', 'Ações-chave (uma por linha)', '', 'area')], { add: 'Adicionar fase', min: 3 }),
      R('funil', 'Funil de vendas (5 etapas)', [C('nome', 'Etapa', 'Atração'), C('desc', 'O que acontece', '', 'area')], { add: 'Adicionar etapa', min: 5, def: [{ nome: 'Atração' }, { nome: 'Autoridade' }, { nome: 'Captura' }, { nome: 'Conversão' }, { nome: 'Resultado' }] }),
      L('quick', 'Quick wins (primeiros 30 dias)', ''),
      R('kpis', 'KPIs e metas', [C('indicador', 'Indicador', 'Leads na base'), C('meta', 'Meta', '200–500 em 6 meses'), C('freq', 'Acompanhar', 'Semanal')], { add: 'Adicionar KPI', min: 5 }),
      A('fechamento', 'Frase de encerramento', 'Use a IA, não construa a IA.')
    ] }
];

// Checklist do processo (da planilha "Checklist Executivo")
const CHECKLIST = [
  { stage: 'Etapa 1 · Coleta & diagnóstico', items: [
    'Cliente concluiu o briefing completo e o GPT Extrator de DNA (se as respostas forem fracas, pedir para refazer)',
    'Doc "DNA do Expert | CLIENTE" criado na pasta "Briefing do Cliente"'] },
  { stage: 'Etapa 2 · Mercado & concorrência', items: [
    'Pesquisa de mercado rodada no Perplexity/Claude e repetida no GPT com busca na web',
    'Pesquisa lida e validada (concorrência direta/indireta, tamanho de mercado, produtos, plataforma e horário)',
    'Call de produto com o cliente (se já tiver produto validado)',
    'Arquivos baixados em .md (DNA, pesquisa, call, briefing) e enviados ao Claude',
    '3 concorrentes aprofundados e confirmados como do mesmo nicho',
    'TAM/SAM/SOM pesquisado com fontes e validado com o time'] },
  { stage: 'Etapa 3 · Público & personas', items: [
    'Doc "04_Público-Alvo Base" completo e coerente',
    'Projeto do cliente criado no Claude com todos os .md',
    '3 personas geradas (04.1, 04.2, 04.3) e revisadas'] },
  { stage: 'Etapa 4 · VMC (Virtude, Movimento, Conversão)', items: [
    'Doc "Gênesis do Líder em Movimento" preenchido (virtude e movimento) + 10 aforismos',
    '3 promessas analisadas e promessa central definida'] },
  { stage: 'Etapa 5 · Esteira de produtos', items: [
    'Esteira validada (1 isca, 2 low, 1 mid, 1 high) e doc "06_Ideação de Produtos" salvo',
    'Call de validação com o cliente (concorrentes, personas, esteira, mantras, valores)'] },
  { stage: 'Etapa 6 · Posicionamento', items: [
    'Posicionamento global (bio, YouTube, site) revisado — bio, destaques e fixados',
    'Doc "07_Posicionamento Para Redes Sociais" salvo na pasta de estratégia'] },
  { stage: 'Etapa 7 · Estratégia de conteúdo', items: [
    'Capacidade produtiva definida (1x ou 2x ao dia)',
    '14 ideias de postagem geradas e revisadas'] },
  { stage: 'Etapas 8–14 · Fechamento', items: [
    'Identidade visual (IDV) finalizada e enviada na plataforma',
    'Plano de ação, funil, quick wins e KPIs preenchidos',
    'Apresentação gerada, revisada e ensaiada',
    'Validação final com o cliente e entrega oficial'] }
];

// Gera o prompt "responda em JSON" para uma seção
function jsonSkeleton(sec) {
  const o = {};
  sec.fields.forEach(f => {
    if (f.t === 'rows') { const r = {}; f.cols.forEach(c => r[c.k] = '...'); o[f.k] = [r]; }
    else if (f.t === 'list') o[f.k] = ['...'];
    else o[f.k] = '...';
  });
  return JSON.stringify(o, null, 2);
}
function fieldGuide(sec) {
  return sec.fields.map(f => {
    let s = `- "${f.k}": ${f.label}`;
    if (f.t === 'rows') s += ` — lista de objetos com as chaves ${f.cols.map(c => `"${c.k}" (${c.label})`).join(', ')}` + (f.min ? `; preencha ${f.min} item(ns)` : '');
    if (f.t === 'list') s += ' — lista de textos';
    if (f.t === 'area' && /linha/i.test(f.label)) s += ' — um por linha (separe com \\n)';
    return s;
  }).join('\n');
}
function buildPrompt(sec, cliente) {
  return `${sec.prompt.replace(/\{CLIENTE\}/g, cliente || 'o cliente')}\n\nUse todo o contexto que já enviei (briefing, DNA do Expert, pesquisa de mercado, personas). Escreva em português do Brasil, em linguagem simples e direta, sem inventar números — quando não tiver fonte, sinalize.\n\nRESPONDA APENAS COM UM JSON VÁLIDO (sem texto antes ou depois), neste formato:\n${jsonSkeleton(sec)}\n\nGuia dos campos:\n${fieldGuide(sec)}`;
}
