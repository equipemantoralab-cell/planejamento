/* ====== Adaptação aos documentos reais da Mantora (POP de pesquisa, templates 02/03, planejamento MAPHEL) ====== */

// --- Concorrência: campos do template "02_Análise da Concorrência" ---
{
  const sec = SECTIONS.find(s => s.id === 'conc');
  sec.fields.find(f => f.k === 'concorrentes').cols.push(
    C('produtos', 'Produtos & preços (um por linha: produto — preço — formato)', '', 'area'),
    C('usp', 'Proposta única (diferencial e promessa de transformação)', '', 'area'),
    C('comunicacao', 'Análise de comunicação (tom, hooks reais, ângulo de dor, prova social)', '', 'area'),
    C('anuncios', 'Anúncios (roda? tempo médio dos ativos, criativos predominantes)', ''),
    C('metricas', 'Engajamento (seguidores IG/YT, taxa estimada, comunidade ativa?)', ''));
  sec.fields.push(
    R('mapa_precos', 'Mapa de preços do mercado', [C('faixa', 'Faixa', 'R$ 47–97'), C('c1', 'Concorrente 1', ''), C('c2', 'Concorrente 2', ''), C('c3', 'Concorrente 3', ''), C('oport', 'Oportunidade (gap)', '')], { add: 'Adicionar faixa', min: 4, def: [{ faixa: 'R$ 47–97' }, { faixa: 'R$ 197–497' }, { faixa: 'R$ 997–2.997' }, { faixa: 'R$ 5.000+' }] }),
    T('pos_dif', 'Oportunidade de posicionamento — diferenciação principal', ''),
    A('pos_proposta', 'Proposta única sugerida (que nenhum concorrente tem)', ''),
    T('pos_nicho', 'Nicho específico a explorar (menor concorrência)', ''));
}

// --- Mercado: campos do template "03_Análise Completa de Mercado" ---
SECTIONS.find(s => s.id === 'mercado').fields.push(
  R('sazon', 'Sazonalidade e eventos do nicho', [C('quando', 'Mês / evento', 'Janeiro'), C('tipo', 'Pico ou baixa', 'Pico'), C('motivo', 'Motivo e como aproveitar', '', 'area')], { add: 'Adicionar', min: 4 }),
  R('ticket', 'Ticket médio do mercado', [C('faixa', 'Faixa', 'Baixo ticket'), C('valor', 'Valor praticado', 'R$ 47–197')], { add: 'Adicionar faixa', min: 4, def: [{ faixa: 'Baixo ticket' }, { faixa: 'Médio ticket' }, { faixa: 'Alto ticket' }, { faixa: 'Serviços premium' }] }),
  T('busca_volume', 'Volume mensal de buscas principais', ''),
  L('busca_palavras', 'Palavras-chave mais buscadas', ''),
  T('busca_cresc', 'Crescimento das buscas (últimos 12 meses)', ''),
  T('mat_estagio', 'Estágio do mercado (nascente / crescimento / maturidade / declínio)', ''),
  T('mat_saturacao', 'Nível de saturação (baixo / médio / alto) e por quê', ''),
  T('mat_barreira', 'Barreira de entrada percebida', ''),
  T('mat_dif', 'Diferenciação necessária para competir', ''),
  T('mat_nicho', 'Oportunidade de nicho dentro do nicho', ''),
  A('fat_tec', 'Fatores de mudança — tecnológicos', ''),
  A('fat_soc', 'Fatores de mudança — sociais e geracionais', ''),
  A('fat_eco', 'Fatores de mudança — econômicos', ''));

// --- Público: personas completas ---
SECTIONS.find(s => s.id === 'publico').fields.push(
  R('personas', 'Personas completas (1 a 3)', [C('nome', 'Nome e perfil', 'Ricardo, 38, empresário'), C('contexto', 'Contexto e rotina', '', 'area'), C('dores', 'Dores', '', 'area'), C('desejos', 'Desejos', '', 'area'), C('objecoes', 'Objeções', '', 'area'), C('canais', 'Canais e hábitos', '', 'area'), C('gatilho', 'Gatilho de compra', '', 'area'), C('frase', 'Frase típica (na voz da persona)', '')], { add: 'Adicionar persona', min: 3 }));

// --- Expertise: arquétipos múltiplos ---
SECTIONS.find(s => s.id === 'expertise').fields.push(
  R('arquetipos', 'Arquétipos (dominante, sustentação, autoridade…)', [C('nome', 'Arquétipo', 'Creator / Innovator'), C('papel', 'Papel', 'Dominante'), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar arquétipo', min: 3 }));

// --- Novas seções ---
SECTIONS.push(
  { id: 'voz', stage: 'Etapa 3 · Público & Personas', title: 'Voz do mercado & consciência', icon: '❝',
    desc: 'Nível de consciência, objeções reais, linguagem nativa do avatar, crenças limitantes e sonho secreto (Anexo A do POP).',
    prompt: 'Mapeie a VOZ DO MERCADO de {CLIENTE}: (1) nível de consciência predominante (Inconsciente / Consciente do problema / Consciente da solução / Consciente do produto / Mais consciente) com justificativa, implicação para a comunicação (o que funciona e o que NÃO funciona) e % estimada da audiência em cada nível; (2) as 5 principais objeções (como é verbalizada, como contornar, intensidade); (3) 10 frases que o avatar usa para descrever o problema, em linguagem coloquial; (4) 5 termos que ressoam e 5 que afastam; (5) 5 crenças limitantes (como se formou + argumento que desfaz); (6) o sonho secreto não verbalizado. Priorize frases literais coletadas no Sprint de inteligência real.',
    fields: [
      T('cons_nivel', 'Nível predominante de consciência', 'Consciente do problema'),
      A('cons_just', 'Por que esse é o nível predominante?', ''),
      A('cons_impl', 'Implicação para a comunicação (o que funciona e o que NÃO funciona)', ''),
      R('cons_pct', '% estimada da audiência em cada nível', [C('nivel', 'Nível', ''), C('pct', '%', '60%')], { add: 'Adicionar nível', min: 5, def: [{ nivel: 'Inconsciente' }, { nivel: 'Consciente do problema' }, { nivel: 'Consciente da solução' }, { nivel: 'Consciente do produto' }, { nivel: 'Mais consciente' }] }),
      R('objecoes', 'Objeções reais do mercado (5)', [C('objecao', 'Objeção', ''), C('fala', 'Como é verbalizada', ''), C('contorno', 'Como contornar', '', 'area'), C('intensidade', 'Intensidade', 'Alta / Média / Baixa')], { add: 'Adicionar objeção', min: 5 }),
      L('frases', 'Linguagem nativa — 10 frases que o avatar usa (como falaria a um amigo)', ''),
      L('ressoam', '5 termos que RESSOAM com o público', ''),
      L('afastam', '5 termos que AFASTAM o público', ''),
      R('crencas_pub', 'Crenças limitantes do público (5)', [C('crenca', 'Crença', '', 'area'), C('formacao', 'Como se formou', '', 'area'), C('argumento', 'Argumento que desfaz', '', 'area')], { add: 'Adicionar crença', min: 5 }),
      A('sonho', 'Sonho secreto não verbalizado (o que o avatar realmente quer além do resultado declarado)', '')
    ] },

  { id: 'identidade', stage: 'Etapa 4 · VMC — Virtude', title: 'Identidade & objetivos do projeto', icon: '◉',
    desc: 'Ficha do projeto, significado do nome, missão, visão e objetivos — como na abertura do planejamento.',
    prompt: 'Escreva a IDENTIDADE DO PROJETO de {CLIENTE}: marca, fundador(a), categoria, foco principal, vertical secundária, significado do nome, missão e visão, e 6 objetivos do projeto (título + descrição) para os próximos 12 meses.',
    fields: [
      T('marca', 'Marca', ''), T('fundador', 'Fundador(a) / especialista', ''), T('categoria', 'Categoria', ''),
      T('foco', 'Foco principal (para quem)', ''), T('vertical', 'Vertical secundária', ''),
      A('nome_sig', 'O nome — significado', ''), A('missao', 'Missão', ''), A('visao', 'Visão', ''),
      R('objetivos', 'Objetivos do projeto (6)', [C('titulo', 'Objetivo', ''), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar objetivo', min: 6 })
    ] },

  { id: 'tom', stage: 'Etapa 7 · Estratégia de Conteúdo', title: 'Tom de voz & linhas editoriais', icon: '♪',
    desc: 'Atributos do tom de voz, brand persona e as linhas editoriais que organizam o conteúdo.',
    prompt: 'Defina o TOM DE VOZ de {CLIENTE} (6 atributos, cada um com descrição e um exemplo de como soa / como NÃO soa), a brand persona (nome, descrição, como fala, o que evita) e 6 a 8 LINHAS EDITORIAIS (nome, descrição e 3 exemplos de pauta cada).',
    fields: [
      R('tom', 'Tom de voz (6 atributos)', [C('atributo', 'Atributo', 'Claro'), C('desc', 'O que significa', '', 'area'), C('exemplo', 'Soa assim / não soa assim', '', 'area')], { add: 'Adicionar atributo', min: 6 }),
      T('bp_nome', 'Brand persona — nome', ''), A('bp_desc', 'Brand persona — descrição', ''),
      L('bp_fala', 'Como a marca fala', ''), L('bp_evita', 'O que a marca evita', ''),
      R('linhas', 'Linhas editoriais (6 a 8)', [C('nome', 'Linha', 'Crescimento replicável'), C('desc', 'Descrição', '', 'area'), C('exemplos', 'Exemplos de pauta (um por linha)', '', 'area')], { add: 'Adicionar linha', min: 6 })
    ] },

  { id: 'sprint', stage: 'Etapa 2 · Mercado', title: 'Sprint de inteligência real', icon: '✋', manual: true,
    desc: 'Passo MANUAL do POP: dados reais coletados à mão (Meta Ads Library, comentários, Reclame Aqui, YouTube). A IA usa isso com prioridade sobre qualquer dado inferido.',
    prompt: '',
    fields: [
      R('anuncios', 'Meta Ads Library — anúncios ativos há mais tempo (mínimo 3)', [C('concorrente', 'Concorrente', ''), C('promessa', 'Promessa principal do anúncio', ''), C('hook', 'Hook de abertura', ''), C('emocao', 'Medo ou desejo ativado', ''), C('formato', 'Formato (vídeo / imagem / carrossel)', '')], { add: 'Adicionar anúncio', min: 3 }),
      R('comentarios', 'Mineração de comentários — 10 frases LITERAIS por concorrente', [C('concorrente', 'Concorrente', ''), C('frases', 'Frases exatas (uma por linha: elogios, reclamações, perguntas)', '', 'area')], { add: 'Adicionar concorrente', min: 3 }),
      R('reclame', 'Reclame Aqui / Google — 3 queixas recorrentes', [C('concorrente', 'Concorrente', ''), C('queixa', 'Queixa recorrente', '')], { add: 'Adicionar queixa', min: 3 }),
      T('yt_busca', 'YouTube — termo buscado e link do vídeo mais visto', ''),
      L('yt_frases', 'YouTube — 5 frases literais dos 20 primeiros comentários (dores e frustrações)', '')
    ] }
);

// critérios de pronto do sprint (POP, etapa 3)
function sprintStatus(P_) {
  const d = (P_.data || P_).sprint || {};
  const filledRows = k => (d[k] || []).filter(r => Object.values(r).some(v => String(v || '').trim()));
  const lines = s => String(s || '').split('\n').filter(x => x.trim()).length;
  const com = filledRows('comentarios');
  return [
    { ok: filledRows('anuncios').length >= 3, t: `Anúncios documentados: ${filledRows('anuncios').length}/3` },
    { ok: com.length >= 2 && com.every(r => lines(r.frases) >= 10), t: `Concorrentes com 10 frases de comentários: ${com.filter(r => lines(r.frases) >= 10).length}/${Math.max(com.length, 2)}` },
    { ok: filledRows('reclame').length >= 3, t: `Queixas do Reclame Aqui/Google: ${filledRows('reclame').length}/3` },
    { ok: (d.yt_frases || []).length >= 5, t: `Frases literais do YouTube: ${(d.yt_frases || []).length}/5` }
  ];
}

// --- Ordem do processo e checklist ---
const ORDER2 = ['briefing', 'diag', 'mercado', 'sprint', 'conc', 'publico', 'voz', 'identidade', 'marca', 'expertise', 'origem', 'movimento', 'esteira', 'posic', 'tom', 'conteudo', 'lancamento', 'projecoes', 'plano', 'resumo', 'proposta'];
SECTIONS.sort((a, b) => ORDER2.indexOf(a.id) - ORDER2.indexOf(b.id));
CHECKLIST[1].items.push('Pesquisa feita em duas IAs e consolidada (divergências conferidas)', 'Sprint de inteligência real concluído (anúncios, comentários, Reclame Aqui, YouTube)', 'Checklist de validação da pesquisa 100% marcado');
