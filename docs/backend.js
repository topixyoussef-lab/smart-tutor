// ============================================================
//  Smart Tutor — in-browser backend (GitHub Pages build)
//  يعترض استدعاءات /api/* ويجيبها محلياً عبر IndexedDB + pdf.js
//  + استدعاء مباشر لمزوّد الذكاء الاصطناعي من المتصفح.
// ============================================================
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/legacy/build/pdf.min.mjs';

pdfjs.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs';

const MAX_CTX = 14000;

/* ==================== STORAGE (IndexedDB) ==================== */
const DB_NAME = 'smart-tutor-db';
const DB_VERSION = 1;
const STORE_NAMES = ['kv', 'books', 'pages', 'exams', 'results', 'files'];
let _dbPromise = null;

function openDb() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const rq = indexedDB.open(DB_NAME, DB_VERSION);
    rq.onupgradeneeded = () => {
      const db = rq.result;
      for (const s of STORE_NAMES) {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
      }
    };
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
    rq.onblocked = () => reject(new Error('قاعدة البيانات محجوبة'));
  });
  return _dbPromise;
}

function idbRequest(tx, req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.onabort = () => reject(tx.error || new Error('transaction aborted'));
    tx.onerror = () => reject(tx.error || new Error('transaction error'));
  });
}

async function idbGet(store, key) {
  try {
    const db = await openDb();
    const tx = db.transaction(store, 'readonly');
    return await idbRequest(tx, tx.objectStore(store).get(key));
  } catch { return null; }
}

async function idbSet(store, key, val) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(val, key);
    tx.oncomplete = () => resolve(val);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function idbDel(store, key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbAll(store, sortFn) {
  const db = await openDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).openCursor();
    const out = [];
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) { out.push(cur.value); cur.continue(); }
      else resolve(out);
    };
    req.onerror = () => reject(req.error);
  });
  if (sortFn) rows.sort(sortFn);
  return rows;
}

async function idbClear(store) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) { cur.delete(); cur.continue(); }
      else resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

function base64ToBlob(b64, type = 'application/octet-stream') {  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type });
  } catch {
    return null;
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const url = String(r.result || '');
      resolve(url.split(',')[1] || '');
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/* ==================== STORE API ==================== */
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getSettings() {
  const s = (await idbGet('kv', 'settings')) || {};
  return {
    provider: s.provider || 'openrouter',
    model: s.model || 'minimax/minimax-m3:free',
    openrouterKey: s.openrouterKey || '',
    moonshotKey: s.moonshotKey || '',
    lang: s.lang || 'ar',
  };
}

async function saveSettings(patch) {
  const s = (await idbGet('kv', 'settings')) || {};
  Object.assign(s, patch);
  await idbSet('kv', 'settings', s);
  return getSettings();
}

async function saveBook(book) { await idbSet('books', book.id, book); return book; }
function getBook(id) { return idbGet('books', id); }
function listBooks() { return idbAll('books', (a, b) => (b.createdAt || 0) - (a.createdAt || 0)); }
async function deleteBook(id) { await idbDel('books', id); await idbDel('pages', id); }

async function savePages(id, pages) { await idbSet('pages', id, pages); }
function getPages(id) { return idbGet('pages', id).then((p) => p || []); }

function saveExam(exam) { return idbSet('exams', exam.id, exam).then(() => exam); }
function getExam(id) { return idbGet('exams', id); }
function listExams(bookId) {
  return idbAll('exams', (a, b) => (b.createdAt || 0) - (a.createdAt || 0)).then((all) =>
    bookId ? all.filter((e) => e.bookId === bookId) : all
  );
}
function deleteExam(id) { return idbDel('exams', id); }

function saveResult(result) { return idbSet('results', result.id, result).then(() => result); }
function getResult(id) { return idbGet('results', id); }
function listResults() { return idbAll('results', (a, b) => (b.takenAt || 0) - (a.takenAt || 0)); }
function deleteResult(id) { return idbDel('results', id); }
async function getResultByExam(examId) {
  const all = await listResults();
  return all.find((r) => r.examId === examId) || null;
}

/* ==================== AI LAYER ==================== */
const FREE_MODELS = [
  { id: 'minimax/minimax-m3:free', name: 'MiniMax M3 (مجاني، ممتاز بالعربية)', tag: 'مجاني' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron Super 120B (مجاني)', tag: 'مجاني' },
  { id: 'z-ai/glm-5.2:free', name: 'GLM 5.2 (مجاني، ذكي جداً)', tag: 'مجاني' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (مجاني)', tag: 'مجاني' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (مجاني)', tag: 'مجاني' },
  { id: 'minimax/minimax-m2.7:free', name: 'MiniMax M2.7 (مجاني)', tag: 'مجاني' },
];

const MOONSHOT_MODELS = [
  { id: 'kimi-k2.7-code', name: 'Kimi K2.7 Code' },
  { id: 'kimi-k2.6', name: 'Kimi K2.6' },
  { id: 'kimi-k2-turbo-preview', name: 'Kimi K2 Turbo Preview' },
];

function endpointFor(provider) {
  if (provider === 'moonshot') return 'https://api.moonshot.ai/v1';
  return 'https://openrouter.ai/api/v1';
}

function headersFor(provider, key) {
  const h = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (provider === 'openrouter') {
    h['HTTP-Referer'] = location.href;
    h['X-Title'] = 'Smart Tutor';
  }
  return h;
}

async function currentConfig() {
  const s = await getSettings();
  const provider = s.provider;
  const model = s.model;
  const key = provider === 'moonshot' ? s.moonshotKey : s.openrouterKey;
  if (!key) throw new Error('لا يوجد مفتاح API. افتح "الإعدادات" وأضف المفتاح.');
  return { provider, model, key };
}

function stripFences(text) {
  let t = (text || '').trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  return t;
}

function parseJson(text) {
  const t = stripFences(text);
  try { return JSON.parse(t); } catch { /* continue */ }
  const start = t.search(/[[{]/);
  if (start >= 0) {
    const openChar = t[start];
    const closeChar = openChar === '[' ? ']' : '}';
    let depth = 0;
    for (let i = start; i < t.length; i++) {
      const ch = t[i];
      if (ch === openChar) depth++;
      else if (ch === closeChar) { depth--; if (depth === 0) { try { return JSON.parse(t.slice(start, i + 1)); } catch { } } }
    }
  }
  throw new Error('تعذّر قراءة إجابة الموديل بصيغة JSON.');
}

async function chat(msgs, { json = false, temperature = 0.4, maxTokens = 8000, retries = 1, model } = {}) {
  const { provider, model: m, key } = await currentConfig();
  const usedModel = model || m;
  const url = `${endpointFor(provider)}/chat/completions`;
  let attempt = 0;
  while (attempt <= retries) {
    const body = { model: usedModel, messages: msgs };
    if (json) body.response_format = { type: 'json_object' };
    body.temperature = temperature;
    body.max_tokens = maxTokens;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: headersFor(provider, key),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let msg = `خطأ من المزوّد (${res.status})`;
        try { const d = await res.json(); msg = d?.error?.message || d?.message || msg; } catch { }
        const err = new Error(msg);
        err.status = res.status;
        if (err.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)));
          attempt++;
          continue;
        }
        throw err;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('استجابة فارغة من الموديل.');
      return content;
    } catch (e) {
      if (e?.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)));
        attempt++;
        continue;
      }
      throw e;
    }
  }
  throw new Error('فشل الاتصال بالمزوّد.');
}

async function chatJson(msgs, opts = {}) {
  const out = await chat(msgs, { ...opts, json: true });
  return parseJson(out);
}

async function* streamChat(msgs, { temperature = 0.4, maxTokens = 8000, model } = {}) {
  const { provider, model: m, key } = await currentConfig();
  const usedModel = model || m;
  const url = `${endpointFor(provider)}/chat/completions`;
  const body = { model: usedModel, messages: msgs, temperature, max_tokens: maxTokens, stream: true };

  const res = await fetch(url, { method: 'POST', headers: headersFor(provider, key), body: JSON.stringify(body) });
  if (!res.ok) {
    let msg = `خطأ من المزوّد (${res.status})`;
    try { const d = await res.json(); msg = d?.error?.message || d?.message || msg; } catch { }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  if (!res.body) throw new Error('لا يوجد دفق للاستجابة.');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const tr = line.trim();
        if (!tr.startsWith('data:')) continue;
        const payload = tr.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const data = JSON.parse(payload);
          const delta = data?.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch { /* skip malformed */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/* ==================== AI IMAGE GENERATION ==================== */
const IMAGE_ENDPOINT = 'https://openrouter.ai/api/v1/images';
const IMAGE_MODELS = ['bytedance-seed/seedream-4.5', 'qwen/qwen-image-3', 'google/gemini-3.1-flash-lite-image'];
const IMAGE_ASPECTS = new Set(['1:1','1:2','1:4','1:8','2:1','2:3','3:2','3:4','4:1','4:3','4:5','5:4','8:1','9:16','16:9','9:19.5','19.5:9','9:20','20:9','9:21','21:9']);

function pollinationsDims(aspect) {
  const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(String(aspect || '').trim());
  let w = 4, h = 3;
  if (m) {
    w = parseFloat(m[1]);
    h = parseFloat(m[2]);
  }
  let W, H;
  if (w >= h) {
    W = 1024;
    H = Math.max(384, Math.round(1024 * h / w));
  } else {
    H = 1024;
    W = Math.max(384, Math.round(1024 * w / h));
  }
  if (W % 2) W++;
  if (H % 2) H++;
  return { w: W, h: H };
}

async function generateViaPollinations(promptText, aspect) {
  const { w, h } = pollinationsDims(aspect);
  const seed = Math.floor(Math.random() * 1e9);
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(String(promptText).slice(0, 600))
    + '?width=' + w + '&height=' + h + '&nologo=true&model=flux&seed=' + seed;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 24000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const ct = String(res.headers.get('content-type') || '');
    if (!res.ok || !ct.startsWith('image/')) throw new Error('خدمة الصور المجانية مشغولة (' + res.status + ').');
    const b64 = await blobToBase64(await res.blob());
    return { url: null, data: b64, mime: ct, source: 'pollinations' };
  } finally {
    clearTimeout(timer);
  }
}

async function generateImageHandler(body) {
  const { prompt, lang } = body || {};
  if (!prompt || !String(prompt).trim()) return { status: 400, error: 'أدخل وصفاً لتوليد الصورة.' };
  const cfg = await currentConfig();
  const p = String(prompt).slice(0, 800);
  const ratio = String(body.aspect || '').trim();

  let freeErr = null;
  try {
    const free = await generateViaPollinations(p, ratio);
    free.free = true;
    return free;
  } catch (e) {
    freeErr = String(e?.message || e);
  }

  let paid = null;
  if (cfg.provider === 'openrouter' && cfg.key) {
    const extras = { resolution: '1K' };
    if (IMAGE_ASPECTS.has(ratio)) extras.aspect_ratio = ratio;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cfg.key,
      'HTTP-Referer': 'https://smart-tutor.app',
      'X-Title': 'Smart Tutor',
    };
    for (const model of IMAGE_MODELS) {
      try {
        const res = await fetch(IMAGE_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model, prompt: p, ...extras }),
        });
        if (res.ok) {
          const data = await res.json();
          const item = data?.data?.[0];
          const raw = item?.b64_json || item?.data || null;
          if (raw) {
            const prefixed = /^data:image\//.test(raw);
            return prefixed
              ? { url: raw, data: null, mime: '' }
              : { url: item?.url || null, data: raw, mime: item?.media_type || item?.mime_type || 'image/png' };
          }
          paid = { status: 502, error: 'الموديل لم يرجع صورة.' };
          continue;
        }
        const d = await res.json().catch(() => ({}));
        paid = { status: 502, error: d?.error?.message || ('فشل توليد الصورة (' + res.status + ')') };
        if (d?.error?.code === 402) break;
      } catch (e) {
        paid = { status: 502, error: String(e?.message || e) };
      }
    }
  }

  return {
    status: 502,
    error: (paid?.error || 'فشل توليد الصورة.')
      + (freeErr && freeErr.includes('pollinations') ? ' | ' + freeErr : ''),
  };
}

/* ==================== PDF LAYER ==================== */
function extractPdf(buffer, opts = {}) {
  const maxPages = opts.maxPages || 0;
  const onProgress = opts.onProgress || null;
  return (async () => {
    onProgress?.({ phase: 'load', percent: 2 });
    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
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
    try { pdf.destroy(); } catch { /* ignore */ }
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
      (/\b(chapter|unit|lesson|part|section)\b/i.test(s) && s.length < 70) ||
      (/[الفصل|الوحدة|الدرس|الباب|القسم]/u.test(s) && s.length < 70)
    );
  };

  const addChapter = (title, startIdx) => {
    const t = title.trim();
    if (!t || t.length > 140) return;
    if (seen.has(t)) return;
    seen.add(t);
    chapters.push({ title: t, start: Math.max(0, startIdx) });
  };

  if (outlineCandidates.length) {
    for (const c of outlineCandidates) {
      const idx = await resolvePageIndex(pdf, c.dest);
      if (idx === null || idx === undefined) continue;
      if (isChapterTitle(c.title)) addChapter(c.title, idx);
    }
  }

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

  const merged = [];
  for (const c of chapters) {
    const last = merged[merged.length - 1];
    if (last && last.start === c.start) {
      last.title = c.title;
      continue;
    }
    merged.push({ ...c });
  }

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

function chapterText(pages, chapter) {
  const a = Math.max(0, chapter.pageStart - 1);
  const b = Math.min(pages.length - 1, (chapter.pageEnd || chapter.pageStart) - 1);
  const from = a < pages.length ? a : 0;
  const to = b >= 0 && b >= from ? b : pages.length - 1;
  let out = '';
  for (let i = from; i <= to; i++) {
    if (pages[i]) out += `[صفحة ${i + 1}]\n${pages[i]}\n\n`;
  }
  return out.trim();
}

function sliceContext(text, maxChars = 14000) {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '\n[... مقتطف، النص الأصلي أطول ...]';
}

/* ==================== PROMPTS ==================== */
function systemTeacher(lang) {
  return {
    role: 'system',
    content:
      (lang === 'ar'
        ? 'أنت "المُدرِّس الذكي" — مدرّس خبير متعدد المهارات، تشرح أي مادة كتبها الطالب (فيزياء، رياضيات، كيمياء، أحياء، تاريخ، لغة، مواد شرعية أو أدبية...) بطريقة مبسطة وممتعة ومفصّلة. ترد دوماً اعتماداً على نصوص الكتاب المقدَّمة لك فقط، ولا تخترع أرقاماً أو قوانين أو معلومات ليست موجودة في النص. عندما تُذكَر صفحة تذكرها مثل (صفحة 12). إذا لم تجد الإجابة في النص قل ذلك بصراحة.'
        : 'You are "Smart Tutor". An expert multi-subject teacher who explains ANY subject found in the student\'s book (physics, math, chemistry, biology, history, languages, literature, religious studies...). Explain in a simplified, engaging, detailed way. Always answer based ONLY on the book text provided to you. Never invent numbers, laws, or facts not present in the text. Reference pages when given (e.g., page 12). If the answer is not in the text, say so honestly.') +
      (lang === 'ar'
        ? '\nالقوانين والمعادلات تُكتب بصيغة LaTeX واضحة بين $...$، والتعريفات المهمة تُبرز بـ **عريض**، وتُستخدم رموز رياضية مفهومة.'
        : '\nWrite formulas in clear LaTeX between $...$, highlight key definitions in **bold**, and use understandable math symbols.'),
  };
}

function explainMessages({ bookTitle, chapterTitle, chapterText, lang, visualize }) {
  const visualInjection = visualize
    ? (lang === 'ar'
      ? [
          '\n\n**إلزامي — ادمج رسوماً توضيحية (شرح مصوّر):** يجب أن تُنتج 2–4 رسوماً توضيحية SVG نقي داخل الشرح (مخطط انسيابي flowchart، جدول مقارنة، رسم بياني، خريطة ذهنية، أو مخطط مراحل) في المواضع المهمة، وليس بعد كل جملة. اكتب **كل** رسم داخل كتلة مخصوصة بهذا الشكل الحرفي (سطر `[FIG` ثم سطر `<svg...` ثم سطر `[/FIG]`):',
          '',
          '[FIG:flow:عنوان الرسم]',
          '<svg width="700" height="300" xmlns="http://www.w3.org/2000/svg">',
          '<!-- عناصر الشكل هنا: مستطيلات rect ودوائر circle وأسهم line/text -->',
          '</svg>',
          '[/FIG]',
          '',
          'قواعد صارمة:',
          '- كل رسم SVG نقي فقط: `<svg>`, `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`, `<text>`, `<tspan>`, `<path>`, `<defs>`/`<linearGradient>`. ممنوع `<script>` وممنوع أي `href` خارجي وممنوع `foreignObject`.',
          '- اللون النصي داخل الرسم بدرجة داكنة مقروءة، والخلفية بيضاء `#ffffff`.',
          '- العرض كامل `width="700"` والارتفاع مناسب `height="300"~"500"`.',
          '- لا تكتب أحرفاً عربية عشوائية داخل `<text>`؛ استخدم نصوصاً قصيرة واضحة (حسب لغة الشرح).',
          '- افتح الرسم بـ `<svg` ثم أغلق بـ `</svg>` في نفس الكتلة، قبل `[/FIG]` مباشرة.',
          '- بعد كل رسم، اكتب جملة واحدة تربط الرسم بالمفهوم.'
        ].join('\n')
      : [
          '\n\n**MANDATORY — embed visual SVG illustrations (visual explanation):** You MUST produce 2–4 pure-SVG illustrations inside the explanation (a flowchart, comparison table, chart, mind map, or stage diagram) at the important points, not after every sentence. Write **each** drawing inside a dedicated block exactly like this (a `[FIG` line, then a `<svg...` line, then a `[/FIG]` line):',
          '',
          '[FIG:flow:drawing title]',
          '<svg width="700" height="300" xmlns="http://www.w3.org/2000/svg">',
          '<!-- elements here: rect, circle, line/text -->',
          '</svg>',
          '[/FIG]',
          '',
          'Strict rules:',
          '- Pure SVG elements only: `<svg>`, `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polyline>`, `<polygon>`, `<text>`, `<tspan>`, `<path>`, `<defs>`/`<linearGradient>`. No `<script>`, no external `href`, no `foreignObject`.',
          '- Dark legible text color on a white `#ffffff` background.',
          '- Full width `width="700"` and suitable `height="300"~"500"`.',
          '- Do not put random Arabic glyphs inside `<text>`; use short clear labels (in the explanation language).',
          '- Open with `<svg` and close with `</svg>` inside the block, right before `[/FIG]`.',
          '- After each drawing, write ONE sentence linking the drawing to the concept.'
        ].join('\n'))
    : '';
  const user =
    lang === 'ar'
      ? `اشرح هذا الفصل شرحاً مفصّلاً على مستوى الطالب: ضع له عناوين واضحة، اكتب القوانين أو المعادلات أو القواعد بصيغة LaTeX إن وُجدت، أعط أمثلة محلولة من الكتاب أو تطبيقات عملية، واذكر الأخطاء الشائعة.${visualInjection}\n\n**الكتاب:** ${bookTitle}\n**الفصل:** ${chapterTitle}\n\n**نص الفصل من الكتاب:**\n${chapterText}`
      : `Explain this chapter in detail at a student level. Use clear headings, write any laws, equations, or rules in LaTeX where they exist, give worked examples from the book or practical applications, and mention common mistakes.${visualInjection}\n\n**Book:** ${bookTitle}\n**Chapter:** ${chapterTitle}\n\n**Chapter text from the book:**\n${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

function chatMessages({ bookTitle, chapterTitle, chapterText, lang, history }) {
  const sys =
    lang === 'ar'
      ? `أنت تجيب على أسئلة طالب عن فصل "${chapterTitle}" من كتاب "${bookTitle}"، معتمداً على النص التالي من الكتاب فقط.\n\nنص الفصل:\n${chapterText}`
      : `You answer a student's questions about chapter "${chapterTitle}" of "${bookTitle}", relying ONLY on the following chapter text.\n\nChapter text:\n${chapterText}`;
  const msgs = [
    systemTeacher(lang),
    { role: 'system', content: sys },
    ...(history || []).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
  ];
  return msgs;
}

function summaryMessages({ bookTitle, chapterTitle, chapterText, lang }) {
  const user =
    lang === 'ar'
      ? `لخّص هذا الفصل كملخص مراجعة سريع: نقاط رئيسية، القوانين أو المعادلات أو المفاهيم الأساسية في قائمة، أصعب 3 أفكار، وسؤالان للتفكير.\n\n**الكتاب:** ${bookTitle}\n**الفصل:** ${chapterTitle}\n\n${chapterText}`
      : `Summarize this chapter as a quick study notes page: key points, the main laws/equations/key concepts as a list, the 3 hardest ideas, and 2 thought questions.\n\n**Book:** ${bookTitle}\n**Chapter:** ${chapterTitle}\n\n${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

const DIAGRAM_SCHEMA_EXPLANATION = `{
  "title": "عنوان قصير للمخطط",
  "nodes": [
    { "id": "n1", "text": "مفهوم أو خطوة قصيرة", "kind": "start" },
    { "id": "n2", "text": "خطوة أو مفهوم", "kind": "process" },
    { "id": "n3", "text": "سؤال أو تفرّع", "kind": "decision" },
    { "id": "n4", "text": "النتيجة النهائية", "kind": "end" }
  ],
  "edges": [
    { "from": "n1", "to": "n2", "label": "" },
    { "from": "n2", "to": "n3", "label": "اختياري" },
    { "from": "n3", "to": "n4", "label": "" }
  ]
}`;

function diagramMessages({ bookTitle, chapterTitle, chapterText, lang }) {
  const user =
    lang === 'ar'
      ? `أنشئ "شرحاً مرئياً مخططاً (Flowchart)" يلخّص أهم مفاهيم الفصل وتسلسل تعلمها وترابطها، ثم أرجِع JSON حصراً بالقالب التالي بدون أي كلام أو علامات آخر:
${DIAGRAM_SCHEMA_EXPLANATION}
الشروط:
- kind "start" لعقدة البداية، و"end" للنهاية، و"decision" لتفرّع أو سؤال، و"process" لكل البقية.
- اجعل النصوص قصيرة جداً (أقل من 6 كلمات) بأسلوب واضح مبسّط.
- غطِّ الفصل كاملاً في رسم واحد كامل: عدد العقد بين 12 و 45 لتشمل كل المفاهيم والأمثلة والخطوات.
- اربط المفاهيم بخطوط كثيرة تبين علاقاتها الحقيقية: ارسم سلسلة التسلسل الرئيسية (المفهوم ← الأمثلة ← القوانين/الخطوات ← التطبيق) ثم أضف علاقات جانبية بين أي مفهومين مرتبطين غير متتاليين، مثل "يعتمد على" أو "مثال على" أو "يؤدي إلى" أو "يقارن بـ" (ضع label لها)، ولا تكتفِ بخط واحد بين كل عقدتين.
- اجعل label أسهم التفرّع من عقدة decision واضحة مثل "نعم" / "لا".
- لا تربط بشكل عكسي ولا تضع حلقات ذاتية.
- كلمات المخطط بالعربية ما عدا المصطلحات الأجنبية الشائعة.

**الكتاب:** ${bookTitle}
**الفصل:** ${chapterTitle}
**نص الفصل من الكتاب:**
${chapterText}`
      : `Create a "visual flowchart-based explanation" summarizing this chapter's key ideas, their connections, and a logical learning sequence, then return ONLY JSON (no other text, no code fences) in this exact schema:
${DIAGRAM_SCHEMA_EXPLANATION}
Rules:
- kind "start" for the starting node, "end" for the end node, "decision" for a branch/question, "process" for everything else.
- Keep every node text very short (under 6 words).
- Cover the ENTIRE chapter in ONE complete diagram: use 12 to 45 nodes to include every concept, example, and step.
- Connect concepts with MANY of arrows showing their real relationships: draw the main learning chain (concept → examples → formula/steps → application), then ADD extra cross-links between any two related non-consecutive concepts (label them, e.g. "depends on", "example of", "leads to", "compares with"). Do not settle for just one edge between each pair.
- Make the arrows from every "decision" node clearly labeled (e.g. "Yes" / "No").
- No backward edges and no self-loops.
- Diagram words in English.

**Book:** ${bookTitle}
**Chapter:** ${chapterTitle}
**Chapter text from the book:**
${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

function normalizeDiagram(data) {
  const src = data && Array.isArray(data.nodes) ? data : ((data && (data.flowchart || data.diagram)) || null);
  if (!src || !Array.isArray(src.nodes)) throw new Error('الموديل لم يُرجع مخططاً صالحاً.');
  const ids = new Set();
  const nodes = [];
  for (const n of src.nodes.slice(0, 60)) {
    const id = String(n && (n.id !== undefined && n.id !== null ? n.id : n.i || ''));
    const text = String(n && (n.text || n.label || '')).trim().slice(0, 60);
    if (!id || !text || ids.has(id)) continue;
    ids.add(id);
    nodes.push({ id, text, kind: n.kind === 'start' || n.kind === 'end' || n.kind === 'decision' ? n.kind : 'process' });
  }
  if (!nodes.length) throw new Error('الموديل لم يُرجع عقداً صالحة.');
  const edges = [];
  for (const e of Array.isArray(src.edges) ? src.edges : []) {
    const from = String(e && (e.from !== undefined ? e.from : e.src || ''));
    const to = String(e && (e.to !== undefined ? e.to : e.dst || ''));
    if (!from || !to || !ids.has(from) || !ids.has(to)) continue;
    edges.push({ from, to, label: String(e && (e.label || e.text || '')).trim().slice(0, 40) });
  }
  return { title: String(data && data.title || (src.title || '')).trim().slice(0, 80), nodes, edges };
}

async function diagramHandler(body) {
  const { bookId, chapterId, lang } = body;
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) return { status: 404, error: 'الفصل أو الكتاب غير موجود' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) return { status: 400, error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' };
  const msgs = diagramMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang });
  const data = await chatJson(msgs, { temperature: 0.5, maxTokens: 8000 });
  return { diagram: normalizeDiagram(data) };
}

/* ==================== FLASHCARDS ==================== */
function flashcardMessages({ bookTitle, chapterTitle, chapterText, lang, count }) {
  const user = lang === 'ar'
    ? `أنشئ ${count} بطاقات مراجعة (flashcards) للفصل التالي، كل بطاقة من "سؤال/مصطلح" و"إجابة قصيرة مباشرة" تغطي أهم المفاهيم والتعريفات والقوانين والنقاط المتوقعة في الامتحان.

أعد JSON فقط بهذا الشكل تماماً دون أي كلام إضافي أو علامات:
{"cards":[{"question":"...","answer":"..."}]}

شروط:
- الإجابة قصيرة (سطران كحد أقصى) وواضحة.
- غطِّ مواضيع مختلفة من الفصل لا سؤالاً واحداً مكرراً.
- اكتب بالعربية مع إبقاء المصطلحات العلمية بالإنجليزية بين قوسين عند الحاجة.

${bookTitle} — ${chapterTitle}

${chapterText}`
    : `Create ${count} review flashcards for the chapter below, each card has a "question/term" and a short direct "answer" covering the most important concepts, definitions, formulas, and exam-likely points.

Return ONLY JSON in exactly this shape with no extra text or markers:
{"cards":[{"question":"...","answer":"..."}]}

Rules:
- The answer is short (2 lines max) and clear.
- Cover different topics of the chapter, not one question repeated.
- Write everything in English.

${bookTitle} — ${chapterTitle}

${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

async function flashcardsHandler(body) {
  const { bookId, chapterId, lang } = body;
  const count = Math.min(12, Math.max(4, parseInt(body.count || 8, 10)));
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) return { status: 404, error: 'الفصل أو الكتاب غير موجود' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) return { status: 400, error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' };
  const msgs = flashcardMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang, count });
  const data = await chatJson(msgs, { temperature: 0.4, maxTokens: 4000 });
  const raw = Array.isArray(data?.cards) ? data.cards : Array.isArray(data) ? data : (data?.cards ? [data.cards] : []);
  const cards = raw
    .map((c) => ({
      question: String(c?.question || c?.q || '').trim(),
      answer: String(c?.answer || c?.a || '').trim(),
    }))
    .filter((c) => c.question && c.answer)
    .slice(0, count);
  if (!cards.length) return { status: 500, error: 'الموديل لم يُرجع بطاقات صالحة، حاول مجدداً.' };
  return { cards };
}

/* ==================== QUICK QUIZ ==================== */
function quickquizMessages({ bookTitle, chapterTitle, chapterText, lang }) {
  const user = lang === 'ar'
    ? `أنشئ سؤالاً قصيراً واحداً (اختيار من متعدد) لاختبار الفهم أثناء قراءة الفصل التالي.

أعد JSON فقط بهذا الشكل تماماً دون أي كلام إضافي:
{"question":"...","options":["أ","ب","ج","د"],"answerIndex":0,"explanation":"شرح صغير"}

شروط:
- خيار واحد صحيح فقط والبقية مشتتات معقولة.
- ركّز على مفهوم أساسي واحد من الفصل.
- اكتب بالعربية.

${bookTitle} — ${chapterTitle}

${chapterText}`
    : `Create ONE short multiple-choice question to test understanding while reading the chapter below.

Return ONLY JSON in exactly this shape with no extra text:
{"question":"...","options":["a","b","c","d"],"answerIndex":0,"explanation":"short explanation"}

Rules:
- Exactly one correct option; the others are plausible distractors.
- Focus on ONE core concept from the chapter.
- Write everything in English.

${bookTitle} — ${chapterTitle}

${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

async function quickquizHandler(body) {
  const { bookId, chapterId, lang } = body;
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) return { status: 404, error: 'الفصل أو الكتاب غير موجود' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) return { status: 400, error: 'لا يوجد نص مستخرج لهذا الفصل.' };
  const msgs = quickquizMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang });
  const data = await chatJson(msgs, { temperature: 0.3, maxTokens: 1500 });
  const q = data?.question || data?.quiz?.question;
  const options = Array.isArray(data?.options) ? data.options : [];
  if (!q || options.length < 2) return { status: 500, error: 'الموديل لم يُرجع سؤالاً صالحاً، حاول مجدداً.' };
  const cleaned = options.slice(0, 5).map((o) => String(o).trim());
  let answerIndex = parseInt(data.answerIndex, 10);
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= cleaned.length) answerIndex = 0;
  return { quiz: { question: q, options: cleaned, answerIndex, explanation: data.explanation || '' } };
}

/* ==================== TIMETABLE GENERATOR ==================== */
const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function dateToStr(d) { return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); }

async function timetableHandler(body) {
  const {
    bookIds = [], startDate, weekdays = [0, 1, 2, 3, 4, 5, 6],
    sessionsPerDay = 1, minutesPerSession = 60, subjectsPerDay = 1, lang = 'ar',
  } = body || {};
  const books = [];
  for (const id of (Array.isArray(bookIds) ? bookIds : [])) {
    const b = await getBook(id);
    if (b) books.push(b);
  }
  if (!books.length) return { status: 400, error: 'اختر كتاباً واحداً على الأقل لإنشاء الجدول.' };
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(startDate))) return { status: 400, error: 'حدّد تاريخ البداية بشكل صحيح.' };
  const spd = Math.min(6, Math.max(1, parseInt(sessionsPerDay, 10) || 1));
  const mps = Math.min(180, Math.max(15, parseInt(minutesPerSession, 10) || 60));
  const subPerDay = Math.min(3, Math.max(1, parseInt(subjectsPerDay, 10) || 1));
  const allowed = new Set((Array.isArray(weekdays) ? weekdays : []).map((d) => Number(d) % 7));

  const subjects = [];
  let totalUnits = 0;
  for (const b of books) {
    const chs = (b && b.chapters) || [];
    if (!chs.length) {
      subjects.push({ name: b.title || 'كتاب', queue: [{ chapterId: null, text: b.title || 'دراسة كاملة' }] });
      totalUnits += 1;
    } else {
      subjects.push({ name: b.title || 'كتاب', queue: chs.map((c) => ({ chapterId: c.id, text: c.title })) });
      totalUnits += chs.length;
    }
  }

  const parts = String(startDate).split('-').map((x) => parseInt(x, 10));
  let cursor = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  const schedule = [];
  const dayNames = lang === 'ar' ? DAYS_AR : DAYS_EN;
  let subIdx = 0;
  let assigned = 0;
  const MAX_DAYS = 730;
  let guard = 0;

  while (assigned < totalUnits && schedule.length < MAX_DAYS && guard++ < 1200) {
    const dt = new Date(cursor);
    cursor += 86400000;
    const dow = dt.getUTCDay();
    if (!allowed.has(dow)) continue;

    const sessions = [];
    const usedToday = new Set();
    for (let s = 0; s < spd && assigned < totalUnits; s++) {
      let pick = null;
      const allowRepeat = usedToday.size >= subPerDay;
      for (let t = 0; t < subjects.length && !pick; t++) {
        const idx = (subIdx + t) % subjects.length;
        const sub = subjects[idx];
        if (!sub.queue.length) continue;
        if (!allowRepeat && usedToday.has(sub.name)) continue;
        pick = sub;
        subIdx = idx;
      }
      if (!pick) {
        for (let t = 0; t < subjects.length && !pick; t++) {
          const idx = (subIdx + t) % subjects.length;
          const sub = subjects[idx];
          if (sub.queue.length) { pick = sub; subIdx = idx; }
        }
      }
      if (!pick) break;
      const u = pick.queue.shift();
      usedToday.add(pick.name);
      assigned++;
      sessions.push({ subject: pick.name, text: u.text, chapterId: u.chapterId, minutes: mps });
    }
    schedule.push({ date: dateToStr(dt), weekday: dow, dayLabel: dayNames[dow], sessions });
  }

  if (assigned < totalUnits) return { status: 500, error: 'تعذّر إكمال الجدول ضمن المدة المعقولة، قلّل عدد الكتب.' };

  const hoursPerWeek = Math.round(allowed.size * spd * (mps / 60) * 10) / 10;
  return {
    stats: {
      books: books.length,
      units: totalUnits,
      days: schedule.length,
      hoursPerWeek,
    },
    schedule,
  };
}

/* ==================== REVIEW PLAN (spaced repetition) ==================== */
function reviewPlanMessages({ topics, lang }) {
  const block = topics.slice(0, 10).map((t, i) => `${i + 1}. ${t.topic} (${t.weak}/${t.total} — ${t.weakPct}%)`).join('\n');
  const user = lang === 'ar'
    ? `أنشئ خطة مراجعة متباعدة (spaced repetition) لمدة 7 أيام لمواضيع الطالب الأضعف.

أعد JSON فقط بهذا الشكل تماماً دون أي كلام إضافي:
{"plan":{"summary":"وصف مختصر","days":[{"day":1,"label":"اليوم 1","topics":["موضوع"],"tasks":["مهمة محددة","مهمة أخرى"]}]}}

شروط:
- الأيام 7 أيام، وكل موضوع ضعيف يتكرر بأيام متباعدة (في اليوم 1 ثم 3 ثم 7 مثلاً).
- كل مهمة محددة وقابلة للتنفيذ (راجع ملاحظاتك، حل مسائل، اصنع بطاقات، حل اختبار قصير).
- اكتب بالعربية.

المواضيع الضعيفة (من الأضعف للأقوى):
${block}`
    : `Create a 7-day spaced-repetition review plan for the student's weakest topics.

Return ONLY JSON in exactly this shape with no extra text:
{"plan":{"summary":"short overview","days":[{"day":1,"label":"Day 1","topics":["topic"],"tasks":["concrete task","another task"]}]}}

Rules:
- 7 days; each weak topic repeats on spaced days (e.g. day 1 then 3 then 7).
- Each task is concrete and actionable (review your notes, solve problems, make flashcards, take a short quiz).
- Write everything in English.

Weak topics (weakest first):
${block}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

async function reviewPlanHandler(body) {
  const { lang } = body;
  const results = await listResults();
  const count = {};
  const total = {};
  for (const r of results) {
    for (const q of r.questions || []) {
      const t = q.topic || 'عام';
      total[t] = (total[t] || 0) + 1;
      if (!q.correct) count[t] = (count[t] || 0) + 1;
    }
  }
  const topics = Object.keys(total)
    .map((t) => ({ topic: t, total: total[t], weak: count[t] || 0, weakPct: Math.round(((count[t] || 0) / total[t]) * 100) }))
    .sort((a, b) => b.weakPct - a.weakPct || b.weak - a.weak);
  if (!topics.length) return { status: 400, error: 'لا توجد نتائج امتحانات بعد، حل اختباراً أولاً.' };
  const msgs = reviewPlanMessages({ topics, lang });
  const data = await chatJson(msgs, { temperature: 0.4, maxTokens: 4000 });
  const days = Array.isArray(data?.plan?.days) ? data.plan.days : (Array.isArray(data?.days) ? data.days : []);
  if (!days.length) return { status: 500, error: 'الموديل لم يُرجع خطة صالحة، حاول مجدداً.' };
  return { plan: { summary: data?.plan?.summary || data?.summary || '', days: days.slice(0, 7) } };
}

const EXAM_SCHEMA_EXPLANATION = `{
  "questions": [
    {
      "type": "mcq",
      "topic": "اسم الموضوع/القانون",
      "question": "نص السؤال...",
      "options": ["أ", "ب", "ج", "د"],
      "answerIndex": 0,
      "explanation": "شرح لِمَ هذا الخيار هو الصحيح ولماذا الخطأ صحيح/خاطئ"
    },
    {
      "type": "concept",
      "topic": "اسم الموضوع",
      "question": "سؤال مفهومي قصير...",
      "modelAnswer": "الإجابة النموذجية الكاملة",
      "explanation": "نقاط التقييم + ملاحظات تصحيح"
    },
    {
      "type": "problem",
      "topic": "اسم الموضوع/القانون",
      "question": "مسألة عددية...",
      "modelAnswer": "الحل النموذجي خطوة بخطوة",
      "explanation": "طريقة الحل وعلامات التقييم"
    }
  ]
}`;

function examMessages({ bookTitle, chapters, level, types, count, lang }) {
  const L =
    level === 'easy'
      ? lang === 'ar' ? 'مستوى سهل: مفاهيم أساسية وتطبيق مباشر. أسئلة واضحة لا تلتبس.'
      : 'Easy level: basic concepts and direct application. Clear, unambiguous questions.'
    : level === 'hard'
      ? lang === 'ar' ? 'مستوى صعب: أسئلة عميقة تجمع بين أكثر من قانون وتحتاج تحليلاً وتركيباً.'
      : 'Hard level: deep questions combining more than one law, requiring analysis and synthesis.'
    : lang === 'ar' ? 'مستوى متوسط: مزيج من المفاهيم والتطبيق والاستنتاج.'
    : 'Medium level: a mix of concepts, application, and reasoning.';

  const typeNames = {
    mcq: lang === 'ar' ? 'اختيار من متعدد' : 'Multiple choice',
    concept: lang === 'ar' ? 'مفهومي (إجابة قصيرة)' : 'Conceptual (short answer)',
    problem: lang === 'ar' ? 'مسألة عددية' : 'Numerical problem',
  };

  const chosen = types.map((t) => typeNames[t] || t).join('، ');
  const chapterBlock = chapters
    .map((c) => `### ${c.title}\n${c.text}`)
    .join('\n\n');

  const user =
    lang === 'ar'
      ? `أنشئ امتحاناً للطالب بناءً على النصوص التالية فقط.\n\n**الكتاب:** ${bookTitle}\n${L}\n**أنواع الأسئلة المطلوبة:** ${chosen}\n**عدد الأسئلة المطلوب إجمالاً:** ${count}\n\n**محتوى الفصول:**\n${chapterBlock}\n\nأعد JSON فقط بالشكل التالي بالضبط (دون أي نص خارج الـ JSON):\n${EXAM_SCHEMA_EXPLANATION}\n\nشروط:\n- وزّع الأسئلة على الموضوعات بشكل متوازن.\n- لأسئلة الاختيار، اجعل إجابة واحدة صحيحة، وجهّل الخيارات.\n- لكل سؤال اكتب topic دقيق.\n- اكتب كل شيء (نص الأسئلة والإجابات) بالعربية مع إبقاء المصطلحات العلمية بين قوسين بالإنجليزية.`
      : `Create an exam for the student based ONLY on the texts below.\n\n**Book:** ${bookTitle}\n${L}\n**Required question types:** ${chosen}\n**Total number of questions:** ${count}\n\n**Chapter content:**\n${chapterBlock}\n\nReturn ONLY JSON in exactly this shape (no text outside the JSON):\n${EXAM_SCHEMA_EXPLANATION}\n\nRequirements:\n- Distribute questions evenly across topics.\n- For MCQs make exactly one correct choice and plausible distractors.\n- Give each question a precise "topic".\n- Write everything in English.`;

  return [systemTeacher(lang), { role: 'user', content: user }];
}

function gradeMessages({ question, modelAnswer, studentAnswer, points, lang, type }) {
  const rubric =
    type === 'problem'
      ? lang === 'ar'
        ? 'المعايير: صحة المنهج (30%)، صحة القوانين والمعادلات (30%)، صحة الحسابات والنتيجة النهائية (25%)، ترتيب الحل ووحدات القياس (15%).'
        : 'Rubric: correct approach (30%), correct laws/equations (30%), correct calculations and final result (25%), organized solution and units (15%).'
      : lang === 'ar'
        ? 'المعايير: صحة الإجابة علمياً (60%)، اكتمال المقصود (25%)، وضوح الصياغة (15%).'
        : 'Rubric: scientific correctness (60%), completeness of meaning (25%), clarity (15%).';

  const user =
    lang === 'ar'
      ? `صحّح إجابة طالب على السؤال التالي، وقيّمها من ${points}، وأعد JSON فقط:
{
  "score": "درجة رقمية من 0 إلى ${points}",
  "feedback": "ملاحظة موجزة للطالب بالعربية تتضمن لِمَ أخذ هذه الدرجة",
  "keyPointsCovered": ["نقاط أجاب عنها صحيحة"],
  "missingPoints": ["نقاط ناقصة أو خاطئة أو يجب ذكرها"]
}
${rubric}\n\nالسؤال: ${question}\nالإجابة النموذجية: ${modelAnswer}\nإجابة الطالب: ${studentAnswer}`
      : `Grade a student's answer to the following question out of ${points}, and return ONLY JSON:
{
  "score": "numeric score from 0 to ${points}",
  "feedback": "brief feedback to the student explaining the score",
  "keyPointsCovered": ["points they answered correctly"],
  "missingPoints": ["missing or wrong points that should be mentioned"]
}
${rubric}\n\nQuestion: ${question}\nModel answer: ${modelAnswer}\nStudent answer: ${studentAnswer}`;

  return [systemTeacher(lang), { role: 'user', content: user }];
}

function analysisMessages({ examTitle, items, lang }) {
  const itemsBlock = items
    .map(
      (q, i) =>
        `${i + 1}. [${q.type}] موضوع: ${q.topic} — الدرجة: ${q.score}/${q.points} — صح: ${q.correct ? 'نعم' : 'لا'}${q.short ? ` — ${q.short}` : ''}`
    )
    .join('\n');

  const user =
    lang === 'ar'
      ? `حلّل نتائج الطالب في الامتحان "${examTitle}" وأعد JSON فقط:
{
  "weakTopics": ["أول 3 مواضيع ضعيفة بسب ب شفرة واضحة"],
  "strengths": ["مواضيع أتقنها"],
  "recommendations": ["خطوات مراجعة ملموسة لكل موضوع ضعيف، مقترنة بالصفحات إن أمكن"]
}

نتائج الأسئلة:\n${itemsBlock}`
      : `Analyze the student's results in exam "${examTitle}" and return ONLY JSON:
{
  "weakTopics": ["top 3 weak topics with clear reasons"],
  "strengths": ["topics the student mastered"],
  "recommendations": ["concrete revision steps for each weak topic, with page numbers if possible"]
}

Question results:\n${itemsBlock}`;

  return [systemTeacher(lang), { role: 'user', content: user }];
}

function examTitlePrompt({ bookTitle, chapters, level, lang }) {
  const names = chapters.map((c) => c.title).join(' + ');
  const lv = level === 'easy' ? (lang === 'ar' ? 'سهل' : 'Easy') : level === 'hard' ? (lang === 'ar' ? 'صعب' : 'Hard') : lang === 'ar' ? 'متوسط' : 'Medium';
  return `${bookTitle} — ${names} (${lv})`;
}

/* ==================== SERVER HELPERS ==================== */
async function getChapterById(book, chapterId) {
  if (!book) return null;
  if (chapterId === '__all__') {
    const pages = await getPages(book.id);
    return {
      id: '__all__',
      title: 'الكتاب كاملاً',
      pageStart: 1,
      pageEnd: Math.max(1, book.extractedPages || pages.length || book.pageCount || 1),
      pageCount: Math.max(1, book.extractedPages || pages.length || book.pageCount || 1),
    };
  }
  return (book?.chapters || []).find((c) => c.id === chapterId) || null;
}

async function buildChapterBlock(book, chapters) {
  const pages = await getPages(book.id);
  return chapters.map((c) => ({ title: c.title, text: sliceContext(chapterText(pages, c), MAX_CTX) }));
}

/* ==================== RESPONSES ==================== */
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

function sseStream(gen) {
  return new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const obj of gen) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
          await new Promise((r) => setTimeout(r, 0));
        }
      } catch (e) {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: 'error', error: e?.message || String(e) })}\n\n`));
        } catch { /* ignore */ }
      } finally {
        try { controller.close(); } catch { /* ignore */ }
      }
    },
  });
}

function sseResponse(gen) {
  return new Response(sseStream(gen), { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/* ==================== ROUTES ==================== */
async function readJsonBody(init) {
  if (!init || init.body === undefined) return undefined;
  if (typeof init.body === 'string') { try { return JSON.parse(init.body); } catch { return {}; } }
  if (init.body instanceof FormData) return null;
  return {};
}

async function handleApi(method, pathname, init) {
  // ---------- settings ----------
  if (pathname === '/api/settings') {
    if (method === 'GET') {
      const s = await getSettings();
      return json({
        provider: s.provider,
        model: s.model,
        openrouterKey: s.openrouterKey ? 'set' : '',
        moonshotKey: s.moonshotKey ? 'set' : '',
        lang: s.lang,
        freeModels: FREE_MODELS,
        moonshotModels: MOONSHOT_MODELS,
      });
    }
    if (method === 'PUT') {
      const body = (await readJsonBody(init)) || {};
      const saved = await saveSettings({
        ...(body.provider ? { provider: body.provider } : {}),
        ...(body.model ? { model: body.model } : {}),
        ...(body.openrouterKey ? { openrouterKey: body.openrouterKey } : {}),
        ...(body.moonshotKey ? { moonshotKey: body.moonshotKey } : {}),
        ...(body.lang ? { lang: body.lang } : {}),
      });
      return json({ ok: true, provider: saved.provider, model: saved.model, lang: saved.lang });
    }
  }

  // ---------- backup (export / import) ----------
  if (pathname === '/api/export' && method === 'POST') {
    try {
      const settings = await getSettings();
      const books = await listBooks();
      const exams = await listExams();
      const results = await listResults();
      const pages = {};
      for (const b of books) pages[b.id] = await getPages(b.id);
      const pdfs = {};
      for (const b of books) {
        const f = await idbGet('files', b.id);
        if (f) {
          try { pdfs[b.id] = await blobToBase64(f); } catch { /* skip */ }
        }
      }
      const backup = {
        version: 1,
        app: 'smart-tutor',
        exportedAt: new Date().toISOString(),
        settings,
        books,
        pages,
        exams,
        results,
        pdfs,
      };
      return json({ backup });
    } catch (e) {
      return json({ error: 'تعذّر إنشاء النسخة الاحتياطية: ' + (e?.message || e) }, 500);
    }
  }

  if (pathname === '/api/import' && method === 'POST') {
    try {
      const body = (await readJsonBody(init)) || {};
      const bk = body?.backup;
      if (!bk || bk.app !== 'smart-tutor' || bk.version !== 1) {
        return json({ error: 'ملف نسخة احتياطية غير صالح.' }, 400);
      }
      for (const s of ['kv', 'books', 'pages', 'exams', 'results', 'files']) await idbClear(s);
      if (bk.settings) await idbSet('kv', 'settings', bk.settings);
      for (const b of bk.books || []) await idbSet('books', b.id, b);
      for (const id of Object.keys(bk.pages || {})) await idbSet('pages', id, bk.pages[id]);
      for (const e of bk.exams || []) await idbSet('exams', e.id, e);
      for (const r of bk.results || []) await idbSet('results', r.id, r);
      for (const id of Object.keys(bk.pdfs || {})) {
        const blob = base64ToBlob(bk.pdfs[id], 'application/pdf');
        if (blob) await idbSet('files', id, blob);
      }
      return json({
        ok: true,
        books: (bk.books || []).length,
        exams: (bk.exams || []).length,
        results: (bk.results || []).length,
        pdfs: Object.keys(bk.pdfs || {}).length,
      });
    } catch (e) {
      return json({ error: 'تعذّر الاستيراد: ' + (e?.message || e) }, 500);
    }
  }

  // ---------- books ----------
  const pdfRe = /^\/api\/books\/([^/]+)\/pdf$/;
  let mp = pathname.match(pdfRe);
  if (mp && method === 'GET') {
    const bookId = decodeURIComponent(mp[1]);
    const book = await getBook(bookId);
    const file = await idbGet('files', bookId);
    if (!book || !file) return json({ error: 'الملف الأصلي غير متوفر على هذا الجهاز' }, 404);
    const name = encodeURIComponent(book.fileName || `${book.title}.pdf`);
    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${book.fileName || 'book.pdf'}"; filename*=UTF-8''${name}`,
      },
    });
  }

  if (pathname === '/api/books') {
    if (method === 'GET') {
      const books = (await listBooks()).map((b) => ({
        id: b.id,
        title: b.title,
        pageCount: b.pageCount,
        extractedPages: b.extractedPages,
        empty: b.empty,
        createdAt: b.createdAt,
        chapters: b.chapters || [],
      }));
      return json({ books });
    }
    if (method === 'POST') {
      const fd = init.body;
      if (!(fd instanceof FormData)) return json({ error: 'لا يوجد ملف' }, 400);
      const file = fd.get('file');
      if (!file) return json({ error: 'لا يوجد ملف' }, 400);
      if (!/\.pdf$/i.test(file.name)) return json({ error: 'يرجى رفع ملف PDF فقط' }, 400);
      if (file.size > 80 * 1024 * 1024) {
        return json({ error: 'الملف أكبر من الحد المسموح (80MB). قلّل الحجم أو جرّب ملفاً أصغر.' }, 400);
      }
      const title = (fd.get('title') || '').trim() || file.name.replace(/\.pdf$/i, '');
      const maxPages = parseInt(fd.get('maxPages') || '0', 10) || 0;
      return sseResponse(uploadBookStream(file, title, maxPages));
    }
  }

  const booksRe = /^\/api\/books\/([^/]+)$/;
  const chaptersRe = /^\/api\/books\/([^/]+)\/chapters$/;
  let m = pathname.match(chaptersRe);
  if (m) {
    const bookId = decodeURIComponent(m[1]);
    if (method === 'PUT') {
      const book = await getBook(bookId);
      if (!book) return json({ error: 'الكتاب غير موجود' }, 404);
      const body = (await readJsonBody(init)) || {};
      const chapters = body.chapters;
      if (!Array.isArray(chapters) || !chapters.length) return json({ error: 'قائمة فصول غير صالحة' }, 400);
      book.chapters = chapters.map((c, i) => ({
        id: c.id || `ch-${i + 1}`,
        title: String(c.title || '').trim() || `الفصل ${i + 1}`,
        pageStart: Math.max(1, parseInt(c.pageStart, 10) || 1),
        pageEnd: Math.max(parseInt(c.pageStart, 10) || 1, parseInt(c.pageEnd, 10) || 1),
        pageCount: Math.max(1, (parseInt(c.pageEnd, 10) || 1) - (parseInt(c.pageStart, 10) || 1) + 1),
      }));
      await saveBook(book);
      return json({ ok: true, book });
    }
    return json({ error: 'غير مسموح' }, 405);
  }
  m = pathname.match(booksRe);
  if (m) {
    const bookId = decodeURIComponent(m[1]);
    if (method === 'GET') {
      const book = await getBook(bookId);
      if (!book) return json({ error: 'الكتاب غير موجود' }, 404);
      return json({ book });
    }
    if (method === 'DELETE') {
      await deleteBook(bookId);
      return json({ ok: true });
    }
    return json({ error: 'غير مسموح' }, 405);
  }

  // ---------- explain / chat / summarize ----------
  if (pathname === '/api/explain' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return sseResponse(explainStream(body));
  }
  if (pathname === '/api/chat' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return sseResponse(chatStream(body));
  }
  if (pathname === '/api/summarize' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(summarizeHandler(body));
  }
  if (pathname === '/api/diagram' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(diagramHandler(body));
  }

  // ---------- study aids ----------
  if (pathname === '/api/flashcards' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(flashcardsHandler(body));
  }
  if (pathname === '/api/quickquiz' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(quickquizHandler(body));
  }
  if (pathname === '/api/review-plan' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(reviewPlanHandler(body));
  }
  if (pathname === '/api/timetable' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(timetableHandler(body));
  }
  if (pathname === '/api/generate-image' && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return jsonResponse(generateImageHandler(body));
  }

  // ---------- exams ----------
  if (pathname === '/api/exams') {
    if (method === 'GET') {
      const list = await Promise.all(
        (await listExams()).map(async (e) => ({
          id: e.id,
          title: e.title,
          bookTitle: e.bookTitle,
          level: e.level,
          lang: e.lang,
          questionCount: (e.questions || []).length,
          createdAt: e.createdAt,
          taken: !!(await getResultByExam(e.id)),
        }))
      );
      return json({ exams: list });
    }
    if (method === 'POST') {
      const body = (await readJsonBody(init)) || {};
      return jsonResponse(createExamHandler(body));
    }
    return json({ error: 'غير مسموح' }, 405);
  }

  const submitRe = /^\/api\/exams\/([^/]+)\/submit$/;
  m = pathname.match(submitRe);
  if (m && method === 'POST') {
    const body = (await readJsonBody(init)) || {};
    return sseResponse(submitExamStream(decodeURIComponent(m[1]), body));
  }

  const examsRe = /^\/api\/exams\/([^/]+)$/;
  m = pathname.match(examsRe);
  if (m) {
    const examId = decodeURIComponent(m[1]);
    if (method === 'GET') {
      const exam = await getExam(examId);
      if (!exam) return json({ error: 'الامتحان غير موجود' }, 404);
      const safe = {
        id: exam.id,
        title: exam.title,
        bookTitle: exam.bookTitle,
        chapterTitles: exam.chapterTitles,
        level: exam.level,
        lang: exam.lang,
        questions: exam.questions.map((q) =>
          q.type === 'mcq'
            ? { id: q.id, type: q.type, topic: q.topic, points: q.points, question: q.question, options: q.options }
            : { id: q.id, type: q.type, topic: q.topic, points: q.points, question: q.question }
        ),
        createdAt: exam.createdAt,
      };
      return json({ exam: safe });
    }
    if (method === 'DELETE') {
      await deleteExam(examId);
      return json({ ok: true });
    }
    return json({ error: 'غير مسموح' }, 405);
  }

  // ---------- results ----------
  if (pathname === '/api/results') {
    if (method === 'GET') {
      const results = (await listResults()).map((r) => ({
        id: r.id,
        examId: r.examId,
        examTitle: r.examTitle,
        bookTitle: r.bookTitle,
        level: r.level,
        percent: r.percent,
        totalScore: r.totalScore,
        totalPoints: r.totalPoints,
        takenAt: r.takenAt,
        weakTopics: r.analysis?.weakTopics || [],
      }));
      return json({ results });
    }
    return json({ error: 'غير مسموح' }, 405);
  }
  const resultsRe = /^\/api\/results\/([^/]+)$/;
  m = pathname.match(resultsRe);
  if (m) {
    const id = decodeURIComponent(m[1]);
    if (method === 'GET') {
      const r = await getResult(id);
      if (!r) return json({ error: 'النتيجة غير موجودة' }, 404);
      return json({ result: r });
    }
    if (method === 'DELETE') {
      await deleteResult(id);
      return json({ ok: true });
    }
    return json({ error: 'غير مسموح' }, 405);
  }

  // ---------- weak topics ----------
  if (pathname === '/api/weak-topics') {
    const results = await listResults();
    const count = {};
    const total = {};
    for (const r of results) {
      for (const q of r.questions || []) {
        const t = q.topic || 'عام';
        total[t] = (total[t] || 0) + 1;
        if (!q.correct) count[t] = (count[t] || 0) + 1;
      }
    }
    const topics = Object.keys(total).sort().map((t) => ({
      topic: t, total: total[t], weak: count[t] || 0,
      weakPct: Math.round(((count[t] || 0) / total[t]) * 100),
    })).sort((a, b) => b.weakPct - a.weakPct);
    return json({ topics });
  }

  if (pathname === '/api/health') {
    return json({ ok: true, time: Date.now() });
  }

  return json({ error: 'المسار غير موجود' }, 404);
}

function jsonResponse(promise) {
  return promise.then((obj) => json(obj, obj?.status || 200)).catch((e) =>
    json({ error: e?.message || String(e) }, e?.status || 500)
  );
}

/* ==================== BOOK UPLOAD ==================== */
async function* uploadBookStream(file, title, maxPages) {
  yield { type: 'start', phase: 'load', percent: 2 };
  const buffer = await file.arrayBuffer();
  const pending = [];
  let ready = false;
  const resultPromise = extractPdf(new Uint8Array(buffer), {
    maxPages,
    onProgress: (p) => pending.push(p),
  }).then((r) => { ready = true; return r; });

  while (!ready || pending.length) {
    while (pending.length) {
      const p = pending.shift();
      yield { type: 'progress', phase: p.phase, page: p.page, total: p.total, percent: p.percent };
    }
    await tick();
  }
  const result = await resultPromise;

  yield { type: 'progress', phase: 'chapters', percent: 100 };
  const id = uid();
  const book = await saveBook({
    id,
    title,
    fileName: file.name,
    size: file.size,
    pageCount: result.pageCount,
    extractedPages: result.extractedPages,
    empty: result.empty,
    createdAt: Date.now(),
    chapters: result.chapters,
  });
  await savePages(id, result.pages);
  await idbSet('files', id, file);

  yield {
    type: 'result',
    percent: 100,
    book,
    warnings: [
      result.empty ? 'الكتاب يبدو ممسوحاً ضوئياً بدون نص قابل للاستخراج. ستكون الشرح والأسئلة محدودة.' : null,
      maxPages > 0 && result.extractedPages < result.pageCount ? `تم استخراج أول ${result.extractedPages} صفحة فقط.` : null,
    ].filter(Boolean),
  };
}

/* ==================== EXPLAIN / CHAT / SUMMARIZE ==================== */
async function* explainStream(body) {
  const { bookId, chapterId, lang, visualize } = body;
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) { yield { type: 'error', error: 'الفصل أو الكتاب غير موجود' }; return; }
  yield { type: 'start' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) {
    yield { type: 'error', error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' };
    return;
  }
  const msgs = explainMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang, visualize: !!visualize });
  for await (const chunk of streamChat(msgs)) {
    yield { type: 'chunk', text: chunk };
  }
  yield { type: 'done' };
}

async function* chatStream(body) {
  const { bookId, chapterId, lang, history } = body;
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) { yield { type: 'error', error: 'الفصل أو الكتاب غير موجود' }; return; }
  yield { type: 'start' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) {
    yield { type: 'error', error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' };
    return;
  }
  const msgs = chatMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang, history });
  for await (const chunk of streamChat(msgs)) {
    yield { type: 'chunk', text: chunk };
  }
  yield { type: 'done' };
}

async function summarizeHandler(body) {
  const { bookId, chapterId, lang } = body;
  const book = await getBook(bookId);
  const chapter = await getChapterById(book, chapterId);
  if (!book || !chapter) return { status: 404, error: 'الفصل أو الكتاب غير موجود' };
  const pages = await getPages(bookId);
  const text = sliceContext(chapterText(pages, chapter), MAX_CTX);
  if (!text.trim()) return { status: 400, error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' };
  const msgs = summaryMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang });
  const summary = await chat(msgs, { maxTokens: 4000 });
  return { summary };
}

/* ==================== EXAMS ==================== */
async function createExamHandler(body) {
  const { bookId, chapterIds, level = 'medium', types = ['mcq', 'concept'], count = 8, lang } = body;
  const book = await getBook(bookId);
  if (!book) return { status: 404, error: 'الكتاب غير موجود' };
  const chapters = (book.chapters || []).filter((c) => chapterIds.includes(c.id));
  if (!chapters.length) return { status: 400, error: 'اختر فصلاً واحداً على الأقل' };

  const block = await buildChapterBlock(book, chapters);
  const msgs = examMessages({ bookTitle: book.title, chapters: block, level, types, count, lang });
  const content = await chat(msgs, { json: true, maxTokens: 16000, temperature: 0.6 });
  let parsed;
  try {
    parsed = parseJson(content);
  } catch {
    parsed = null;
  }
  const questions = parsed?.questions || [];
  if (!questions.length) throw new Error('الموديل لم يرجع أسئلة صحيحة.');

  const pointsMap = { mcq: 1, concept: 2, problem: 3 };
  const cleaned = questions.map((q, i) => ({
    id: `q-${i + 1}`,
    type: q.type || 'mcq',
    topic: String(q.topic || '').slice(0, 120) || 'عام',
    points: pointsMap[q.type] || 2,
    question: String(q.question || '').trim(),
    options: Array.isArray(q.options) ? q.options.map((o) => String(o)) : [],
    answerIndex: q.answerIndex,
    modelAnswer: String(q.modelAnswer || q.explanation || '').trim(),
    explanation: String(q.explanation || '').trim(),
  })).filter((q) => q.question);

  const exam = await saveExam({
    id: uid(),
    bookId: book.id,
    bookTitle: book.title,
    chapterTitles: chapters.map((c) => c.title),
    title: examTitlePrompt({ bookTitle: book.title, chapters, level, lang }),
    level,
    lang,
    questions: cleaned,
    createdAt: Date.now(),
  });
  return { exam };
}

async function gradeQuestion(q, answer, lang) {
  if (q.type === 'mcq') {
    const chosen = parseInt(answer?.answerIndex, 10);
    const correct = chosen === q.answerIndex;
    return {
      id: q.id,
      type: q.type,
      topic: q.topic,
      points: q.points,
      score: correct ? q.points : 0,
      correct,
      chosen,
      correctAnswer: q.answerIndex,
      explanation: q.explanation || '',
      modelAnswer: q.modelAnswer,
    };
  }
  const text = String(answer?.text || '').trim();
  const score = text ? null : 0;
  let grade = {
    id: q.id,
    type: q.type,
    topic: q.topic,
    points: q.points,
    score: 0,
    correct: false,
    explanation: q.explanation || '',
    modelAnswer: q.modelAnswer,
  };
  if (score === null) {
    try {
      const msgs = gradeMessages({
        question: q.question,
        modelAnswer: q.modelAnswer,
        studentAnswer: text,
        points: q.points,
        lang,
        type: q.type,
      });
      const out = await chatJson(msgs, { maxTokens: 1200, temperature: 0.2 });
      const s = Math.max(0, Math.min(q.points, Number(out?.score) || 0));
      grade = {
        ...grade,
        score: s,
        correct: s >= q.points * 0.7,
        feedback: out?.feedback || '',
        keyPoints: out?.keyPointsCovered || [],
        missing: out?.missingPoints || [],
      };
    } catch (e) {
      grade.score = 0;
      grade.feedback = 'تعذّر تقييم الموديل هذه الإجابة: ' + (e?.message || e);
    }
  }
  return grade;
}

async function* submitExamStream(examId, body) {
  const exam = await getExam(examId);
  if (!exam) { yield { type: 'error', error: 'الامتحان غير موجود' }; return; }
  const answers = body.answers || {};
  const lang = exam.lang || 'ar';
  const questions = exam.questions;
  const total = questions.length;

  yield { type: 'start', total };
  const results = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answers[q.id];
    if (!a) {
      results.push({
        id: q.id, type: q.type, topic: q.topic, points: q.points, score: 0, correct: false, unanswered: true,
        explanation: q.explanation || '', modelAnswer: q.modelAnswer,
      });
      yield { type: 'progress', phase: 'grading', graded: i + 1, total, current: q.topic, unanswered: true };
      continue;
    }
    try {
      const graded = await gradeQuestion(q, a, lang);
      results.push(graded);
    } catch (e) {
      results.push({
        id: q.id, type: q.type, topic: q.topic, points: q.points, score: 0, correct: false,
        explanation: q.explanation || '', modelAnswer: q.modelAnswer,
        feedback: 'تعذّر التصحيح: ' + (e?.message || e),
      });
    }
    yield { type: 'progress', phase: 'grading', graded: i + 1, total, current: q.topic };
    await new Promise((r) => setTimeout(r, 400));
  }

  const totalPoints = results.reduce((s, r) => s + r.points, 0);
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const percent = totalPoints ? Math.round((totalScore / totalPoints) * 100) : 0;

  yield { type: 'progress', phase: 'analysis', graded: total, total, current: null };
  let analysis = null;
  try {
    const msgs = analysisMessages({
      examTitle: exam.title,
      items: results.map((r) => ({
        type: r.type, topic: r.topic, score: r.score, points: r.points,
        correct: r.correct, short: r.feedback || r.explanation,
      })),
      lang,
    });
    analysis = await chatJson(msgs, { maxTokens: 1500, temperature: 0.3 });
  } catch (e) {
    analysis = { weakTopics: [], strengths: [], recommendations: [], note: 'تعذّر توليد التحليل: ' + (e?.message || e) };
  }

  const result = await saveResult({
    id: uid(),
    examId: exam.id,
    examTitle: exam.title,
    bookTitle: exam.bookTitle,
    level: exam.level,
    lang,
    totalPoints,
    totalScore,
    percent,
    questions: results,
    analysis,
    takenAt: Date.now(),
  });

  yield { type: 'result', result };
}

/* ==================== FETCH INTERCEPTOR ==================== */
const realFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  let url;
  if (typeof input === 'string') url = new URL(input, location.href);
  else if (input instanceof URL) url = new URL(input.href);
  else if (input && input.url) url = new URL(input.url);
  else return realFetch(input, init);

  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    return handleApi((init.method || 'GET').toUpperCase(), url.pathname, init);
  }
  return realFetch(input, init);
};

console.log('[SmartTutor] in-browser backend ready');

/* Expose internals for the PDF side-panel viewer */
window.__SMART = {
  pdfjs,
  getOriginalFile: (id) => idbGet('files', id),
  getBook: (id) => getBook(id),
};