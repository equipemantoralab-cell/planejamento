/* ====== Seções adicionais (fecham o processo da planilha: etapas 1, 9, 10, 12 e 13) ====== */
SECTIONS.push(
  { id: 'briefing', stage: 'Etapa 1 · Coleta & diagnóstico', title: 'Briefing & DNA do cliente', icon: '☰',
    desc: 'Base de tudo: quem é o cliente, para quem fala e onde está hoje. Alimenta o contexto dos prompts de todos os outros tópicos.',
    prompt: 'Resuma o briefing e o DNA do Expert de {CLIENTE}: nicho, para quem ele fala (avatar), momento atual do negócio, objetivo para os próximos 12 meses, produtos e faturamento atuais, principais desafios e links dos canais.',
    fields: [
      T('nicho', 'Nicho / área de atuação', 'IA aplicada para profissionais de tecnologia'),
      A('avatar', 'Para quem o cliente fala (avatar)', 'Dev pleno a tech lead, empregado, que quer...'),
      A('momento', 'Momento atual do negócio', 'Já validou X, tem Y seguidores, vende Z...'),
      A('objetivo12', 'Objetivo para os próximos 12 meses', 'Faturar R$ ..., lançar ..., construir audiência de ...'),
      T('faturamento', 'Faturamento / ticket atual', 'R$ 20 mil/mês · ticket R$ 497'),
      A('produtos_atuais', 'Produtos e serviços atuais', ''),
      L('desafios', 'Principais desafios do cliente (3 a 5)', ''),
      L('links', 'Links dos canais e materiais', 'https://instagram.com/...'),
      A('call', 'Anotações da call de produto / alinhamento', 'Pontos importantes que o cliente trouxe...'),
      A('material', 'Material-base para a IA (cole aqui ou anexe arquivos)', 'Cole o briefing respondido, o DNA do Expert, a pesquisa de mercado e a transcrição da call…', 'Tudo que a IA vai ler para preencher os outros tópicos. Quanto mais completo, melhor o resultado. Não aparece na apresentação.')
    ] },

  { id: 'lancamento', stage: 'Etapa 9 · Canais & lançamento', title: 'Lançamento & e-mail marketing', icon: '➚',
    desc: 'Plano de lançamento do primeiro produto e a sequência de e-mails de nutrição.',
    prompt: 'Planeje o lançamento do primeiro produto de {CLIENTE} (o produto de caixa/entrada): linha do tempo com quando, ação e responsável (pré-lançamento, abertura, carrinho, fechamento) e uma sequência de 5 a 7 e-mails de nutrição com dia, assunto e objetivo.',
    fields: [
      T('lanc_produto', 'Produto do primeiro lançamento', 'Toolkit IA para Devs (R$ 97)'),
      A('lanc_intro', 'Estratégia do lançamento', 'Modelo, duração, meta de vendas, canais de aquecimento...'),
      R('lanc_cron', 'Cronograma do lançamento', [C('quando', 'Quando', 'D-14'), C('acao', 'Ação', '', 'area'), C('resp', 'Responsável', 'Cliente / Mantora')], { add: 'Adicionar etapa', min: 6 }),
      R('emails', 'Sequência de e-mails', [C('dia', 'Dia', 'Dia 1'), C('assunto', 'Assunto', ''), C('objetivo', 'Objetivo', '')], { add: 'Adicionar e-mail', min: 5 })
    ] },

  { id: 'projecoes', stage: 'Etapa 10 · Projeções & mídia kit', title: 'Projeções & ROI', icon: '∑',
    desc: 'Projeção financeira de 12 meses baseada no SOM e retorno esperado por canal.',
    prompt: 'Monte as projeções de {CLIENTE} para 12 meses, coerentes com o SOM/TAM já definido: premissas (conversão, ticket, tráfego), projeção por trimestre (leads, vendas, faturamento) e ROI esperado por canal de marketing (investimento, retorno, ROI e observação). Use números realistas e explique as premissas.',
    fields: [
      L('premissas', 'Premissas da projeção', 'Conversão da isca: 25%'),
      R('proj', 'Projeção (trimestres ou meses)', [C('periodo', 'Período', 'Trimestre 1'), C('leads', 'Leads', '300'), C('vendas', 'Vendas', '40'), C('fat', 'Faturamento (R$)', 'R$ 12.000')], { add: 'Adicionar período', min: 4 }),
      A('proj_nota', 'Nota sobre a projeção', 'Cenário conservador. Não é promessa de resultado.'),
      R('roi', 'ROI por canal', [C('canal', 'Canal', 'Instagram orgânico'), C('invest', 'Investimento', 'R$ 0 + 10h/semana'), C('retorno', 'Retorno esperado', ''), C('roi', 'ROI', 'Alto'), C('obs', 'Observação', '')], { add: 'Adicionar canal', min: 4 })
    ] },

  { id: 'resumo', stage: 'Etapa 12 · Apresentação', title: 'Resumo executivo & SWOT', icon: '◈',
    desc: 'A abertura da apresentação: ponto de partida, onde queremos chegar, pilares da estratégia e análise SWOT. Preencha por último.',
    prompt: 'Com tudo que construímos para {CLIENTE}, escreva o RESUMO EXECUTIVO da apresentação: onde ele está hoje, onde queremos chegar em 12 meses, 3 pilares estratégicos (título + descrição), 3 números-meta de destaque e a análise SWOT (3 a 4 itens por quadrante).',
    fields: [
      A('partida', 'Ponto de partida — onde estamos', ''),
      A('chegada', 'Ponto de chegada — onde queremos chegar (12 meses)', ''),
      R('pilares', 'Pilares da estratégia (3)', [C('titulo', 'Pilar', 'Autoridade'), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar pilar', min: 3 }),
      R('metas', 'Números-meta de destaque (3)', [C('valor', 'Número', 'R$ 300–600 mil'), C('label', 'O que é', 'Faturamento do 1º ciclo')], { add: 'Adicionar meta', min: 3 }),
      L('swot_f', 'SWOT · Forças', ''),
      L('swot_fr', 'SWOT · Fraquezas', ''),
      L('swot_o', 'SWOT · Oportunidades', ''),
      L('swot_a', 'SWOT · Ameaças', '')
    ] },

  { id: 'proposta', stage: 'Etapa 13 · Proposta comercial', title: 'Proposta de implementação', icon: '✓',
    desc: 'Opcional: escopo, investimento, cronograma de implementação e próximos passos. Se deixar vazio, os slides não aparecem.',
    prompt: 'Elabore a proposta de implementação do planejamento de {CLIENTE}: escopo (entregáveis com descrição), opções de investimento (nome, valor, o que inclui), condições de pagamento, cronograma de implementação (fase, prazo, entregas) e próximos passos.',
    fields: [
      R('escopo', 'Escopo / entregáveis', [C('titulo', 'Entregável', ''), C('desc', 'Descrição', '', 'area')], { add: 'Adicionar entregável', min: 4 }),
      R('opcoes', 'Investimento', [C('nome', 'Plano / item', 'Implementação completa'), C('valor', 'Valor', 'R$ 12.000'), C('inclui', 'O que inclui', '', 'area')], { add: 'Adicionar opção', min: 1 }),
      A('condicoes', 'Condições de pagamento e validade', ''),
      R('impl', 'Cronograma de implementação', [C('fase', 'Fase', 'Setup'), C('prazo', 'Prazo', 'Semanas 1–2'), C('entregas', 'Entregas', '', 'area')], { add: 'Adicionar fase', min: 3 }),
      L('passos', 'Próximos passos', '')
    ] }
);

// campos extras nas seções existentes
SECTIONS.find(s => s.id === 'expertise').fields.splice(3, 0,
  R('provas', 'Autoridade em números (3 a 4)', [C('valor', 'Número', '17+'), C('label', 'O que é', 'anos liderando operação crítica')], { add: 'Adicionar número', min: 3 }));
SECTIONS.find(s => s.id === 'conteudo').fields.splice(5, 0,
  T('capacidade', 'Capacidade produtiva do cliente', '1 post por dia · 3 vídeos por semana', 'Define a versão da estrutura VMC (1 ou 2 posts/dia).'));
SECTIONS.find(s => s.id === 'plano').fields.splice(2, 0,
  R('cron90', 'Cronograma executivo — 90 dias', [C('periodo', 'Período', 'Semanas 1–2'), C('acao', 'Ação', '', 'area'), C('resp', 'Responsável', 'Cliente / Mantora')], { add: 'Adicionar linha', min: 6 }));

// ordem do processo (planilha)
const ORDER = ['briefing', 'diag', 'mercado', 'conc', 'publico', 'marca', 'expertise', 'origem', 'movimento', 'esteira', 'posic', 'conteudo', 'lancamento', 'projecoes', 'plano', 'resumo', 'proposta'];
SECTIONS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
['marca', 'expertise', 'origem'].forEach(id => SECTIONS.find(s => s.id === id).stage = 'Etapa 4 · VMC — Virtude');

// contexto do cliente (xlsx 2.7) e prompt com briefing embutido
function contextPrompt(P) {
  const b = P.data.briefing || {}, c = P.meta.cliente || 'o cliente';
  return `Olá Claude, vamos fazer um planejamento estratégico de marketing para um cliente chamado ${c}. Ele(a) fala para ${b.avatar || '[AVATAR DO CLIENTE]'}.\n\nNicho: ${b.nicho || '—'}\nMomento atual: ${b.momento || '—'}\nObjetivo em 12 meses: ${b.objetivo12 || '—'}\n\nQuero que primeiro você leia as informações que vou te passar (briefing respondido, DNA do Expert, pesquisa de mercado, transcrição da call) e não faça nada. Depois eu guio cada etapa e decido quando avançar.`;
}
const _buildPrompt = buildPrompt;
buildPrompt = function (sec, cliente, P) {
  let p = _buildPrompt(sec, cliente);
  if (P && P.data.briefing && sec.id !== 'briefing') {
    const b = P.data.briefing, ctx = [b.nicho && `Nicho: ${b.nicho}`, b.avatar && `Avatar: ${b.avatar}`, b.objetivo12 && `Objetivo em 12 meses: ${b.objetivo12}`].filter(Boolean).join('\n');
    if (ctx) p = p.replace('\n\nUse todo o contexto', `\n\nContexto resumido:\n${ctx}\n\nUse todo o contexto`);
  }
  return p;
};
