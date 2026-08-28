import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const pkgRoot = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontDataUrl = pathToFileURL(path.join(pkgRoot, 'standard_fonts') + path.sep).href;

export function extractPdf(buffer, opts = {}) {
  const maxPages = opts.maxPages || 0;
  const onProgress = opts.onProgress || null;
  return (async () => {
    onProgress?.({ phase: 'load', percent: 2 });
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer), standardFontDataUrl }).promise;
    const total = pdf.numPages;
    const limit = maxPages > 0 ? Math.min(maxPages, total) : total;

    const pages = [];
    for (let n = 1; n <= limit; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      let text = '';
      for (const item of content.items) {
        if ('str' in item) text += item.str;
        if (item.hasEOL) text += '\n';
        else text += ' ';
      }
      text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      pages.push(text);
      page.cleanup();
      onProgress?.({ phase: 'extract', page: n, total: limit, percent: Math.round(2 + (n / limit) * 88) });
    }

    onProgress?.({ phase: 'chapters', percent: 93 });
    let outline = [];
    try { outline = await pdf.getOutline(); } catch { outline = []; }
    onProgress?.({ phase: 'chapters', percent: 94 });

    const chapters = await detectChapters(pdf, outline, pages, limit);
    pdf.destroy();
    onProgress?.({ phase: 'chapters', percent: 98 });
    const totalChars = pages.join('').length;

    return {
      pageCount: total,
      extractedPages: limit,
      empty: limit > 0 && totalChars / limit < 15,
      hasText: totalChars > 0,
      pages,
      chapters,
    };
  })();
}

async function resolvePageIndex(pdf, dest) {
  try {
    const first = dest && Array.isArray(dest) ? dest[0] : null;
    if (first === null || first === undefined) return null;
    if (typeof first === 'number') return first;
    if (typeof first === 'object' && first.num !== undefined) {
      const idx = await Promise.race([
        pdf.getPageIndex(first),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000)),
      ]);
      return idx;
    }
    return null;
  } catch {
    return null;
  }
}

async function detectChapters(pdf, outline, pages, limit) {
  const chapters = [];
  const seen = new Set();

  // 1) try PDF outline (bookmarks)
  const outlineCandidates = [];
  if (Array.isArray(outline) && outline.length) {
    for (const item of outline) {
      const title = (item.title || '').trim();
      if (!title) continue;
      outlineCandidates.push({ title, dest: item.dest });
    }
  }

  const headingRe = /^(chapter|unit|lesson|part|section|module)\s+[0-9IVXLCalnum:.\-\s#]+$/i;
  const headingAr = /^(الفصل|الوحدة|الدرس|الباب|القسم|الجزء|الجزء الاول|الجزء الثاني)\s+[0-9IVX٠١٢٣٤٥٦٧٨٩0-9:.\- ]+$/;

  const isChapterTitle = (t) => {
    const s = t.trim().toLowerCase();
    if (!s || s.length > 120) return false;
    return (
      headingRe.test(s) ||
      headingAr.test(s) ||
      /\b(chapter|unit|lesson|part|section)\b/i.test(s) && s.length < 70 ||
      /[الفصل|الوحدة|الدرس|الباب|القسم]/u.test(s) && s.length < 70
    );
  };

  const addChapter = (title, startIdx) => {
    const t = title.trim();
    if (!t || t.length > 140) return;
    if (seen.has(t)) return;
    seen.add(t);
    chapters.push({ title: t, start: Math.max(0, startIdx) });
  };

  // outline-based
  if (outlineCandidates.length) {
    for (const c of outlineCandidates) {
      const idx = await resolvePageIndex(pdf, c.dest);
      if (idx === null || idx === undefined) continue;
      if (isChapterTitle(c.title)) addChapter(c.title, idx);
    }
  }

  // text-based scan fallback/enrichment
  if (chapters.length < 2) {
    for (let i = 0; i < pages.length; i++) {
      const lines = pages[i].split('\n').map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.length > 80) continue;
        if (/^(chapter|unit|lesson|part|section)\b/i.test(line)) {
          addChapter(line, i);
          break;
        }
      }
    }
  }

  if (chapters.length < 2) {
    for (let i = 0; i < pages.length; i++) {
      const firstLine = pages[i].split('\n').map((l) => l.trim()).filter(Boolean)[0] || '';
      if (/^(الفصل|الوحدة|الدرس|الباب|القسم)\s+[0-9٠-٩]/u.test(firstLine)) {
        addChapter(firstLine, i);
      }
    }
  }

  if (!chapters.length) {
    return [];
  }

  chapters.sort((a, b) => a.start - b.start);

  // merge items on same page
  const merged = [];
  for (const c of chapters) {
    const last = merged[merged.length - 1];
    if (last && last.start === c.start) {
      last.title = c.title;
      continue;
    }
    merged.push({ ...c });
  }

  // fill page ranges
  return merged.map((c, i) => {
    const end = i + 1 < merged.length ? merged[i + 1].start - 1 : limit - 1;
    return {
      id: `ch-${i + 1}`,
      title: c.title,
      pageStart: c.start + 1,
      pageEnd: Math.max(c.start, end) + 1,
      pageCount: Math.max(1, end - c.start + 1),
    };
  });
}

export function chapterText(pages, chapter) {
  const a = Math.max(0, chapter.pageStart - 1);
  const b = Math.min(pages.length - 1, (chapter.pageEnd || chapter.pageStart) - 1);

  // إذا كان نطاق الفصل خارج الصفحات المستخرجة، استخدم كل المتاح
  const from = a < pages.length ? a : 0;
  const to = b >= 0 && b >= from ? b : pages.length - 1;

  let out = '';
  for (let i = from; i <= to; i++) {
    if (pages[i]) out += `[صفحة ${i + 1}]\n${pages[i]}\n\n`;
  }
  return out.trim();
}

export function sliceContext(text, maxChars = 14000) {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '\n[... مقتطف، النص الأصلي أطول ...]';
}