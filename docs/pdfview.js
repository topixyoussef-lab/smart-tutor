/* ============================================================
   Smart Tutor — side PDF viewer (split screen with explanation)
   يعرض صفحات الفصل المختار من ملف PDF الأصلي.
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  let pdfjs = null;
  let st = { doc: null, pages: [], absStart: 0, scale: 1.5, bookId: null, current: 0, rendering: false };
  let observer = null;
  const watchers = [];

  function waitSmart() {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      (function tick() {
        if (window.__SMART) return resolve(window.__SMART);
        if (Date.now() - t0 > 10000) return reject(new Error('pdf not ready'));
        setTimeout(tick, 50);
      })();
    });
  }

  async function ensurePdfjs() {
    if (pdfjs) return pdfjs;
    const smart = await waitSmart();
    pdfjs = smart.pdfjs;
    return pdfjs;
  }

  function msg(text, isError) {
    const p = $('pdfMsg');
    if (!p) return;
    p.textContent = text || '';
    p.className = 'text-xs text-center py-6 ' + (isError ? 'text-rose-600 font-bold' : 'text-slate-500');
    p.classList.toggle('hidden', !text);
  }

  function clearMsg() {
    const p = $('pdfMsg');
    if (p) { p.classList.add('hidden'); p.textContent = ''; }
  }

  function setInfo(text) {
    const el = $('pdfPageInfo');
    if (el) el.textContent = text || '';
  }

  function setPaneVisible(visible) {
    const pane = $('pdfPane');
    if (pane) pane.classList.toggle('hidden', !visible);
  }

  function isPaneVisible() {
    const pane = $('pdfPane');
    if (pane) return !pane.classList.contains('hidden');
    return false;
  }

  function isBodyVisible(el) {
    const body = $('pdfBody');
    if (!body || !el) return false;
    const br = body.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return er.bottom > br.top && er.top < br.bottom;
  }

  function renderPageCanvas(canvas, pageNum, scale) {
    return st.doc.getPage(pageNum).then((page) => {
      const vp = page.getViewport({ scale });
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    });
  }

  async function renderVisible(force) {
    if (st.rendering) return;
    st.rendering = true;
    try {
      const nodes = $('pdfPages').querySelectorAll('.pdf-page');
      for (const node of nodes) {
        const canvas = node.querySelector('canvas[data-pdf-page]');
        if (!canvas || canvas.dataset.done === '1') continue;
        if (isBodyVisible(node) || force) {
          try {
            await renderPageCanvas(canvas, parseInt(canvas.dataset.pdfPage, 10), st.scale);
            canvas.dataset.done = '1';
          } catch (e) { /* skip page */ }
        }
      }
    } finally {
      st.rendering = false;
    }
  }

  function buildLayout(pageStart, pageEnd) {
    const wrap = $('pdfPages');
    wrap.innerHTML = '';
    st.pages = [];
    for (let n = pageStart; n <= pageEnd; n++) {
      st.pages.push(n);
      const node = document.createElement('div');
      node.className = 'pdf-page rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm';
      node.innerHTML = '<canvas data-pdf-page="' + n + '" class="w-full"></canvas><div class="text-center text-xs font-bold text-slate-500 py-1 bg-slate-50">' + n + '</div>';
      wrap.appendChild(node);
    }
  }

  function scrollTo(pos) {
    const wrap = $('pdfPages');
    const node = wrap.querySelectorAll('.pdf-page')[pos];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateInfo() {
    setInfo((st.current + 1) + ' / ' + st.pages.length);
  }

  async function open(bookId, pageStart, pageEnd) {
    const smart = await waitSmart();
    const book = await smart.getBook(bookId);
    const file = await smart.getOriginalFile(bookId);
    if (!file) { setPaneVisible(true); msg('الملف الأصلي غير متوفر لهذا الكتاب', true); window.dispatchEvent(new Event('pdf-pane')); return; }
    msg('جاري تحميل الصفحات...');
    setPaneVisible(true);
    if (window.DiagramView && window.DiagramView.setTab) window.DiagramView.setTab('pdf');
    window.dispatchEvent(new Event('pdf-pane'));

    if (st.doc) { try { st.doc.destroy(); } catch { /* noop */ } }
    st.doc = null;
    st.bookId = bookId;
    st.scale = 1.5;
    st.current = 0;
    const maxPage = Math.min(pageEnd, book ? book.pageCount || pageEnd : pageEnd);
    buildLayout(Math.max(1, pageStart), Math.max(pageStart, maxPage));
    updateInfo();

    try {
      const pdf = await ensurePdfjs();
      const buf = await file.arrayBuffer();
      const doc = await pdf.getDocument({ data: buf }).promise;
      st.doc = doc;
      if (st.bookId !== bookId) { try { doc.destroy(); } catch { /* noop */ } return; }
      const actualEnd = Math.min(maxPage, doc.numPages);
      if (actualEnd < st.pages.length) {
        const wrap = $('pdfPages');
        while (wrap.children.length > (actualEnd - Math.max(1, pageStart) + 1)) wrap.lastElementChild.remove();
        st.pages = [];
        for (let n = Math.max(1, pageStart); n <= actualEnd; n++) st.pages.push(n);
      }
      clearMsg();
      await renderVisible(true);
      setupObserver();
    } catch (e) {
      msg('تعذّر عرض الصفحات: ' + (e && e.message ? e.message : e), true);
    }
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    if (!('IntersectionObserver' in window)) return;
    const body = $('pdfBody');
    observer = new IntersectionObserver((entries) => {
      let hit = false;
      for (const en of entries) { if (en.isIntersecting) { hit = true; break; } }
      if (hit) renderVisible();
    }, { root: body, rootMargin: '300px 0px' });
    $('pdfPages').querySelectorAll('.pdf-page').forEach((n) => observer.observe(n));
  }

  async function zoom(factor) {
    if (!st.doc || !isPaneVisible()) return;
    const old = st.scale;
    st.scale = Math.min(3, Math.max(0.6, Math.round((old * factor) * 100) / 100));
    if (st.scale === old) return;
    const canvases = $('pdfPages').querySelectorAll('canvas[data-pdf-page]');
    canvases.forEach((c) => { c.dataset.done = '0'; });
    await renderVisible(isPaneVisible());
  }

  function clear() {
    if (st.doc) { try { st.doc.destroy(); } catch { /* noop */ } }
    st.doc = null;
    st.bookId = null;
    st.pages = [];
    if (observer) observer.disconnect();
    setPaneVisible(false);
    msg('');
    window.dispatchEvent(new Event('pdf-pane'));
  }

  function nav(dir) {
    if (!st.pages.length || !isPaneVisible()) return;
    st.current = Math.min(st.pages.length - 1, Math.max(0, st.current + dir));
    updateInfo();
    scrollTo(st.current);
  }

  async function show(bookId, pageStart, pageEnd) {
    try {
      await open(bookId, pageStart, pageEnd);
    } catch (e) {
      msg('تعذّر عرض الصفحات: ' + (e && e.message ? e.message : e), true);
    }
  }

  function toggle(bookId, pageStart, pageEnd) {
    if (isPaneVisible() && st.bookId === bookId) return clear();
    show(bookId, pageStart, pageEnd);
  }

  function init() {
    const prev = $('pdfPrevBtn'); if (prev) prev.addEventListener('click', () => nav(-1));
    const next = $('pdfNextBtn'); if (next) next.addEventListener('click', () => nav(1));
    const zi = $('pdfZoomInBtn'); if (zi) zi.addEventListener('click', () => zoom(1.25));
    const zo = $('pdfZoomOutBtn'); if (zo) zo.addEventListener('click', () => zoom(0.8));
    const hide = $('pdfHideBtn'); if (hide) hide.addEventListener('click', clear);
    window.addEventListener('keydown', (e) => {
      if (!isPaneVisible()) return;
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.PdfViewer = { show, clear, toggle, isPaneVisible, hasDoc: () => !!st.doc };
})();

/* ============================================================
   Smart Tutor — Visual / Diagram-based explanation (Flowchart)
   يلوّن الفصل كمخطط انسيابي (SVG خالص بدون مكتبات خارجية).
   ============================================================ */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const KIND_COLOR = {
    start: { fill: '#d1fae5', stroke: '#059669', text: '#065f46' },
    end: { fill: '#ffe4e6', stroke: '#e11d48', text: '#9f1239' },
    decision: { fill: '#fef3c7', stroke: '#d97706', text: '#92400e' },
    process: { fill: '#e0e7ff', stroke: '#4f46e5', text: '#3730a3' },
  };

  const st = { controller: null, scale: 1, layout: null };

  function pane() { return $('pdfPane'); }
  function isPaneVisible() { return pane() ? !pane().classList.contains('hidden') : false; }

  function setPaneVisible(visible) {
    if (pane()) pane().classList.toggle('hidden', !visible);
    window.dispatchEvent(new Event('pdf-pane'));
  }

  function showTab(tab) {
    const tPdf = $('paneTabPdf');
    const tDia = $('paneTabDiagram');
    if (!tPdf) return;
    const pdfWrap = $('pdfPanePdf');
    const diaWrap = $('diagramPaneBox');
    if (tab === 'diagram') {
      tPdf.classList.remove('btn-primary'); tPdf.classList.add('btn-ghost');
      tDia.classList.remove('btn-ghost'); tDia.classList.add('btn-primary');
      if (pdfWrap) pdfWrap.classList.add('hidden');
      if (diaWrap) diaWrap.classList.remove('hidden');
      if (st.layout) setTimeout(() => fit(), 40);
    } else {
      tDia.classList.remove('btn-primary'); tDia.classList.add('btn-ghost');
      tPdf.classList.remove('btn-ghost'); tPdf.classList.add('btn-primary');
      if (diaWrap) diaWrap.classList.add('hidden');
      if (pdfWrap) pdfWrap.classList.remove('hidden');
    }
  }

  function diagramMsg(text, isError) {
    const m = $('diagramMsg');
    if (!m) return;
    m.innerHTML = text || '';
    m.className = 'text-xs text-center py-8 px-2 ' + (isError ? 'text-rose-600 font-bold' : 'text-slate-500');
    m.classList.toggle('hidden', !text);
  }

  function computeLayers(nodes, edges) {
    const ids = nodes.map((n) => n.id);
    const out = new Map();
    const indeg = new Map();
    const adj = new Map();
    ids.forEach((id) => { out.set(id, []); indeg.set(id, 0); adj.set(id, []); });
    for (const e of edges) {
      if (!out.has(e.from) || !out.has(e.to)) continue;
      adj.get(e.from).push(e.to);
      indeg.set(e.to, (indeg.get(e.to) || 0) + 1);
    }
    const layer = new Map();
    ids.forEach((id) => layer.set(id, 0));
    const q = ids.filter((id) => (indeg.get(id) || 0) === 0);
    const seen = new Set(q);
    while (q.length) {
      const u = q.shift();
      for (const v of adj.get(u)) {
        layer.set(v, Math.max(layer.get(v) || 0, (layer.get(u) || 0) + 1));
        indeg.set(v, indeg.get(v) - 1);
        if (!seen.has(v)) { seen.add(v); q.push(v); }
      }
    }
    return layer;
  }

  function wrapText(text, maxLen) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxLen && cur) { lines.push(cur.trim()); cur = w; }
      else cur = (cur + ' ' + w).trim();
      if (lines.length >= 2) break;
    }
    if (cur) lines.push(cur.trim());
    return lines.slice(0, 2);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildSvg(data) {
    const BW = 260;
    const BH = 62;
    const HGAP = 118;
    const VGAP = 44;
    const CH = VGAP + BH;
    const PAD = 28;

    const layer = computeLayers(data.nodes, data.edges);
    const colOf = (id) => layer.get(id) || 0;

    const maxCol = Math.max(0, ...data.nodes.map((n) => colOf(n.id)));
    const cols = [];
    for (let c = 0; c <= maxCol; c++) cols.push([]);
    data.nodes.forEach((n) => cols[colOf(n.id)].push(n.id));
    const rowIndex = new Map();
    cols.forEach((col, c) => col.forEach((id, i) => rowIndex.set(id, { c, i })));

    const maxRows = Math.max(1, ...cols.map((c) => c.length));
    const W = PAD * 2 + (maxCol + 1) * BW + maxCol * HGAP;
    const H = PAD * 2 + maxRows * CH - VGAP;
    const cx = (id) => PAD + rowIndex.get(id).c * (BW + HGAP);
    const cy = (id) => PAD + rowIndex.get(id).i * CH;

    const markerId = 'arr' + Math.random().toString(36).slice(2, 8);
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="Cairo, sans-serif" direction="rtl">';
    s += '<defs><marker id="' + markerId + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#94a3b8"/></marker></defs>';

    const spanOf = (e) => colOf(e.to) - colOf(e.from);
    const laneCount = {};
    for (const e of data.edges) {
      const sp = spanOf(e);
      if (sp <= 0) continue;
      const k = colOf(e.from);
      laneCount[k] = (laneCount[k] || 0) + 1;
    }
    const laneIdx = {};
    for (const e of data.edges) {
      const sp = spanOf(e);
      if (sp <= 0) continue;
      const k = colOf(e.from);
      const li = (laneIdx[k] = (laneIdx[k] || 0) + 1);
      const offset = (li - (laneCount[k] + 1) / 2) * 10;
      const x1 = cx(e.from) + BW;
      const y1 = cy(e.from) + BH / 2;
      const x2 = cx(e.to);
      const y2 = cy(e.to) + BH / 2;
      const xm = (x1 + x2) / 2;
      const xl = xm + offset;
      const d = 'M' + x1 + ' ' + y1 + ' H' + xl + ' V' + y2 + ' H' + x2;
      s += '<path d="' + d + '" fill="none" stroke="#94a3b8" stroke-width="1.6" marker-end="url(#' + markerId + ')" />';
      if (e.label) {
        const label = esc(String(e.label).slice(0, 18));
        const lx = sp === 1 ? Math.min(x2 - 4, xl + 6) : xl + 6;
        s += '<text x="' + lx + '" y="' + (y2 - 6) + '" font-size="11" fill="#64748b">' + label + '</text>';
      }
    }

    for (const n of data.nodes) {
      const color = KIND_COLOR[n.kind] || KIND_COLOR.process;
      const x = cx(n.id);
      const y = cy(n.id);
      const lines = wrapText(n.text, 18);
      if (n.kind === 'decision') {
        const rw = BW / 2 + 18;
        const rh = BH / 2 + 14;
        const cxv = x + BW / 2;
        const cyv = y + BH / 2;
        s += '<polygon points="' + cxv + ',' + (cyv - rh) + ' ' + (cxv + rw) + ',' + cyv + ' ' + cxv + ',' + (cyv + rh) + ' ' + (cxv - rw) + ',' + cyv + '" fill="' + color.fill + '" stroke="' + color.stroke + '" stroke-width="1.8" />';
        s += '<text x="' + cxv + '" y="' + (cyv - 4) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + color.text + '">' + esc(lines[0] || '') + '</text>';
        if (lines[1]) s += '<text x="' + cxv + '" y="' + (cyv + 14) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + color.text + '">' + esc(lines[1]) + '</text>';
      } else {
        const rx = n.kind === 'start' || n.kind === 'end' ? BH / 2 : 8;
        s += '<rect x="' + x + '" y="' + y + '" width="' + BW + '" height="' + BH + '" rx="' + rx + '" fill="' + color.fill + '" stroke="' + color.stroke + '" stroke-width="1.8" />';
        const baseY = y + (lines.length === 1 ? BH / 2 + 5 : BH / 2 - 6);
        s += '<text x="' + (x + 12) + '" y="' + baseY + '" font-size="13" font-weight="700" fill="' + color.text + '">' + esc(lines[0] || '') + '</text>';
        if (lines[1]) s += '<text x="' + (x + 12) + '" y="' + (baseY + 17) + '" font-size="13" font-weight="700" fill="' + color.text + '">' + esc(lines[1]) + '</text>';
      }
    }

    if (data.title) {
      s += '<text x="' + (W / 2) + '" y="18" text-anchor="middle" font-size="14" font-weight="800" fill="#334155">' + esc(data.title) + '</text>';
    }
    s += '</svg>';
    return { svg: s, width: W, height: H };
  }

  function applyScale() {
    const canvas = $('diagramCanvas');
    if (!canvas || !st.layout) return;
    const s = st.scale;
    canvas.style.transform = 'scale(' + s + ')';
    canvas.style.width = (st.layout.width * s) + 'px';
    canvas.style.height = (st.layout.height * s) + 'px';
  }

  function fit() {
    const canvas = $('diagramCanvas');
    const body = $('diagramBody');
    const box = $('diagramPaneBox');
    if (!canvas || !body || !st.layout) return;
    if (box && box.classList.contains('hidden')) return;
    const pad = 18;
    const availW = Math.max(140, body.clientWidth - pad);
    const availH = Math.max(140, body.clientHeight - pad);
    const s = Math.min(availW / st.layout.width, availH / st.layout.height, 1);
    st.scale = Math.max(0.1, Math.round(s * 100) / 100);
    applyScale();
  }

  async function load(bookId, chapterId) {
    if (st.controller) st.controller.abort();
    const controller = new AbortController();
    st.controller = controller;

    setPaneVisible(true);
    showTab('diagram');
    diagramMsg('<div class="spinner mx-auto mb-2"></div>جاري رسم مخطط الفصل...');
    const hint = $('diagramHint');
    if (hint) { hint.textContent = ''; hint.classList.add('hidden'); }

    const lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
    try {
      const res = await fetch('/api/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, chapterId, lang }),
        signal: controller.signal,
      });
      const data = res && res.ok ? await res.json() : null;
      if (controller.signal.aborted || st.controller !== controller) return;
      if (!data || !data.diagram) throw new Error((data && data.error) || 'لا توجد استجابة');
      const built = buildSvg(data.diagram);
      st.layout = { width: built.width, height: built.height };
      st.scale = 1;
      const canvas = $('diagramCanvas');
      if (canvas) {
        canvas.innerHTML = built.svg;
      }
      const t = $('diagramTitle');
      if (t && data.diagram.title) t.textContent = '🌐 ' + data.diagram.title;
      diagramMsg('');
      setTimeout(() => {
        if (st.layout) { fit(); setTimeout(fit, 120); }
      }, 30);
      console.log('[SmartTutor] diagram ready', data.diagram.nodes.length, 'nodes');
    } catch (e) {
      if (e.name === 'AbortError') return;
      diagramMsg('تعذّر إنشاء الرسم التوضيحي: ' + (e && e.message ? e.message : e), true);
      const hintEl = $('diagramHint');
      if (hintEl) { hintEl.textContent = 'نصيحة: تأكد من ضبط مفتاح API في الإعدادات، أو جرّب موديلاً أقوى. يمكنك أيضاً الضغط على «↻» لإعادة المحاولة.'; hintEl.classList.remove('hidden'); }
    } finally {
      st.controller = null;
    }
  }

  function zoom(factor) {
    if (!st.layout) return;
    st.scale = Math.min(2.5, Math.max(0.5, Math.round(st.scale * factor * 100) / 100));
    applyScale();
  }

  function clear() {
    if (st.controller) { st.controller.abort(); st.controller = null; }
    st.layout = null;
    st.scale = 1;
    const canvas = $('diagramCanvas');
    if (canvas) canvas.innerHTML = '';
    diagramMsg('');
    const hint = $('diagramHint');
    if (hint) hint.classList.add('hidden');
    setPaneVisible(false);
  }

  function init() {
    const redo = $('diagramRedo');
    if (redo) {
      redo.addEventListener('click', () => {
        if (!st.bookId) return;
        load(st.bookId, st.chapterId);
      });
    }
    const fitBtn = $('diagramFitBtn'); if (fitBtn) fitBtn.addEventListener('click', () => { if (st.layout) fit(); });
    const zi = $('diagramZoomInBtn'); if (zi) zi.addEventListener('click', () => zoom(1.2));
    const zo = $('diagramZoomOutBtn'); if (zo) zo.addEventListener('click', () => zoom(0.85));
    const hide = $('diagramHideBtn'); if (hide) hide.addEventListener('click', clear);
    window.addEventListener('resize', () => { if (st.layout) setTimeout(fit, 60); });
    const tPdf = $('paneTabPdf'); if (tPdf) tPdf.addEventListener('click', () => {
      showTab('pdf');
      if (!window.PdfViewer || !window.PdfViewer.hasDoc()) window.dispatchEvent(new CustomEvent('pdf-requested'));
    });
    const tDia = $('paneTabDiagram'); if (tDia) tDia.addEventListener('click', () => {
      showTab('diagram');
      if (!st.layout) window.dispatchEvent(new CustomEvent('diagram-requested'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.DiagramView = {
    show: async (bookId, chapterId) => { st.bookId = bookId; st.chapterId = chapterId; await load(bookId, chapterId); },
    clear,
    zoom,
    setTab: showTab,
    isPaneVisible,
    getLayout: () => st.layout,
  };
})();