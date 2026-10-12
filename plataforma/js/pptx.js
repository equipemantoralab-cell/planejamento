/* Exportador PPTX editável: converte o layout real de cada slide (DOM 1440x810) em
   caixas de texto, formas e imagens nativas via PptxGenJS. O arquivo abre editável
   no Canva (Criar design > Importar arquivo), PowerPoint e Keynote. */
const PX = v => v / 96;
const _cv = document.createElement('canvas').getContext('2d');
function pcol(str) {
  if (!str || str === 'transparent' || str === 'none') return null;
  _cv.fillStyle = '#000000'; _cv.fillStyle = str;
  const v = _cv.fillStyle;
  if (v[0] === '#') return { hex: v.slice(1).toUpperCase(), a: 1 };
  const cs = v.match(/color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+%?))?\)/);
  if (cs) {
    const to = x => Math.max(0, Math.min(255, Math.round(parseFloat(x) * 255))).toString(16).padStart(2, '0');
    let a = 1; if (cs[4] != null) a = cs[4].endsWith('%') ? parseFloat(cs[4]) / 100 : parseFloat(cs[4]);
    return { hex: (to(cs[1]) + to(cs[2]) + to(cs[3])).toUpperCase(), a };
  }
  const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return null;
  const p = m[1].split(',').map(parseFloat);
  return { hex: [0, 1, 2].map(i => Math.round(p[i]).toString(16).padStart(2, '0')).join('').toUpperCase(), a: p[3] == null ? 1 : p[3] };
}
const mixHex = (a, b, t) => { const A = pcol(a), B = pcol(b), h = i => parseInt(A.hex.substr(i, 2), 16) * t + parseInt(B.hex.substr(i, 2), 16) * (1 - t); return '#' + [0, 2, 4].map(i => Math.round(h(i)).toString(16).padStart(2, '0')).join(''); };
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const b64 = u => u.replace(/^data:/, '');

function drawCover(ctx, img, W, H) { const k = Math.max(W / img.width, H / img.height), w = img.width * k, h = img.height * k; ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h); }

async function slideBackground(root, cs) {
  const brand = cs.getPropertyValue('--brand').trim() || '#2b04b5', dark = cs.getPropertyValue('--dark').trim() || '#000033';
  const W = 1440, H = 810, c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  if (root.classList.contains('photo')) {
    const m = (root.getAttribute('style') || '').match(/--bg:url\('([^']+)'\)/);
    ctx.fillStyle = dark; ctx.fillRect(0, 0, W, H);
    if (m) { try { drawCover(ctx, await loadImg(m[1]), W, H); } catch (e) {} }
    const g = ctx.createLinearGradient(0, 0, W, 0), d = pcol(dark).hex, b = pcol(brand).hex, rgb = h => [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)).join(',');
    g.addColorStop(0, `rgba(${rgb(d)},.94)`); g.addColorStop(.55, `rgba(${rgb(d)},.78)`); g.addColorStop(1, `rgba(${rgb(b)},.38)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    return c.toDataURL('image/jpeg', .88);
  }
  const c0 = mixHex(brand, dark, .55);
  ctx.fillStyle = dark; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(1.2 * W, 0, 0, 1.2 * H, .85 * W, .1 * H);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, c0); g.addColorStop(.62, dark);
  ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2);
  return c.toDataURL('image/jpeg', .9);
}

async function svgToPng(svg, w, h) {
  const clone = svg.cloneNode(true), cc = pcol(getComputedStyle(svg).color);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', w * 3); clone.setAttribute('height', h * 3);
  const str = new XMLSerializer().serializeToString(clone).replace(/currentColor/g, '#' + (cc ? cc.hex : 'FFFFFF'));
  const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str));
  const c = document.createElement('canvas'); c.width = w * 3; c.height = h * 3; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

const INLINE = new Set(['B', 'STRONG', 'I', 'EM', 'SPAN', 'A', 'SMALL', 'BR']);
function isTextContainer(e) {
  const nodes = [...e.childNodes];
  if (!nodes.some(n => n.nodeType === 3 && n.textContent.trim())) return false;
  return nodes.every(n => n.nodeType === 3 || (n.nodeType === 1 && INLINE.has(n.tagName) && getComputedStyle(n).display.startsWith('inline') && !n.querySelector('*:not(br):not(b):not(strong):not(i):not(em):not(span)')));
}

function collectRuns(el, runs, pre) {
  for (const n of el.childNodes) {
    if (n.nodeType === 3) {
      const cs = getComputedStyle(el), keep = /pre/.test(cs.whiteSpace);
      let t = keep ? n.textContent : n.textContent.replace(/\s+/g, ' ');
      if (cs.textTransform === 'uppercase') t = t.toUpperCase();
      if (!t) continue;
      const c = pcol(cs.color) || { hex: '000000', a: 1 };
      const o = { fontFace: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fontSize: Math.round(parseFloat(cs.fontSize) * .75 * 10) / 10, color: c.hex, bold: parseInt(cs.fontWeight) >= 600, italic: cs.fontStyle === 'italic' };
      if (c.a < .98) o.transparency = Math.round((1 - c.a) * 100);
      const ls = parseFloat(cs.letterSpacing); if (ls > 0) o.charSpacing = Math.round(ls * .75 * 10) / 10;
      if (keep && t.includes('\n')) t.split('\n').forEach((part, i, arr) => { runs.push({ text: part, options: { ...o, breakLine: i < arr.length - 1 } }); });
      else runs.push({ text: t, options: o });
    } else if (n.nodeType === 1) {
      if (n.tagName === 'BR') { if (runs.length) runs[runs.length - 1].options.breakLine = true; else runs.push({ text: '', options: { breakLine: true } }); }
      else collectRuns(n, runs);
    }
  }
}

async function exportPptx(slides, notes, opts = {}) {
  if (typeof PptxGenJS === 'undefined') throw new Error('A biblioteca PPTX não carregou. Verifique a conexão com a internet e recarregue.');
  await document.fonts.ready;
  const pptx = new PptxGenJS(); pptx.defineLayout({ name: 'DECK', width: 15, height: 8.4375 }); pptx.layout = 'DECK';
  pptx.title = opts.title || 'Planejamento Estratégico'; pptx.author = opts.author || 'Mantora Lab';
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:1440px;height:810px;z-index:-1;opacity:0;pointer-events:none;overflow:hidden';
  document.body.appendChild(host);
  try {
    for (let si = 0; si < slides.length; si++) {
      if (opts.onProgress) { opts.onProgress(si + 1, slides.length); await new Promise(r => setTimeout(r, 0)); }
      host.innerHTML = slides[si];
      const root = host.firstElementChild; root.style.transform = 'none';
      const rcs = getComputedStyle(root), s = pptx.addSlide();
      if (root.classList.contains('dk') || root.classList.contains('photo')) s.background = { data: b64(await slideBackground(root, rcs)) };
      else { const bc = pcol(rcs.backgroundColor); s.background = { color: bc ? bc.hex : 'FFFFFF' }; }
      await walkSlide(root, s);
      if (notes && notes[si]) s.addNotes(notes[si]);
    }
    if (opts.mode === 'blob') return await pptx.write({ outputType: 'blob' });
    await pptx.writeFile({ fileName: opts.fileName || 'Planejamento_Estrategico.pptx' });
  } finally { host.remove(); }
}

async function walkSlide(root, s) {
  const rr = root.getBoundingClientRect(), R = r => ({ x: r.left - rr.left, y: r.top - rr.top, w: r.width, h: r.height });
  const consumed = new Set();
  const shape = (type, r, c, extra = {}) => s.addShape(type, { x: PX(r.x), y: PX(r.y), w: PX(r.w), h: PX(r.h), fill: { color: c.hex, transparency: Math.round((1 - c.a) * 100) }, line: { type: 'none' }, ...extra });
  for (const e of root.querySelectorAll('*')) {
    if (consumed.has(e)) continue;
    const tag = e.tagName.toLowerCase();
    if (['style', 'script', 'br', 'tbody', 'thead', 'colgroup', 'path'].includes(tag)) continue;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = R(e.getBoundingClientRect());
    if (r.w < .5 || r.h < .5) continue;

    if (tag === 'svg') { try { s.addImage({ data: b64(await svgToPng(e, r.w, r.h)), x: PX(r.x), y: PX(r.y), w: PX(r.w), h: PX(r.h) }); } catch (er) {} e.querySelectorAll('*').forEach(x => consumed.add(x)); continue; }
    if (tag === 'img') {
      const nw = e.naturalWidth || r.w, nh = e.naturalHeight || r.h, fit = cs.objectFit === 'cover' ? Math.max(r.w / nw, r.h / nh) : Math.min(r.w / nw, r.h / nh), w = nw * fit, h = nh * fit;
      if (cs.objectFit === 'cover') { const c = document.createElement('canvas'); c.width = r.w * 2; c.height = r.h * 2; drawCover(c.getContext('2d'), e, c.width, c.height); s.addImage({ data: b64(c.toDataURL('image/jpeg', .9)), x: PX(r.x), y: PX(r.y), w: PX(r.w), h: PX(r.h) }); }
      else s.addImage({ data: b64(e.src), x: PX(r.x + (r.w - w) / 2), y: PX(r.y + (r.h - h) / 2), w: PX(w), h: PX(h) });
      continue;
    }
    if (tag === 'tr') {
      const td = e.querySelector('td'), c = td && pcol(getComputedStyle(td).backgroundColor);
      if (c && c.a > .02) shape('roundRect', r, c, { rectRadius: PX(12) });
      continue;
    }

    /* fundo */
    if (tag !== 'td') {
      const bgi = cs.backgroundImage; let c = pcol(cs.backgroundColor), img = null;
      if (bgi && bgi !== 'none') {
        const um = bgi.match(/url\(["']?([^"')]+)["']?\)/);
        if (um) img = um[1]; else { const gm = bgi.match(/(rgba?\([^)]+\)|color\([^)]+\)|#[0-9a-f]{3,8})/i); if (gm) c = pcol(gm[0]); }
      }
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (img) {
        try { const im = await loadImg(img), cv = document.createElement('canvas'); cv.width = r.w * 2; cv.height = r.h * 2; drawCover(cv.getContext('2d'), im, cv.width, cv.height); s.addImage({ data: b64(cv.toDataURL('image/jpeg', .9)), x: PX(r.x), y: PX(r.y), w: PX(r.w), h: PX(r.h), rounding: rad >= Math.min(r.w, r.h) / 2 - 1 && Math.abs(r.w - r.h) < 2 }); } catch (er) {}
      } else if (c && c.a > .02) {
        const bw = parseFloat(cs.borderTopWidth) || 0, bc = bw && cs.borderTopStyle === 'solid' ? pcol(cs.borderTopColor) : null;
        const lineOpt = bc ? { line: { color: bc.hex, width: bw * .75 } } : {};
        if (cs.clipPath && cs.clipPath !== 'none') shape(e.matches('.flow .st:first-child') ? 'homePlate' : 'chevron', r, c);
        else if (rad >= Math.min(r.w, r.h) / 2 - 1 && Math.abs(r.w - r.h) < 2) shape('ellipse', r, c, lineOpt);
        else if (rad > 0) shape('roundRect', r, c, { rectRadius: PX(Math.min(rad, Math.min(r.w, r.h) / 2)), ...lineOpt });
        else shape('rect', r, c, lineOpt);
      }
      const bb = parseFloat(cs.borderBottomWidth) || 0, bbc = bb && cs.borderBottomStyle === 'solid' && pcol(cs.borderBottomColor);
      if (bbc && bbc.a > .02 && !(parseFloat(cs.borderTopWidth) > 0)) s.addShape('line', { x: PX(r.x), y: PX(r.y + r.h - bb / 2), w: PX(r.w), h: 0, line: { color: bbc.hex, width: bb * .75 } });
    }

    /* decorações via pseudo-elementos */
    if (e.classList.contains('tl')) { const c = pcol(getComputedStyle(root).getPropertyValue('--brand')) ; const t = pcol(mixHex(getComputedStyle(root).getPropertyValue('--brand').trim() || '#2b04b5', '#ffffff', .14)); if (t) shape('rect', { x: r.x + 30, y: r.y + 29, w: r.w - 60, h: 3 }, t); }
    if (tag === 'li' && e.parentElement.classList.contains('ul')) {
      const neg = e.parentElement.classList.contains('x'), ac = pcol(neg ? '#d9506a' : (getComputedStyle(root).getPropertyValue('--accent').trim() || '#19a7c2'));
      if (ac) { shape('ellipse', { x: r.x, y: r.y + 3, w: 20, h: 20 }, ac); s.addText(neg ? '✕' : '✓', { x: PX(r.x), y: PX(r.y + 3), w: PX(20), h: PX(20), fontSize: 9, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, fontFace: 'Inter' }); }
    }

    /* texto */
    if (isTextContainer(e)) {
      const runs = []; collectRuns(e, runs, /pre/.test(cs.whiteSpace));
      if (runs.length) { runs[0].text = runs[0].text.replace(/^\s+/, ''); const l = runs[runs.length - 1]; l.text = l.text.replace(/\s+$/, ''); }
      const rg = document.createRange(); rg.selectNodeContents(e);
      const rects = [...rg.getClientRects()].filter(q => q.width > 0 && q.height > 0);
      let bb = r;
      if (rects.length) { const x0 = Math.min(...rects.map(q => q.left)), y0 = Math.min(...rects.map(q => q.top)), x1 = Math.max(...rects.map(q => q.right)), y1 = Math.max(...rects.map(q => q.bottom)); bb = R({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }); }
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.2, multi = bb.h > lh * 1.55;
      const al = { center: 'center', right: 'right', justify: 'justify', end: 'right' }[cs.textAlign] || 'left';
      let x, w;
      if (multi) { const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0; x = r.x + pl; w = r.w - pl - pr + 3; }
      else { const slack = Math.max(10, bb.w * .08); x = bb.x - (al === 'center' ? slack / 2 : 0); w = bb.w + slack; }
      const opts = { x: PX(x), y: PX(bb.y), w: PX(w), h: PX(bb.h + 2), margin: 0, valign: 'top', align: multi ? al : (al === 'center' ? 'center' : 'left'), wrap: true, fit: 'none' };
      if (multi) opts.lineSpacing = Math.round(lh * .75 * 10) / 10;
      s.addText(runs, opts);
      e.querySelectorAll('*').forEach(x => consumed.add(x));
    }
  }
}
