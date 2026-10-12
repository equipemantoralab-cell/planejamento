// Monta os slides do planejamento a partir dos dados preenchidos.
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl = s => esc(s).replace(/\n/g, '<br>');
const lines = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };
const filled = o => Object.values(o || {}).some(v => String(v ?? '').trim());
const defsOf = k => { for (const sc of SECTIONS) for (const f of sc.fields) if (f.k === k) return f.def || []; return []; };
const rowsOf = (d, k) => { const defs = defsOf(k); return (Array.isArray(d[k]) ? d[k] : []).filter(r => Object.entries(r || {}).some(([c, v]) => String(v ?? '').trim() && !defs.some(x => x[c] === v))); };
const parseNum = s => { s = String(s || '').toLowerCase(); const m = s.match(/[\d.,]+/); if (!m) return 0; let n = m[0]; if (/,\d{1,2}$/.test(n)) n = n.replace(/\./g, '').replace(',', '.'); else n = n.replace(/[.,]/g, ''); let v = parseFloat(n) || 0; if (/mi|milh/.test(s)) v *= 1e6; else if (/k|mil/.test(s)) v *= 1e3; return v; };
const txt = (d, k) => String(d[k] ?? '').trim();
const listOf = (d, k) => (Array.isArray(d[k]) ? d[k] : []).map(x => String(x).trim()).filter(Boolean);
const spaced = s => esc(s);

function buildSlides(P, A) {
  const m = P.meta, off = m.off || [];
  let curBlk = 'cover';
  const items = [];
  const out = { push: h => items.push({ h, b: curBlk }) };
  const D = id => { curBlk = id; return off.includes(id) ? {} : (P.data[id] || {}); };
  const cli = m.cliente || 'Cliente';
  const FOOT = `<div class="foot"><span>${esc(cli)} · Planejamento Estratégico</span><span>%N%</span></div>`;
  const styleVars = `--brand:${m.brand || '#2b04b5'};--dark:${m.dark || '#000033'};--accent:${m.accent || '#19a7c2'}`;
  const mt = m.estilo === 'mantora' ? ' mt' : '';
  const mlogo = (h, col) => (typeof MANTORA_LOGO === 'undefined') ? '' : `<svg class="lg-m" viewBox="${MANTORA_LOGO.full.vb.join(' ')}" style="height:${h}px;color:${col || '#fff'}"><path fill="currentColor" d="${MANTORA_LOGO.full.d}"/></svg>`;
  const useLogo = m.logoMantora !== false && /mantora/i.test(m.agencia || '');
  const sec = (cls, inner, extra = '') => `<section class="slide${mt} ${cls}" style="${styleVars};${extra}">${inner}${FOOT}</section>`;
  const std = (eb, title, lead, body, o = {}) => out.push(sec('', `<div class="pad"><div class="eb">${esc(eb)}</div><h2>${esc(title)}</h2>${lead ? `<p class="lead">${nl(lead)}</p>` : ''}</div><div class="body" style="${lead ? 'top:244px' : ''};${o.bottom ? `bottom:${o.bottom}px` : ''}">${body}</div>${o.after || ''}`));
  const dkq = (eb, quote, who) => out.push(sec('dk', `<div class="center"><div class="eb">${esc(eb)}</div><div class="quote">${nl(quote)}</div>${who ? `<div class="who">${esc(who)}</div>` : ''}</div>`));
  const divider = (eb, title, lead) => {
    const bg = A.foto1 ? `--bg:url('${A.foto1}')` : '';
    out.push(sec(`divider ${A.foto1 ? 'photo' : 'dk'}`, `<div class="pad"><div class="eb">${esc(eb)}</div><h2>${esc(title)}</h2>${lead ? `<p class="lead">${nl(lead)}</p>` : ''}</div>`, bg));
  };
  const card = (h, p, cls = '', extra = '') => `<div class="card ${cls}">${extra}<h3>${esc(h)}</h3><p>${nl(p)}</p></div>`;
  const bar = (b, t, cls = '') => `<div class="bar ${cls}"><div><b>${esc(b)}</b> ${nl(t)}</div></div>`;
  const tbl = (heads, rows, w = []) => `<table class="tb"><tr>${heads.map((h, i) => `<th${w[i] ? ` style="width:${w[i]}px"` : ''}>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${nl(c)}</td>`).join('')}</tr>`).join('')}</table>`;
  const ul = (arr, cls = '') => `<ul class="ul ${cls}">${arr.map(x => `<li>${nl(x)}</li>`).join('')}</ul>`;

  /* ---------- Capa ---------- */
  {
    const bg = A.foto1 ? `--bg:url('${A.foto1}')` : '';
    const extra = [m.data, m.estrategista && `Estratégia: ${m.estrategista}`].filter(Boolean).join('  ·  ');
    out.push(sec(`cover ${A.foto1 ? 'photo' : 'dk'}`, `${A.logo ? `<img class="lg" src="${A.logo}">` : ''}<div class="by">${useLogo ? mlogo(34) : esc(m.agencia || '')}</div><div class="pad"><h1>Planejamento<br>Estratégico</h1><div class="band"><b style="color:#fff">${esc(cli)}</b>${m.tagline ? ` &nbsp;·&nbsp; ${esc(m.tagline)}` : ''}</div>${extra ? `<div class="band" style="font-size:16px;margin-top:10px;opacity:.7">${esc(extra)}</div>` : ''}</div>`, bg).replace(FOOT, ''));
  }

  /* ---------- Diagnóstico ---------- */
  {
    const d = D('diag'), canais = rowsOf(d, 'canais');
    if (canais.length) std('Canais digitais atuais', `Onde ${cli.split(' ')[0]} já está presente`, '', `<div class="grid g2" style="height:auto;gap:16px">${canais.map(c => `<div class="card" style="display:flex;gap:18px;align-items:center;padding:20px 24px"><div class="badge">${esc((c.plataforma || '?')[0])}</div><div><div style="font-weight:700;font-size:23px">${esc(c.plataforma)}</div><div class="mini">${esc([c.handle, c.audiencia].filter(Boolean).join(' · '))}</div></div></div>`).join('')}</div>`);
    const bench = rowsOf(d, 'bench');
    if (bench.length) std('Benchmark de posicionamento', 'Referências de inspiração', txt(d, 'bench_intro'), `<div class="grid g${Math.min(bench.length, 3)}" style="height:300px">${bench.map(b => card(b.nome, b.desc)).join('')}</div>`, { after: txt(d, 'bench_licao') ? bar('', txt(d, 'bench_licao'), 'lt') : '' });
  }

  /* ---------- Marca ---------- */
  {
    const d = D('marca'), tr = rowsOf(d, 'tracos');
    if (tr.length) std('A marca', 'Personalidade do especialista', '', `<div class="grid g3" style="grid-template-rows:1fr 1fr">${tr.slice(0, 6).map((t, i) => `<div class="card${i % 3 == 1 ? ' dkc' : ''}"><span class="tag${i % 2 ? ' ac' : ''}">${esc(t.nome)}</span><p>${nl(t.desc)}</p></div>`).join('')}</div>`);
    const va = rowsOf(d, 'valores');
    chunk(va, 3).forEach((g, i, all) => std('A base inegociável', all.length > 1 ? `Valores fundamentais (${i + 1}/${all.length})` : 'Valores fundamentais', '', `<div class="grid g3" style="height:380px">${g.map((v, j) => `<div class="card${j == 1 ? ' dkc' : ''}"><div class="num" style="margin-bottom:16px">0${i * 3 + j + 1}</div><h3>${esc(v.titulo)}</h3><p class="q">${nl(v.citacao)}</p></div>`).join('')}</div>`));
  }
  {
    const d = D('expertise');
    if (txt(d, 'especialidade') || rowsOf(d, 'credenciais').length) {
      const cr = rowsOf(d, 'credenciais');
      std('O diferencial incopiável', 'Expertise única', '', `<div class="grid" style="grid-template-columns:1.1fr 1fr;height:100%"><div class="card dkc" style="display:flex;flex-direction:column;justify-content:center"><div class="sm">Especialidade principal</div><p style="font-size:24px;color:#fff;line-height:1.5">${nl(txt(d, 'especialidade'))}</p>${txt(d, 'diferencial') ? `<p style="margin-top:22px;font-size:20px">${nl(txt(d, 'diferencial'))}</p>` : ''}</div><div class="fit" style="justify-content:space-between">${cr.slice(0, 4).map(c => `<div class="card" style="flex:1;padding:18px 24px"><h3 style="font-size:24px;margin-bottom:4px">${esc(c.titulo)}</h3><p style="font-size:18px">${nl(c.desc)}</p></div>`).join('')}</div></div>`);
    }
    if (txt(d, 'arq_texto')) {
      const left = A.foto2 ? `<div style="position:absolute;left:0;top:0;bottom:0;width:560px;background:url('${A.foto2}') center/cover"></div>` : '';
      out.push(sec('dk', `${left}<div style="position:absolute;left:${A.foto2 ? 560 : 0}px;right:0;top:0;bottom:0;padding:0 100px;display:flex;flex-direction:column;justify-content:center;background:${A.foto2 ? 'color-mix(in srgb,var(--dark) 88%,transparent)' : 'none'}"><div class="eb">Arquétipo dominante</div><h2 style="font-size:54px">${esc(txt(d, 'arq_nome'))}</h2><p class="serif" style="font-style:italic;color:var(--accent);font-size:28px;margin:8px 0 24px;font-weight:500">${esc(txt(d, 'arq_sub'))}</p><p style="font-size:21px;color:rgba(255,255,255,.82);line-height:1.6">${nl(txt(d, 'arq_texto'))}</p></div>`));
    }
  }
  {
    const d = D('origem'), et = rowsOf(d, 'etapas');
    if (et.length) std('A travessia', txt(d, 'orig_titulo') || 'História de origem', '', `<div class="tl">${et.slice(0, 5).map((e, i) => `<div class="it"><div class="dot">${i + 1}</div><h3>${esc(e.titulo)}</h3><p>${nl(e.texto)}</p></div>`).join('')}</div>`);
    if (txt(d, 'licao')) dkq('Movimento · A lição transformadora', txt(d, 'licao'), txt(d, 'licao_autor') || cli);
  }

  /* ---------- Movimento ---------- */
  {
    const d = D('movimento');
    if (txt(d, 'inimigo_nome')) {
      const danos = listOf(d, 'danos');
      std('O que combatemos', 'O inimigo comum', '', `<div class="grid" style="grid-template-columns:1fr 1fr;height:360px"><div class="card dkc"><h3 style="font-size:30px">${esc(txt(d, 'inimigo_nome'))}</h3><p style="font-size:20px">${nl(txt(d, 'inimigo_desc'))}</p></div><div class="card"><div class="sm">Por que isso prejudica as pessoas</div>${ul(danos, 'x')}</div></div>`, { after: txt(d, 'missao') ? bar('', txt(d, 'missao')) : '' });
    }
    chunk(rowsOf(d, 'crencas'), 4).forEach((g, i, all) => std('Da crença limitante à virada de chave', all.length > 1 ? `Quebrando crenças (${i + 1}/${all.length})` : 'Quebrando crenças', '', `<div class="fit" style="gap:14px">${g.map(c => `<div style="display:grid;grid-template-columns:1fr 54px 1fr;gap:0;align-items:stretch"><div class="card" style="background:#f4f4f8;padding:18px 24px"><p style="font-style:italic;color:#6b6e8a">${nl(c.crenca)}</p></div><div style="display:flex;align-items:center;justify-content:center;color:var(--brand);font-size:30px;font-weight:700">→</div><div class="card dkc" style="padding:18px 24px"><p>${nl(c.virada)}</p></div></div>`).join('')}</div>`));
    chunk(rowsOf(d, 'mantras'), 6).forEach((g, i, all) => std('Frases que carregam a filosofia', all.length > 1 ? `Mantras do movimento (${i + 1}/${all.length})` : 'Mantras do movimento', '', `<div class="grid g2" style="grid-template-rows:repeat(3,1fr);gap:16px">${g.map(x => `<div class="card" style="padding:20px 26px;display:flex;flex-direction:column;justify-content:center"><h3 style="font-size:27px;margin-bottom:4px">${esc(x.frase)}</h3><p style="font-size:18px">${nl(x.nota)}</p></div>`).join('')}</div>`));
  }

  /* ---------- Mercado ---------- */
  {
    const d = D('mercado');
    if (txt(d, 'mercado_titulo') || txt(d, 'mercado_sub')) divider('Análise de mercado', txt(d, 'mercado_titulo') || 'Análise de mercado', txt(d, 'mercado_sub'));
    const tss = rowsOf(d, 'tss');
    if (tss.length) std('Entendendo o potencial', tss.map(x => x.sigla).filter(Boolean).join(' · ') || 'TAM · SAM · SOM', '', `<div class="grid g3" style="height:400px">${tss.slice(0, 3).map((x, i) => `<div class="card ${['dkc', 'dkc', 'mid'][i]}" style="display:flex;flex-direction:column"><div class="sm">${esc(x.sigla)}</div><div class="big" style="margin:6px 0 4px">${esc(x.valor)}</div><div class="d" style="margin-bottom:22px">${esc(x.sufixo)}</div><p style="font-size:18px">${nl(x.desc)}</p></div>`).join('')}</div>${txt(d, 'tss_nota') ? `<p class="mini" style="margin-top:16px;font-style:italic">${nl(txt(d, 'tss_nota'))}</p>` : ''}`);
    const nu = rowsOf(d, 'numeros');
    if (nu.length) std('O contexto que sustenta a demanda', 'O mercado em números', '', `<div class="grid g3" style="height:340px">${nu.slice(0, 3).map((x, i) => `<div class="card${i == 1 ? ' dkc' : ''}"><div class="big" style="color:${i == 1 ? '#fff' : 'var(--brand)'}">${esc(x.valor)}</div><h3 style="margin-top:14px;font-size:24px">${esc(x.titulo)}</h3><p>${nl(x.desc)}</p></div>`).join('')}</div>`, { after: txt(d, 'insight') ? bar('', txt(d, 'insight')) : '' });
    const q = rowsOf(d, 'quant');
    if (q.length) std('Profissionais do nicho no Brasil', 'Público-alvo quantificado', '', `<div class="grid ${q.length > 6 ? "g3" : "g2"}" style="height:auto;gap:14px">${q.map(x => `<div class="kv"><div class="k">${esc(x.label)}</div><div class="v">${nl(x.valor)}</div></div>`).join('')}</div>`);
    const op = rowsOf(d, 'oport');
    if (op.length) std('Submercados quentes e pouco ocupados', 'Oportunidades emergentes', '', `<div class="grid g2 rows2">${op.slice(0, 4).map((x, i) => card(x.titulo, x.desc, i == 0 || i == 3 ? '' : 'dkc')).join('')}</div>`);
    const cen = lines(txt(d, 'cenario')), hz = rowsOf(d, 'horizontes');
    if (cen.length || hz.length) std('Previsão de evolução — 5 anos', 'Para onde o mercado vai', '', `<div class="grid" style="grid-template-columns:1fr 1fr;height:100%"><div class="card"><div class="sm">O cenário até 2030</div>${ul(cen)}</div><div class="hz">${hz.slice(0, 3).map((h, i) => `<div class="h"><div class="badge" style="background:var(--brand);color:#fff">${i + 1}</div><div><h3 style="font-size:23px;margin-bottom:4px">${esc(h.titulo)}</h3><p style="font-size:18px;color:var(--muted)">${nl(h.desc)}</p></div></div>`).join('')}</div></div>`);
  }

  /* ---------- Concorrência ---------- */
  {
    const d = D('conc'), cc = rowsOf(d, 'concorrentes');
    if (cc.length) divider('Análise de concorrência', 'Os gigantes do nicho', txt(d, 'conc_intro'));
    cc.forEach(c => std('Pontos fortes e fracos', c.nome, c.sub + (c.precos ? '  ·  ' + c.precos : ''), `<div class="grid g2" style="height:100%"><div class="card"><div class="sm">Fortes</div>${ul(lines(c.fortes))}</div><div class="card"><div class="sm" style="color:#d9506a">Fracos / gaps</div>${ul(lines(c.fracos), 'x')}</div></div>`, { bottom: 150, after: c.oport ? bar('Oportunidade', c.oport) : '' }));
    const g = rowsOf(d, 'gaps');
    if (g.length) std('O que ninguém entrega', `Os ${g.length} gaps críticos do mercado`, '', `<div class="fit" style="gap:12px">${g.map((x, i) => `<div class="card" style="display:flex;gap:22px;align-items:center;padding:14px 26px"><div class="num" style="font-size:38px;width:44px">${i + 1}</div><div><h3 style="font-size:22px;margin:0 0 2px">${esc(x.titulo)}</h3><p style="font-size:17px">${nl(x.desc)}</p></div></div>`).join('')}</div>`);
    if (txt(d, 'branco')) out.push(sec('dk', `<div class="center"><div class="eb">A oportunidade única</div><h2 style="font-size:30px;margin-bottom:26px">O espaço em branco do mercado</h2><div class="quote" style="font-size:40px">${nl(txt(d, 'branco'))}</div>${txt(d, 'branco_nota') ? `<p class="lead" style="margin-top:34px;font-size:21px">${nl(txt(d, 'branco_nota'))}</p>` : ''}</div>`));
  }

  /* ---------- Público ---------- */
  {
    const d = D('publico');
    if (txt(d, 'publico_resumo')) divider('Público-alvo base', 'Quem é o público', txt(d, 'publico_resumo'));
    const de = rowsOf(d, 'demo');
    if (de.length) std('Quem é o público', 'Perfil demográfico', '', `<div class="grid g3 rows2" style="gap:18px">${de.slice(0, 6).map(x => `<div class="kv" style="display:flex;flex-direction:column;justify-content:center"><div class="k">${esc(x.label)}</div><div class="v">${nl(x.valor)}</div></div>`).join('')}</div>`);
    const dr = rowsOf(d, 'dores');
    if (dr.length) std('O que tira o sono do público', 'As principais dores', '', `<div class="grid g2 rows2">${dr.slice(0, 4).map((x, i) => card(x.titulo, x.desc, i == 1 || i == 2 ? 'dkc' : '')).join('')}</div>`);
    const sg = rowsOf(d, 'segmentos');
    if (sg.length) std('3 grupos distintos', 'Segmentação', '', `<div class="grid g3">${sg.slice(0, 3).map((x, i) => `<div class="card${i == 0 ? ' dkc' : ''}">${x.tag ? `<span class="tag${i ? ' ac' : ''}">${esc(x.tag)}</span>` : ''}<h3>${esc(x.nome)}</h3><p>${nl(x.desc)}</p>${x.tamanho ? `<p style="margin-top:16px"><b style="color:var(--accent)">Tamanho:</b> ${esc(x.tamanho)}</p>` : ''}</div>`).join('')}</div>`);
  }

  /* ---------- Esteira ---------- */
  {
    const d = D('esteira'), pr = rowsOf(d, 'promessas');
    if (pr.length) std('3 caminhos de promessa central', 'Possíveis promessas', '', `<div class="grid g3" style="height:350px">${pr.slice(0, 3).map((x, i) => card(x.titulo, x.frase, i == 1 ? 'dkc' : '')).join('')}</div>`, { after: txt(d, 'promessa_rec') ? bar('', txt(d, 'promessa_rec')) : '' });
    const es = rowsOf(d, 'estagios');
    if (es.length) std('Arquitetura financeira da esteira', 'Esteira de produtos', '', `<div class="grid g4" style="height:340px">${es.slice(0, 4).map((x, i) => `<div class="card${i == 3 ? ' dkc' : ''}" style="display:flex;flex-direction:column"><div class="num" style="font-size:34px;margin-bottom:12px">0${i + 1}</div><h3 style="font-size:24px">${esc(x.nome)}</h3><p style="flex:1;font-size:17px">${nl(x.desc)}</p><div class="serif" style="font-size:28px;font-weight:700;color:${i == 3 ? '#fff' : 'var(--brand)'};margin-top:12px">${esc(x.preco)}</div></div>`).join('')}</div>`, { after: txt(d, 'motor') ? bar('', txt(d, 'motor')) : '' });
    if (txt(d, 'isca_nome')) {
      const ent = listOf(d, 'isca_entregaveis').length ? listOf(d, 'isca_entregaveis') : lines(txt(d, 'isca_entregaveis'));
      std('Produto 1 · Isca digital (gratuito)', txt(d, 'isca_nome'), '', `<div class="grid" style="grid-template-columns:1fr 1fr;height:100%"><div class="card dkc" style="display:flex;flex-direction:column;justify-content:center"><div class="sm">Promessa</div><p style="font-size:23px;color:#fff;margin-bottom:22px">${nl(txt(d, 'isca_promessa'))}</p><div class="sm">Formato</div><p>${nl(txt(d, 'isca_formato'))}</p></div><div class="card"><div class="sm">Entregáveis</div>${ul(ent)}</div></div>`, { bottom: txt(d, 'isca_avatar') ? 150 : 74, after: txt(d, 'isca_avatar') ? bar('Avatar', txt(d, 'isca_avatar'), 'lt') : '' });
    }
  }

  /* ---------- Posicionamento ---------- */
  {
    const d = D('posic'), pl = rowsOf(d, 'plataformas');
    if (pl.length) divider('Posicionamento para redes sociais', 'Onde a autoridade mora', txt(d, 'posic_intro'));
    pl.forEach(p => std(p.papel || 'Plataforma', p.nome, '', `<div class="grid" style="grid-template-columns:1fr 1.15fr;height:100%"><div class="card dkc" style="display:flex;flex-direction:column;justify-content:center"><div class="sm">Objetivo</div><p style="margin-bottom:26px;font-size:20px">${nl(p.objetivo)}</p><div class="sm">Tom de voz</div><p style="font-size:20px">${nl(p.tom)}</p></div><div class="card" style="display:flex;flex-direction:column;justify-content:center"><div class="sm">Tipos de conteúdo</div>${ul(lines(p.tipos))}${p.freq ? `<p style="margin-top:22px;font-weight:700;color:var(--brand)">Frequência: ${esc(p.freq)}</p>` : ''}</div></div>`));
    const sp = rowsOf(d, 'site_pag');
    if (sp.length) std('Hub central de credibilidade', 'Site', txt(d, 'site_obj'), `<div class="grid g${Math.min(sp.length, 4)}" style="height:300px">${sp.slice(0, 4).map((x, i) => card(x.nome, x.desc, i % 2 ? 'dkc' : '')).join('')}</div>`);
    if (txt(d, 'bio_linhas')) std('Marca pessoal forte', 'Sugestão de perfil e bio', '', `<div class="grid" style="grid-template-columns:1fr 1fr;height:100%;align-items:center"><div class="phone"><div class="av" ${A.foto2 ? `style="background-image:url('${A.foto2}')"` : ''}></div><div class="nm">${esc(txt(d, 'bio_handle'))}</div><div class="hd">${nl(txt(d, 'bio_linhas'))}</div></div><div class="card"><div class="sm">Por quê</div><p style="font-size:21px">${nl(txt(d, 'bio_porque'))}</p></div></div>`);
    const lk = rowsOf(d, 'links');
    if (lk.length) std('Conversão a partir da bio', 'Estrutura de links estratégica', '', `<div class="fit" style="gap:12px">${lk.slice(0, 7).map((x, i) => `<div class="card" style="display:flex;gap:22px;align-items:center;padding:14px 26px"><div class="num" style="font-size:34px;width:40px">${i + 1}</div><div><h3 style="font-size:22px;margin:0">${esc(x.titulo)}</h3><p style="font-size:17px">${nl(x.destino)}</p></div></div>`).join('')}</div>`, { after: txt(d, 'links_nota') ? `<p class="mini" style="position:absolute;left:84px;bottom:50px;font-style:italic">${nl(txt(d, 'links_nota'))}</p>` : '' });
  }

  /* ---------- Conteúdo ---------- */
  {
    const d = D('conteudo'), ti = rowsOf(d, 'tipos');
    if (ti.length) std('O ciclo de conteúdo que se repete', 'Estrutura de postagens', '', `<div class="grid g4" style="height:340px">${ti.slice(0, 4).map((x, i) => `<div class="card${i % 2 ? '' : ' dkc'}"><div class="num" style="font-size:40px;margin-bottom:12px">${i + 1}</div><h3 style="font-size:23px;text-transform:uppercase;letter-spacing:.06em">${esc(x.nome)}</h3><p style="font-size:17px">${nl(x.desc)}</p></div>`).join('')}</div>`, { after: txt(d, 'freq_nota') ? bar('Frequências sugeridas:', txt(d, 'freq_nota') + (txt(d, 'capacidade') ? '. Capacidade do cliente: ' + txt(d, 'capacidade') : '') + ' — a sequência se repete indefinidamente.', 'lt') : '' });
    if (txt(d, 'vmc_v') || txt(d, 'vmc_m') || txt(d, 'vmc_c')) std('A estratégia que estrutura tudo', 'O método VMC', 'Virtude, Movimento e Conversão: a estratégia que transforma especialistas em líderes de movimento através de três pilares.', `<div class="grid g3" style="height:300px">${[['Virtude', 'vmc_v'], ['Movimento', 'vmc_m'], ['Conversão', 'vmc_c']].map(([n, k], i) => card(n, txt(d, k), i == 1 ? 'dkc' : '')).join('')}</div>`);
    const ca = rowsOf(d, 'camadas');
    if (ca.length) std('O papel de cada conteúdo no funil', 'As três camadas de conteúdo', '', `<div class="grid g3" style="height:400px">${ca.slice(0, 3).map((x, i) => `<div class="card${i == 1 ? ' dkc' : ''}"><div class="sm">Camada ${i + 1}</div><h3 style="font-size:28px">${esc(x.nome)}</h3><p style="font-style:italic;margin-bottom:14px;color:${i == 1 ? 'var(--accent)' : 'var(--brand)'}">${esc(x.frase)}</p><p>${nl(x.desc)}</p><p style="margin-top:16px;font-weight:700;color:var(--accent)">${esc(x.usa)}</p></div>`).join('')}</div>`);
    ti.forEach((x, i) => std(`Tipos de conteúdo · ${['T', 'A', 'C', 'O'][i] || '+'}`, x.nome, x.desc, `<div class="grid" style="grid-template-columns:1fr;height:100%">${x.exemplos ? `<div class="card"><div class="sm">Exemplos de conteúdo</div>${ul(lines(x.exemplos))}</div>` : ''}</div>`, { bottom: x.formula ? 150 : 74, after: x.formula ? bar('Fórmula', x.formula) : '' }));
    const sd = rowsOf(d, 'stories_dias');
    if (sd.length) std('Proximidade sem sobrecarregar', 'Estratégia de stories', `${txt(d, 'stories_qtd') ? txt(d, 'stories_qtd') + ' stories por dia. ' : ''}${txt(d, 'stories_nota')}`, `<div class="grid g3 rows2" style="gap:16px">${sd.slice(0, 6).map(x => `<div class="kv" style="display:flex;flex-direction:column;justify-content:center"><div class="k">${esc(x.dia)}</div><div class="v" style="font-size:20px">${nl(x.acao)}</div></div>`).join('')}</div>`);
    const re = rowsOf(d, 'recursos');
    if (re.length) std('Ativos que reforçam a autoridade', 'Recursos do movimento', '', `<div class="grid g3 rows2" style="gap:18px">${re.slice(0, 6).map((x, i) => card(x.titulo, x.desc, i % 2 ? 'dkc' : '')).join('')}</div>`);
    const po = rowsOf(d, 'posts');
    chunk(po, 7).forEach((g, i, all) => std('Primeiras 2 semanas de conteúdo', all.length > 1 ? `Ideias de postagem (${i + 1}/${all.length})` : 'Ideias de postagem', '', `<table class="tb"><tr><th style="width:110px">Semana</th><th style="width:130px">Tema</th><th style="width:330px">Título</th><th>Desenvolvimento</th></tr>${g.map(x => `<tr><td>${esc(x.semana)}</td><td>${esc(x.tema)}</td><td>${nl(x.titulo)}</td><td style="font-size:17px;color:var(--muted)">${nl(x.dev)}</td></tr>`).join('')}</table>`));
  }

  /* ---------- Esteira completa ---------- */
  {
    const d = D('esteira'), tb = rowsOf(d, 'tabela'); curBlk = 'esteira2';
    if (tb.length) std('Do gratuito ao B2B', 'Esteira de produtos completa', '', `<table class="tb"><tr><th>Produto</th><th>Ticket</th><th>Público</th><th>Objetivo</th></tr>${tb.map(x => `<tr><td>${esc(x.produto)}</td><td>${esc(x.ticket)}</td><td>${esc(x.publico)}</td><td>${esc(x.objetivo)}</td></tr>`).join('')}</table>`, { after: txt(d, 'tabela_nota') ? `<p class="mini" style="position:absolute;left:84px;right:84px;bottom:50px;font-style:italic">${nl(txt(d, 'tabela_nota'))}</p>` : '' });
  }

  /* ---------- Plano ---------- */
  {
    const d = D('plano'), fa = rowsOf(d, 'fases');
    if (fa.length) divider('Plano de ação', 'Da validação à escala', txt(d, 'plano_intro'));
    fa.forEach(f => std(f.rotulo || 'Fase', f.nome, '', `<div class="grid" style="grid-template-columns:1fr 1.2fr;height:100%"><div style="display:flex;flex-direction:column;gap:22px"><div class="card dkc" style="flex:1"><div class="sm">Foco da fase</div><p style="font-size:21px">${nl(f.foco)}</p></div><div class="card" style="flex:1"><div class="sm">Resultado esperado</div><p style="font-size:21px;color:var(--ink)">${nl(f.resultado)}</p></div></div><div class="card"><div class="sm">Ações-chave</div>${ul(lines(f.acoes))}</div></div>`));
    chunk(rowsOf(d, 'cron90'), 6).forEach((g, i, all) => std('Cronograma executivo', all.length > 1 ? `Os primeiros 90 dias (${i + 1}/${all.length})` : 'Os primeiros 90 dias', '', tbl(['Período', 'Ação', 'Responsável'], g.map(x => [x.periodo, x.acao, x.resp]), [200, 0, 230])));
    const fu = rowsOf(d, 'funil');
    if (fu.length) std('Da descoberta à venda', 'Funil de vendas', '', `<div class="flow" style="height:340px">${fu.slice(0, 5).map((x, i) => `<div class="st"><div class="num">${i + 1}</div><h3>${esc(x.nome)}</h3><p>${nl(x.desc)}</p></div>`).join('')}</div>`);
    const qw = listOf(d, 'quick'), kp = rowsOf(d, 'kpis');
    if (qw.length || kp.length) std('Primeiros 30 dias e acompanhamento', 'Quick wins & KPIs', '', `<div class="grid" style="grid-template-columns:${qw.length && kp.length ? '1fr 1.2fr' : '1fr'};height:100%">${qw.length ? `<div class="card dkc"><div class="sm">Quick wins</div>${ul(qw)}</div>` : ''}${kp.length ? `<div><table class="tb"><tr><th>Indicador</th><th>Meta</th><th>Acompanhar</th></tr>${kp.map(x => `<tr><td>${esc(x.indicador)}</td><td>${esc(x.meta)}</td><td>${esc(x.freq)}</td></tr>`).join('')}</table></div>` : ''}</div>`);
  }


  /* ---------- Resumo executivo ---------- */
  {
    const d = D('resumo'), pil = rowsOf(d, 'pilares'), met = rowsOf(d, 'metas');
    if (txt(d, 'partida') || txt(d, 'chegada')) std('Resumo executivo', 'Do ponto de partida ao ponto de chegada', '', `<div class="grid" style="grid-template-columns:1fr 70px 1fr;height:${pil.length ? 220 : 340}px;gap:0"><div class="card"><div class="sm">Onde estamos</div><p style="color:var(--ink)">${nl(txt(d, 'partida'))}</p></div><div style="display:flex;align-items:center;justify-content:center;font-size:40px;color:var(--brand)">→</div><div class="card dkc"><div class="sm">Onde queremos chegar</div><p>${nl(txt(d, 'chegada'))}</p></div></div>${pil.length ? `<div class="grid g${Math.min(pil.length, 3)}" style="height:250px;margin-top:24px">${pil.slice(0, 3).map((x, i) => card(x.titulo, x.desc, i == 1 ? 'dkc' : '')).join('')}</div>` : ''}`);
    if (met.length) std('Resumo executivo', 'As metas do planejamento', '', `<div class="grid g${Math.min(met.length, 3)}" style="height:380px">${met.slice(0, 3).map((x, i) => `<div class="card ${['dkc', 'dkc', 'mid'][i]}" style="display:flex;flex-direction:column;justify-content:center"><div class="big" style="font-size:54px;margin-bottom:14px">${esc(x.valor)}</div><p>${nl(x.label)}</p></div>`).join('')}</div>`);
    const sw = [['Forças', 'swot_f'], ['Fraquezas', 'swot_fr'], ['Oportunidades', 'swot_o'], ['Ameaças', 'swot_a']].map(([t, k]) => [t, listOf(d, k)]);
    if (sw.some(x => x[1].length)) std('Análise estratégica', 'Matriz SWOT', '', `<div class="swot">${sw.map(([t, l], i) => `<div class="card${i == 1 || i == 2 ? ' dkc' : ''}"><div class="sm">${t}</div>${ul(l, i == 1 || i == 3 ? 'x' : '')}</div>`).join('')}</div>`);
  }

  /* ---------- Briefing ---------- */
  {
    const d = D('briefing'), kv = [['Nicho', 'nicho'], ['Para quem fala', 'avatar'], ['Momento atual', 'momento'], ['Objetivo em 12 meses', 'objetivo12'], ['Faturamento / ticket', 'faturamento']].filter(([, k]) => txt(d, k)), des = listOf(d, 'desafios');
    if (kv.length || des.length) std('Diagnóstico inicial', 'O ponto de partida', '', `<div class="grid" style="grid-template-columns:${des.length ? '1.4fr 1fr' : '1fr'};height:100%"><div class="fit" style="gap:12px">${kv.map(([l, k]) => `<div class="kv" style="padding:14px 24px"><div class="k">${l}</div><div class="v" style="font-size:19px">${nl(txt(d, k))}</div></div>`).join('')}</div>${des.length ? `<div class="card dkc"><div class="sm">Principais desafios</div>${ul(des)}</div>` : ''}</div>`);
  }

  /* ---------- Autoridade em números ---------- */
  {
    const d = D('expertise'), pv = rowsOf(d, 'provas');
    if (pv.length) std('Prova de autoridade', 'Autoridade em números', '', `<div class="grid g${Math.min(pv.length, 4)}" style="height:340px">${pv.slice(0, 4).map((x, i) => `<div class="card${i % 2 ? '' : ' dkc'}" style="display:flex;flex-direction:column;justify-content:center"><div class="big" style="font-size:58px;margin-bottom:14px;color:${i % 2 ? 'var(--brand)' : '#fff'}">${esc(x.valor)}</div><p>${nl(x.label)}</p></div>`).join('')}</div>`);
  }

  /* ---------- Lançamento ---------- */
  {
    const d = D('lancamento'), cr = rowsOf(d, 'lanc_cron'), em = rowsOf(d, 'emails');
    if (cr.length) divider('Canais & lançamento', txt(d, 'lanc_produto') ? `Lançamento: ${txt(d, 'lanc_produto')}` : 'Planejamento de lançamento', txt(d, 'lanc_intro'));
    chunk(cr, 6).forEach((g, i, all) => std('Cronograma de lançamento', all.length > 1 ? `Linha do tempo (${i + 1}/${all.length})` : 'Linha do tempo do lançamento', '', tbl(['Quando', 'Ação', 'Responsável'], g.map(x => [x.quando, x.acao, x.resp]), [180, 0, 240])));
    chunk(em, 6).forEach((g, i, all) => std('E-mail marketing', all.length > 1 ? `Sequência de e-mails (${i + 1}/${all.length})` : 'Sequência de e-mails', '', tbl(['Dia', 'Assunto', 'Objetivo'], g.map(x => [x.dia, x.assunto, x.objetivo]), [150, 0, 420])));
  }

  /* ---------- Projeções ---------- */
  {
    const d = D('projecoes'), pj = rowsOf(d, 'proj'), pr = listOf(d, 'premissas'), roi = rowsOf(d, 'roi');
    if (pj.length) {
      const vals = pj.map(x => parseNum(x.fat)), mx = Math.max(...vals, 1);
      std('Projeções financeiras', 'Projeção de faturamento · 12 meses', '', `<div class="grid" style="grid-template-columns:1.1fr 1fr;height:100%"><div class="card" style="padding:26px 30px 20px"><div class="chart" style="height:360px">${pj.slice(0, 12).map((x, i) => `<div class="col"><div class="vl" style="font-size:${pj.length > 6 ? 14 : 20}px">${esc(x.fat)}</div><div class="barv" style="height:${Math.max(8, Math.round(vals[i] / mx * 270))}px"></div><div class="pl">${esc(x.periodo)}</div></div>`).join('')}</div></div><div>${tbl(['Período', 'Leads', 'Vendas', 'Faturamento'], pj.slice(0, 8).map(x => [x.periodo, x.leads, x.vendas, x.fat]))}${txt(d, 'proj_nota') ? `<p class="mini" style="margin-top:8px;font-style:italic">${nl(txt(d, 'proj_nota'))}</p>` : ''}</div></div>`);
    }
    if (pr.length || roi.length) std('Premissas e retorno', roi.length ? 'Premissas & ROI por canal' : 'Premissas da projeção', '', `<div class="grid" style="grid-template-columns:${pr.length && roi.length ? '1fr 1.5fr' : '1fr'};height:100%">${pr.length ? `<div class="card dkc"><div class="sm">Premissas</div>${ul(pr)}</div>` : ''}${roi.length ? `<div>${tbl(['Canal', 'Investimento', 'Retorno', 'ROI'], roi.map(x => [x.canal, x.invest, x.retorno, x.roi]))}</div>` : ''}</div>`);
  }

  /* ---------- Proposta ---------- */
  {
    const d = D('proposta'), es = rowsOf(d, 'escopo'), op = rowsOf(d, 'opcoes'), im = rowsOf(d, 'impl'), ps = listOf(d, 'passos');
    if (es.length) divider('Proposta de implementação', 'Como vamos executar juntos', '');
    if (es.length) std('Escopo', 'O que está incluído', '', `<div class="grid g${es.length > 4 ? 3 : 2} rows2">${es.slice(0, 6).map((x, i) => card(x.titulo, x.desc, i % 3 == 1 ? 'dkc' : '')).join('')}</div>`);
    if (op.length) std('Investimento', 'Investimento & condições', '', `<div class="grid g${Math.min(op.length, 3)}" style="height:${txt(d, 'condicoes') ? 340 : 400}px">${op.slice(0, 3).map((x, i) => `<div class="card${i == 0 ? ' dkc' : ''}"><div class="sm">${esc(x.nome)}</div><div class="big" style="font-size:50px;margin:6px 0 16px;color:${i == 0 ? '#fff' : 'var(--brand)'}">${esc(x.valor)}</div><p>${nl(x.inclui)}</p></div>`).join('')}</div>`, { after: txt(d, 'condicoes') ? bar('Condições', txt(d, 'condicoes'), 'lt') : '' });
    if (im.length) std('Cronograma de implementação', 'Da aprovação à execução', '', `<div class="tl">${im.slice(0, 5).map((e, i) => `<div class="it"><div class="dot">${i + 1}</div><h3>${esc(e.fase)}</h3><p style="font-weight:700;color:var(--brand);margin-bottom:8px">${esc(e.prazo)}</p><p>${nl(e.entregas)}</p></div>`).join('')}</div>`);
    if (ps.length) out.push(sec('dk', `<div class="center"><div class="eb">Próximos passos</div><h2 style="font-size:54px;margin-bottom:34px">Vamos começar</h2>${ul(ps)}</div>`));
  }

  /* ---------- Manifesto ---------- */
  {
    const d = D('movimento'); curBlk = 'manifesto'; const ps = String(d.manifesto || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
    const groups = []; let cur = [], len = 0;
    ps.forEach(p => { if (cur.length && (len + p.length > 560 || cur.length >= 5)) { groups.push(cur); cur = []; len = 0; } cur.push(p); len += p.length; });
    if (cur.length) groups.push(cur);
    groups.forEach(g => out.push(sec('dk', `<div class="center" style="gap:22px"><div class="eb">Manifesto</div>${g.map(p => `<p class="serif" style="font-size:30px;line-height:1.38;font-weight:600;color:#fff">${nl(p)}</p>`).join('')}</div>`)));
    const f = txt(D('plano'), 'fechamento'); curBlk = 'closing';
    out.push(sec('dk', `<div class="center" style="align-items:center;text-align:center">${A.logo ? `<img src="${A.logo}" style="height:90px;margin-bottom:30px;object-fit:contain">` : ''}<h2 style="font-size:70px">${esc(cli)}</h2>${f ? `<p class="serif" style="font-size:28px;color:var(--accent);margin-top:20px;font-weight:500">${nl(f)}</p>` : ''}<div style="margin-top:44px;display:flex;flex-direction:column;align-items:center;gap:14px">${useLogo ? mlogo(36) : `<p class="lead" style="margin:0;font-size:17px;letter-spacing:.2em;text-transform:uppercase">${esc(m.agencia || '')}</p>`}${m.ano ? `<span style="font-size:15px;letter-spacing:.24em;color:rgba(255,255,255,.6)">${esc(m.ano)}</span>` : ''}</div></div>`));
  }

  const ORD = ['cover', 'agenda', 'resumo', 'briefing', 'diag', 'marca', 'expertise', 'origem', 'movimento', 'mercado', 'conc', 'publico', 'esteira', 'posic', 'conteudo', 'esteira2', 'lancamento', 'projecoes', 'plano', 'proposta', 'manifesto', 'closing'];
  const labels = [['Diagnóstico inicial', ['briefing', 'diag']], ['Marca e história de origem', ['marca', 'expertise', 'origem']], ['Movimento: inimigo, crenças e mantras', ['movimento']], ['Mercado e concorrência', ['mercado', 'conc']], ['Público e personas', ['publico']], ['Esteira de produtos', ['esteira', 'esteira2']], ['Posicionamento e canais', ['posic']], ['Estratégia de conteúdo', ['conteudo']], ['Lançamento e e-mail', ['lancamento']], ['Projeções e ROI', ['projecoes']], ['Plano de ação', ['plano']], ['Proposta de implementação', ['proposta']]];
  const present = new Set(items.map(x => x.b)), ag = labels.filter(([, bs]) => bs.some(b => present.has(b)));
  if (ag.length >= 3) { curBlk = 'agenda'; out.push(sec('', `<div class="pad"><div class="eb">Roteiro da apresentação</div><h2>O que vamos ver</h2></div><div class="body"><div class="agenda">${ag.map(([t], i) => `<div class="it"><div class="n">${String(i + 1).padStart(2, '0')}</div><div class="t">${esc(t)}</div></div>`).join('')}</div></div>`)); }
  const ix = b => { const i = ORD.indexOf(b); return i < 0 ? 99 : i; };
  const sorted = items.map((it, i) => ({ ...it, i })).sort((a, b) => ix(a.b) - ix(b.b) || a.i - b.i);
  const base = A.idv ? A.idv.length : 0, noteOf = b => { const id = b === 'esteira2' ? 'esteira' : b === 'manifesto' ? 'movimento' : b; return off.includes(id) ? '' : String((P.data[id] || {}).notas || '').trim(); };
  const res = sorted.map((it, i) => it.h.replace('%N%', i + 1 + base));
  res.notes = sorted.map(it => noteOf(it.b));
  res.blocks = sorted.map(it => it.b);
  return res;
}

// slides de IDV (imagens renderizadas do PDF/imagens enviadas)
function idvSlides(A, excl = []) {
  return (A.idv || []).map((src, i) => excl.includes(i) ? null : `<section class="slide idv" style="background:#000"><img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"></section>`).filter(Boolean);
}
