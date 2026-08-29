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
    if (!file) { setPaneVisible(true); msg('الملف الأصلي غير متوفر لهذا الكتاب', true); return; }
    msg('جاري تحميل الصفحات...');
    setPaneVisible(true);

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

  window.PdfViewer = { show, clear, toggle };
})();