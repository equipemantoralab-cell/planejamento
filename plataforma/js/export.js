/* Exportações: Documento Word (.docx) do planejamento e Pacote .md com os nomes do POP da Mantora. */
const DOC_ORDER = ['resumo', 'identidade', 'briefing', 'diag', 'marca', 'expertise', 'origem', 'movimento', 'mercado', 'conc', 'publico', 'voz', 'esteira', 'posic', 'tom', 'conteudo', 'lancamento', 'projecoes', 'plano', 'proposta'];
const hasData = (P_, id) => { const sec = SECTIONS.find(s => s.id === id); if (!sec) return false; const d = P_.data[id] || {}; return sec.fields.some(f => { const v = d[f.k]; if (f.t === 'rows') return rowsOf(d, f.k).length > 0; if (f.t === 'list') return (v || []).some(x => String(x).trim()); return String(v ?? '').trim(); }); };
const dl = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
const safe = s => String(s || '').replace(/[\\/:*?"<>|]+/g, '-').trim();

/* ---------- helpers de leitura dos campos ---------- */
function rowTitle(f, r) { const c = f.cols.find(c => String(r[c.k] || '').trim()); return c ? String(r[c.k]).trim() : ''; }
function visibleRows(f, d) { return rowsOf(d, f.k); }

/* ---------- Markdown ---------- */
function fieldMd(f, d, lvl = '###') {
  const v = d[f.k];
  if (f.t === 'text' || f.t === 'area') return String(v || '').trim() ? `${lvl} ${f.label}\n${String(v).trim()}\n` : '';
  if (f.t === 'list') return (v || []).filter(x => String(x).trim()).length ? `${lvl} ${f.label}\n${v.filter(x => String(x).trim()).map(x => '- ' + x).join('\n')}\n` : '';
  const rows = visibleRows(f, d); if (!rows.length) return '';
  const body = rows.map((r, i) => {
    const first = f.cols[0], head = String(r[first.k] || '').trim() || `Item ${i + 1}`;
    const rest = f.cols.slice(1).filter(c => String(r[c.k] || '').trim()).map(c => `- **${c.label}:** ${String(r[c.k]).trim().replace(/\n/g, '\n  ')}`);
    return `**${i + 1}. ${head}**\n${rest.join('\n')}`;
  }).join('\n\n');
  return `${lvl} ${f.label}\n${body}\n`;
}
function sectionMd(id, P_, h = '##') {
  const sec = SECTIONS.find(s => s.id === id), d = P_.data[id] || {}; if (!sec || !hasData(P_, id)) return '';
  const lvl = h + '#';
  return `${h} ${sec.title}\n\n${sec.fields.map(f => fieldMd(f, d, lvl)).filter(Boolean).join('\n')}`;
}
const mdHeader = (title, P_) => `# ${title}\n\nCliente: ${P_.meta.cliente}\nNicho: ${(P_.data.briefing || {}).nicho || '—'}\nData: ${new Date().toLocaleDateString('pt-BR')}${P_.meta.estrategista ? `\nResponsável: ${P_.meta.estrategista}` : ''}\n\n`;

// Anexo C — 02_Análise da Concorrência
function mdConcorrencia(P_) {
  const d = P_.data.conc || {}, cc = rowsOf(d, 'concorrentes'); if (!cc.length && !hasData(P_, 'conc')) return '';
  const tab = txt => { const ls = String(txt || '').split('\n').map(x => x.trim()).filter(Boolean); if (!ls.length) return '—'; return '| Produto | Preço | Formato |\n|---|---|---|\n' + ls.map(l => { const p = l.split(/\s[—–-]\s|\s\|\s/); return `| ${p[0] || ''} | ${p[1] || ''} | ${p[2] || ''} |`; }).join('\n'); };
  const bul = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean).map(x => '- ' + x).join('\n') || '—';
  let o = mdHeader('ANÁLISE SIMPLIFICADA DE CONCORRÊNCIA', P_);
  cc.forEach((c, i) => {
    o += `## CONCORRENTE ${i + 1}: ${c.nome}\n${c.sub ? `*${c.sub}*\n` : ''}\n### PRODUTOS & PREÇOS\n${c.produtos ? tab(c.produtos) : (c.precos || '—')}\n\n### PROPOSTA ÚNICA\n${c.usp || '—'}\n\n### PONTOS FORTES\n${bul(c.fortes)}\n\n### GAPS IDENTIFICADOS\n${bul(c.fracos)}\n${c.oport ? `\nOportunidade: ${c.oport}\n` : ''}\n### ANÁLISE DE COMUNICAÇÃO\n${c.comunicacao || '—'}\n${c.anuncios ? `\nAnúncios: ${c.anuncios}\n` : ''}\n### MÉTRICAS DE ENGAJAMENTO\n${c.metricas || '—'}\n\n`;
  });
  const mp = rowsOf(d, 'mapa_precos'), gaps = rowsOf(d, 'gaps');
  o += '## ANÁLISE CONSOLIDADA\n\n';
  if (mp.length) o += '### MAPA DE PREÇOS DO MERCADO\n| Faixa de Preço | Concorrente 1 | Concorrente 2 | Concorrente 3 | OPORTUNIDADE |\n|---|---|---|---|---|\n' + mp.map(x => `| ${x.faixa} | ${x.c1 || ''} | ${x.c2 || ''} | ${x.c3 || ''} | ${x.oport || ''} |`).join('\n') + '\n\n';
  if (gaps.length) o += '### PRINCIPAIS GAPS DE MERCADO\n' + gaps.map(g => `- **${g.titulo}:** ${g.desc}`).join('\n') + '\n\n';
  o += '### OPORTUNIDADES DE POSICIONAMENTO\n' + [d.pos_dif && `- Diferenciação principal: ${d.pos_dif}`, d.pos_proposta && `- Proposta única sugerida: ${d.pos_proposta}`, d.pos_nicho && `- Nicho específico a explorar: ${d.pos_nicho}`, d.branco && `- Espaço em branco: ${d.branco}`].filter(Boolean).join('\n') + '\n';
  return o;
}
// Anexo D — 03_Análise Completa de Mercado
function mdMercado(P_) {
  const d = P_.data.mercado || {}; if (!hasData(P_, 'mercado')) return '';
  const rs = P_.research || {}, L = [mdHeader('ANÁLISE COMPLETA DE MERCADO', P_)];
  const rowsMd = (k, f) => rowsOf(d, k).map(f).join('\n');
  L.push('## 1. TAMANHO DE MERCADO\n');
  L.push('**TAM** — Total Addressable Market · **SAM** — Serviceable Addressable Market · **SOM** — Serviceable Obtainable Market\n');
  L.push(rowsMd('tss', x => `### ${x.sigla}: ${x.valor} ${x.sufixo || ''}\n${x.desc || ''}\n`));
  if (d.tss_nota) L.push(`*${d.tss_nota}*\n`);
  const q = rowsOf(d, 'quant'); if (q.length) L.push('### PÚBLICO-ALVO QUANTIFICADO\n' + q.map(x => `- **${x.label}:** ${x.valor}`).join('\n') + '\n');
  if (d.busca_volume || (d.busca_palavras || []).length) L.push('### DADOS DE BUSCA\n' + [d.busca_volume && `- Volume mensal de buscas principais: ${d.busca_volume}`, (d.busca_palavras || []).length && `- Palavras-chave mais buscadas: ${d.busca_palavras.join(', ')}`, d.busca_cresc && `- Crescimento (12 meses): ${d.busca_cresc}`].filter(Boolean).join('\n') + '\n');
  const tk = rowsOf(d, 'ticket'); if (tk.length) L.push('### TICKET MÉDIO DO MERCADO\n' + tk.map(x => `- ${x.faixa}: ${x.valor}`).join('\n') + '\n');
  if (d.insight) L.push(`### INSIGHTS DO TAMANHO\n${d.insight}\n`);
  L.push('## 2. TENDÊNCIAS DO NICHO\n'); const nu = rowsOf(d, 'numeros'); L.push(nu.map(x => `- **${x.valor} — ${x.titulo}:** ${x.desc}`).join('\n') + '\n');
  const sz = rowsOf(d, 'sazon'); if (sz.length) L.push('## 3. SAZONALIDADES IDENTIFICADAS\n' + sz.map(x => `- **${x.quando}** (${x.tipo || '—'}): ${x.motivo || ''}`).join('\n') + '\n');
  const mat = [['Estágio do mercado', 'mat_estagio'], ['Nível de saturação', 'mat_saturacao'], ['Barreira de entrada percebida', 'mat_barreira'], ['Diferenciação necessária para competir', 'mat_dif'], ['Oportunidade de nicho dentro do nicho', 'mat_nicho']].filter(([, k]) => d[k]);
  if (mat.length) L.push('## 4. MATURIDADE E SATURAÇÃO DO MERCADO\n' + mat.map(([l, k]) => `- **${l}:** ${d[k]}`).join('\n') + '\n');
  L.push('## 5. PREVISÃO DE EVOLUÇÃO — 5 ANOS\n');
  if (d.cenario) L.push(d.cenario.split('\n').filter(Boolean).map(x => '- ' + x).join('\n') + '\n');
  [['Tecnológicos', 'fat_tec'], ['Sociais e geracionais', 'fat_soc'], ['Econômicos', 'fat_eco']].forEach(([l, k]) => { if (d[k]) L.push(`**Fatores ${l}:** ${d[k]}\n`); });
  const op = rowsOf(d, 'oport'); if (op.length) L.push('### OPORTUNIDADES EMERGENTES\n' + op.map(x => `- **${x.titulo}:** ${x.desc}`).join('\n') + '\n');
  const hz = rowsOf(d, 'horizontes'); if (hz.length) L.push('### RECOMENDAÇÕES ESTRATÉGICAS\n' + hz.map(x => `- **${x.titulo}:** ${x.desc}`).join('\n') + '\n');
  const src = ['mercado', 'keywords', 'tendencias'].flatMap(k => (rs[k] && rs[k].sources) || []); if (src.length) L.push('## FONTES\n' + src.map(s => `- [${s.title}](${s.url})`).join('\n') + '\n');
  return L.join('\n');
}
function mdPesquisaInicial(P_) {
  const rs = P_.research || {}, ids = Object.keys(rs).filter(k => rs[k].text); if (!ids.length) return '';
  const ord = [...RES_IDS.filter(i => ids.includes(i)), ...ids.filter(i => !RES_IDS.includes(i))];
  let o = mdHeader('Pesquisa de Mercado Inicial', P_) + `Versão do prompt: ${PROMPT_VERSION}\nIAs usadas: ${[...new Set(ord.flatMap(i => rs[i].by || []))].map(x => PROVIDERS[x] ? PROVIDERS[x].name : x).join(', ') || '—'}\nValidação: ${validationProgress(P_).done}/${validationProgress(P_).total} itens do checklist\n\n---\n\n`;
  o += ord.map(i => `## ${(RESEARCH.find(m => m.id === i) || rs[i]).title}\n\n${rs[i].text}\n\n${(rs[i].sources || []).length ? '**Fontes:**\n' + rs[i].sources.map(s => `- [${s.title}](${s.url})`).join('\n') + '\n' : ''}`).join('\n---\n\n');
  return o;
}

async function exportMdPack() {
  if (typeof JSZip === 'undefined') return toast('A biblioteca de ZIP não carregou. Verifique a internet e recarregue.');
  const P_ = P(), c = safe(P_.meta.cliente), z = new JSZip(), add = (path, content, title) => { if (content && content.trim()) z.file(path, (title ? `<!-- Título no Drive: ${title} -->\n` : '') + content); };
  const bf = z.folder('01_Briefing'), es = z.folder('02_Estratégia'), pr = P_.data;
  const brief = (hasData(P_, 'briefing') ? mdHeader('DNA do Expert / Briefing', P_) + sectionMd('briefing', P_, '##').replace(/^## .*\n\n/, '') : '') + (((pr.briefing || {}).material) ? `\n\n---\n\n## Material-base anexado\n\n${pr.briefing.material}\n` : '');
  const put = (folder, name, content, driveTitle) => { if (content && content.trim()) folder.file(`${name} - ${c}.md`, `<!-- Título no Drive: ${name} | ${P_.meta.cliente} -->\n\n${content}`); };
  put(bf, 'Briefing e DNA', brief);
  put(bf, 'Pesquisa de Mercado Inicial', mdPesquisaInicial(P_));
  put(bf, 'Sprint de inteligência real', sprintMd(P_) ? mdHeader('Sprint de inteligência real', P_) + sprintMd(P_) : '');
  put(es, '02_Análise da Concorrência', mdConcorrencia(P_));
  put(es, '03_Análise de Mercado', mdMercado(P_));
  put(es, '04_0_Público-Alvo Base', mdHeader('Público-Alvo Base', P_) + ['publico', 'voz'].map(id => sectionMd(id, P_)).filter(Boolean).join('\n\n'));
  rowsOf(pr.publico || {}, 'personas').forEach((x, i) => put(es, `04.${i + 1}_Persona ${i + 1}`, mdHeader(`Persona ${i + 1}: ${x.nome}`, P_) + [['Contexto e rotina', x.contexto], ['Dores', x.dores], ['Desejos', x.desejos], ['Objeções', x.objecoes], ['Canais e hábitos', x.canais], ['Gatilho de compra', x.gatilho], ['Frase típica', x.frase]].filter(([, v]) => v).map(([l, v]) => `## ${l}\n${v}\n`).join('\n')));
  put(es, '05_0_Gênesis Do Líder Em Movimento', mdHeader('Gênesis do Líder em Movimento (Virtude e Movimento)', P_) + ['identidade', 'marca', 'expertise', 'origem', 'movimento'].map(id => sectionMd(id, P_)).filter(Boolean).join('\n\n'));
  put(es, '06_Ideação de Produtos', mdHeader('Ideação de Produtos', P_) + sectionMd('esteira', P_));
  put(es, '07_Posicionamento Para Redes Sociais', mdHeader('Posicionamento para Redes Sociais', P_) + ['posic', 'tom'].map(id => sectionMd(id, P_)).filter(Boolean).join('\n\n'));
  put(es, '08_Estratégia de Conteúdo', mdHeader('Estratégia de Conteúdo', P_) + sectionMd('conteudo', P_));
  const n = Object.keys(z.files).filter(k => !z.files[k].dir).length;
  if (!n) return toast('Ainda não há conteúdo para exportar. Preencha os tópicos ou rode a pesquisa.');
  dl(await z.generateAsync({ type: 'blob' }), `Pacote_MD_${c}.zip`);
  toast(`Pacote gerado com ${n} arquivo(s) .md nas pastas 01_Briefing e 02_Estratégia. (No Windows o "|" do nome vira " - "; o título do Drive está no início de cada arquivo.)`);
}

/* ---------- Documento Word (.docx) ---------- */
async function exportDocx() {
  if (typeof docx === 'undefined') return toast('A biblioteca de Word não carregou. Verifique a internet e recarregue.');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, Footer, PageNumber, AlignmentType, PageBreak } = docx;
  const P_ = P(), m = P_.meta, col = (m.brand || '#582aab').replace('#', ''), FONT = 'Calibri';
  const run = (t, o = {}) => new TextRun({ text: String(t), font: FONT, ...o });
  const para = (t, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, ...o.p, children: [run(t, o.r || {})] });
  const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, children: [run(t, { color: col, bold: true, size: 34 })] });
  const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 80 }, children: [run(t, { color: '3b2a63', bold: true, size: 24 })] });
  const bullet = t => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [run(t)] });
  const paras = t => String(t).split('\n').filter(x => x.trim()).map(x => para(x));
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'D9D2EE' };
  const cell = (t, head) => new TableCell({ shading: head ? { type: ShadingType.CLEAR, fill: col, color: 'auto' } : undefined, margins: { top: 70, bottom: 70, left: 100, right: 100 }, borders: { top: border, bottom: border, left: border, right: border }, children: String(t || '').split('\n').map(x => new Paragraph({ children: [run(x, head ? { bold: true, color: 'FFFFFF', size: 20 } : { size: 20 })] })) });
  const table = (heads, rows) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: heads.map(h => cell(h, true)) }), ...rows.map(r => new TableRow({ children: r.map(v => cell(v)) }))] });
  const kids = [];
  // capa
  kids.push(new Paragraph({ spacing: { before: 3200, after: 200 }, children: [run('PLANEJAMENTO ESTRATÉGICO', { color: col, bold: true, size: 64 })] }), para(m.cliente || '', { r: { size: 40, bold: true } }), para(m.tagline || '', { r: { size: 26, color: '6f6585' } }), para([m.agencia, m.data || m.ano].filter(Boolean).join('  ·  '), { r: { size: 22, color: '6f6585' }, p: { spacing: { before: 600 } } }), m.estrategista ? para(`Estratégia: ${m.estrategista}`, { r: { size: 22, color: '6f6585' } }) : para(''), new Paragraph({ children: [new PageBreak()] }));
  // sumário
  const ids = DOC_ORDER.filter(id => !(m.off || []).includes(id) && hasData(P_, id));
  kids.push(h1('Sumário'), ...ids.map((id, i) => para(`${i + 1}. ${SECTIONS.find(s => s.id === id).title}`, { r: { size: 24 } })), new Paragraph({ children: [new PageBreak()] }));
  ids.forEach((id, si) => {
    const sec = SECTIONS.find(s => s.id === id), d = P_.data[id] || {};
    kids.push(h1(`${si + 1}. ${sec.title}`));
    sec.fields.forEach(f => {
      const v = d[f.k];
      if (f.t === 'text' || f.t === 'area') { if (String(v || '').trim()) kids.push(h2(f.label), ...paras(v)); }
      else if (f.t === 'list') { const l = (v || []).filter(x => String(x).trim()); if (l.length) kids.push(h2(f.label), ...l.map(bullet)); }
      else {
        const rows = visibleRows(f, d); if (!rows.length) return;
        kids.push(h2(f.label));
        if (f.cols.length <= 4) kids.push(table(f.cols.map(c => c.label), rows.map(r => f.cols.map(c => r[c.k] || ''))), para(''));
        else rows.forEach((r, i) => { kids.push(new Paragraph({ spacing: { before: 160, after: 60 }, children: [run(`${i + 1}. ${rowTitle(f, r)}`, { bold: true, size: 24, color: col })] })); f.cols.slice(1).forEach(c => { if (String(r[c.k] || '').trim()) kids.push(new Paragraph({ spacing: { after: 60 }, children: [run(c.label + ': ', { bold: true, size: 21 }), run(String(r[c.k]).replace(/\n/g, ' · '), { size: 21 })] })); }); });
      }
    });
  });
  const src = allSources(P_);
  if (src.length && !(m.off || []).includes('pesquisa')) kids.push(h1('Fontes consultadas'), ...src.slice(0, 80).map(s => bullet(`${s.title} — ${s.url}`)));
  const doc = new Document({
    creator: m.agencia || 'Mantora Lab', title: `Planejamento Estratégico ${m.cliente}`,
    styles: { default: { document: { run: { font: FONT, size: 22 } } }, paragraphStyles: [{ id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 34, bold: true, color: col }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } }, { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: '3b2a63' }, paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 1 } }] },
    sections: [{ properties: { page: { margin: { top: 1200, bottom: 1200, left: 1300, right: 1300 } } }, footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(`${m.cliente} · Planejamento Estratégico · `, { size: 16, color: '9a8fb0' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9a8fb0', font: FONT })] })] }) }, children: kids }]
  });
  dl(await Packer.toBlob(doc), `Planejamento_Estrategico_${safe(m.cliente).replace(/\s+/g, '_')}.docx`);
  toast('Documento Word gerado (' + ids.length + ' seções).');
}
