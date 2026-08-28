import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import { extractPdf, chapterText, sliceContext } from './src/pdf.js';
import * as store from './src/store.js';
import * as ai from './src/ai.js';
import * as prompts from './src/prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

const MAX_CTX = 14000;

// ---------- helpers ----------
function getChapterById(book, chapterId) {
  if (chapterId === '__all__') {
    const pages = store.getPages(book.id);
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

function buildChapterBlock(book, chapters) {
  const pages = store.getPages(book.id);
  return chapters.map((c) => ({ title: c.title, text: sliceContext(chapterText(pages, c), MAX_CTX) }));
}

// ---------- settings ----------
app.get('/api/settings', (req, res) => {
  const s = store.getSettings();
  res.json({
    provider: s.provider,
    model: s.model,
    openrouterKey: s.openrouterKey ? 'set' : '',
    moonshotKey: s.moonshotKey ? 'set' : '',
    lang: s.lang,
    freeModels: ai.FREE_MODELS,
    moonshotModels: ai.MOONSHOT_MODELS,
  });
});

app.put('/api/settings', (req, res) => {
  const { provider, model, openrouterKey, moonshotKey, lang } = req.body || {};
  const saved = store.saveSettings({
    ...(provider ? { provider } : {}),
    ...(model ? { model } : {}),
    ...(openrouterKey ? { openrouterKey } : {}),
    ...(moonshotKey ? { moonshotKey } : {}),
    ...(lang ? { lang } : {}),
  });
  res.json({ ok: true, provider: saved.provider, model: saved.model, lang: saved.lang });
});

// ---------- books ----------
app.post('/api/books', upload.single('file'), async (req, res) => {
  let out = null;
  const send = (obj) => {
    if (!out) return;
    try { out.write(`data: ${JSON.stringify(obj)}\n\n`); } catch { }
  };
  try {
    if (!req.file) {
      res.status(400).json({ error: 'لا يوجد ملف' });
      return;
    }
    if (!/\.pdf$/i.test(req.file.originalname)) {
      res.status(400).json({ error: 'يرجى رفع ملف PDF فقط' });
      return;
    }
    const maxPages = parseInt(req.body.maxPages || '0', 10) || 0;

    // ابدأ بث التقدم قبل معالجة الملف
    out = sse(req, res);
    send({ type: 'start', phase: 'load', percent: 2 });

    const result = await extractPdf(req.file.buffer, {
      maxPages,
      onProgress: (p) => send({ type: 'progress', phase: p.phase, page: p.page, total: p.total, percent: p.percent }),
    });

    const id = store.uid();
    const title = (req.body.title || '').trim() || req.file.originalname.replace(/\.pdf$/i, '');
    const book = store.saveBook({
      id,
      title,
      fileName: req.file.originalname,
      size: req.file.size,
      pageCount: result.pageCount,
      extractedPages: result.extractedPages,
      empty: result.empty,
      createdAt: Date.now(),
      chapters: result.chapters,
    });
    store.savePages(id, result.pages);

    send({
      type: 'result',
      percent: 100,
      book,
      warnings: [
        result.empty ? 'الكتاب يبدو ممسوحاً ضوئياً بدون نص قابل للاستخراج. ستكون الشرح والأسئلة محدودة.' : null,
        maxPages > 0 && result.extractedPages < result.pageCount ? `تم استخراج أول ${result.extractedPages} صفحة فقط.` : null,
      ].filter(Boolean),
    });
    out.end();
    out = null;
  } catch (e) {
    console.error(e);
    if (out) {
      send({ type: 'error', error: 'تعذّر قراءة الملف: ' + (e?.message || e) });
      out.end();
      out = null;
    } else {
      res.status(400).json({ error: 'تعذّر قراءة الملف: ' + (e?.message || e) });
    }
  }
});

app.get('/api/books', (req, res) => {
  const books = store.listBooks().map((b) => ({
    id: b.id,
    title: b.title,
    pageCount: b.pageCount,
    extractedPages: b.extractedPages,
    empty: b.empty,
    createdAt: b.createdAt,
    chapters: b.chapters || [],
  }));
  res.json({ books });
});

app.get('/api/books/:id', (req, res) => {
  const book = store.getBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'الكتاب غير موجود' });
  res.json({ book });
});

app.put('/api/books/:id/chapters', (req, res) => {
  const book = store.getBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'الكتاب غير موجود' });
  const chapters = req.body.chapters;
  if (!Array.isArray(chapters) || !chapters.length) return res.status(400).json({ error: 'قائمة فصول غير صالحة' });
  book.chapters = chapters.map((c, i) => ({
    id: c.id || `ch-${i + 1}`,
    title: String(c.title || '').trim() || `الفصل ${i + 1}`,
    pageStart: Math.max(1, parseInt(c.pageStart, 10) || 1),
    pageEnd: Math.max(parseInt(c.pageStart, 10) || 1, parseInt(c.pageEnd, 10) || 1),
    pageCount: Math.max(1, (parseInt(c.pageEnd, 10) || 1) - (parseInt(c.pageStart, 10) || 1) + 1),
  }));
  store.saveBook(book);
  res.json({ ok: true, book });
});

app.delete('/api/books/:id', (req, res) => {
  store.deleteBook(req.params.id);
  res.json({ ok: true });
});

// ---------- explain / chat / summary (SSE) ----------
function sse(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  return res;
}

app.post('/api/explain', async (req, res) => {
  const { bookId, chapterId, lang } = req.body || {};
  const book = store.getBook(bookId);
  const chapter = getChapterById(book, chapterId);
  if (!book || !chapter) return res.status(404).json({ error: 'الفصل أو الكتاب غير موجود' });

  const out = sse(req, res);
  const send = (obj) => { try { out.write(`data: ${JSON.stringify(obj)}\n\n`); } catch { } };
  try {
    send({ type: 'start' });
    const text = sliceContext(chapterText(store.getPages(bookId), chapter), MAX_CTX);
    if (!text.trim()) {
      send({ type: 'error', error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' });
      out.end();
      return;
    }
    const msgs = prompts.explainMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang });
    for await (const chunk of ai.streamChat(msgs)) {
      send({ type: 'chunk', text: chunk });
    }
    send({ type: 'done' });
    out.end();
  } catch (e) {
    send({ type: 'error', error: e?.message || String(e) });
    out.end();
  }
});

app.post('/api/chat', async (req, res) => {
  const { bookId, chapterId, lang, history } = req.body || {};
  const book = store.getBook(bookId);
  const chapter = getChapterById(book, chapterId);
  if (!book || !chapter) return res.status(404).json({ error: 'الفصل أو الكتاب غير موجود' });

  const out = sse(req, res);
  const send = (obj) => { try { out.write(`data: ${JSON.stringify(obj)}\n\n`); } catch { } };
  try {
    send({ type: 'start' });
    const text = sliceContext(chapterText(store.getPages(bookId), chapter), MAX_CTX);
    if (!text.trim()) {
      send({ type: 'error', error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' });
      out.end();
      return;
    }
    const msgs = prompts.chatMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang, history });
    for await (const chunk of ai.streamChat(msgs)) {
      send({ type: 'chunk', text: chunk });
    }
    send({ type: 'done' });
    out.end();
  } catch (e) {
    send({ type: 'error', error: e?.message || String(e) });
    out.end();
  }
});

app.post('/api/summarize', async (req, res) => {
  const { bookId, chapterId, lang } = req.body || {};
  const book = store.getBook(bookId);
  const chapter = getChapterById(book, chapterId);
  if (!book || !chapter) return res.status(404).json({ error: 'الفصل أو الكتاب غير موجود' });
  try {
    const text = sliceContext(chapterText(store.getPages(bookId), chapter), MAX_CTX);
    if (!text.trim()) return res.status(400).json({ error: 'لا يوجد نص مستخرج لهذا الفصل. أعد رفع الكتاب دون تحديد حد أقصى لعدد الصفحات.' });
    const msgs = prompts.summaryMessages({ bookTitle: book.title, chapterTitle: chapter.title, chapterText: text, lang });
    const summary = await ai.chat(msgs, { maxTokens: 4000 });
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

// ---------- exams ----------
app.post('/api/exams', async (req, res) => {
  const { bookId, chapterIds, level = 'medium', types = ['mcq', 'concept'], count = 8, lang } = req.body || {};
  const book = store.getBook(bookId);
  if (!book) return res.status(404).json({ error: 'الكتاب غير موجود' });
  const chapters = (book.chapters || []).filter((c) => chapterIds.includes(c.id));
  if (!chapters.length) return res.status(400).json({ error: 'اختر فصلاً واحداً على الأقل' });

  try {
    const block = buildChapterBlock(book, chapters);
    const msgs = prompts.examMessages({ bookTitle: book.title, chapters: block, level, types, count, lang });
    const content = await ai.chat(msgs, { json: true, maxTokens: 16000, temperature: 0.6 });
    let parsed;
    try {
      parsed = ai.parseJson(content);
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

    const exam = store.saveExam({
      id: store.uid(),
      bookId: book.id,
      bookTitle: book.title,
      chapterTitles: chapters.map((c) => c.title),
      title: prompts.examTitlePrompt({ bookTitle: book.title, chapters, level, lang }),
      level,
      lang,
      questions: cleaned,
      createdAt: Date.now(),
    });
    res.json({ exam });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

app.get('/api/exams', (req, res) => {
  const list = store.listExams(req.query.bookId).map((e) => ({
    id: e.id,
    title: e.title,
    bookTitle: e.bookTitle,
    level: e.level,
    lang: e.lang,
    questionCount: (e.questions || []).length,
    createdAt: e.createdAt,
    taken: !!store.getResultByExam?.(e.id),
  }));
  res.json({ exams: list });
});

app.get('/api/exams/:id', (req, res) => {
  const exam = store.getExam(req.params.id);
  if (!exam) return res.status(404).json({ error: 'الامتحان غير موجود' });
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
  res.json({ exam: safe });
});

app.delete('/api/exams/:id', (req, res) => {
  store.deleteExam(req.params.id);
  res.json({ ok: true });
});

// ---------- grading ----------
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
      const msgs = prompts.gradeMessages({
        question: q.question,
        modelAnswer: q.modelAnswer,
        studentAnswer: text,
        points: q.points,
        lang,
        type: q.type,
      });
      const out = await ai.chatJson(msgs, { maxTokens: 1200, temperature: 0.2 });
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

app.post('/api/exams/:id/submit', async (req, res) => {
  const exam = store.getExam(req.params.id);
  if (!exam) return res.status(404).json({ error: 'الامتحان غير موجود' });
  const answers = req.body.answers || {};
  const lang = exam.lang || 'ar';

  const out = sse(req, res);
  const send = (obj) => { try { out.write(`data: ${JSON.stringify(obj)}\n\n`); } catch { } };
  const questions = exam.questions;
  const total = questions.length;

  send({ type: 'start', total });
  const results = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answers[q.id];
    if (!a) {
      results.push({
        id: q.id, type: q.type, topic: q.topic, points: q.points, score: 0, correct: false, unanswered: true,
        explanation: q.explanation || '', modelAnswer: q.modelAnswer,
      });
      send({ type: 'progress', phase: 'grading', graded: i + 1, total, current: q.topic, unanswered: true });
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
    send({ type: 'progress', phase: 'grading', graded: i + 1, total, current: q.topic });
    await new Promise((r) => setTimeout(r, 400));
  }

  const totalPoints = results.reduce((s, r) => s + r.points, 0);
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const percent = totalPoints ? Math.round((totalScore / totalPoints) * 100) : 0;

  // analysis
  send({ type: 'progress', phase: 'analysis', graded: total, total, current: null });
  let analysis = null;
  try {
    const msgs = prompts.analysisMessages({
      examTitle: exam.title,
      items: results.map((r) => ({
        type: r.type, topic: r.topic, score: r.score, points: r.points,
        correct: r.correct, short: r.feedback || r.explanation,
      })),
      lang,
    });
    analysis = await ai.chatJson(msgs, { maxTokens: 1500, temperature: 0.3 });
  } catch (e) {
    analysis = { weakTopics: [], strengths: [], recommendations: [], note: 'تعذّر توليد التحليل: ' + (e?.message || e) };
  }

  const result = store.saveResult({
    id: store.uid(),
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

  send({ type: 'result', result });
  out.end();
});

// ---------- results ----------
app.get('/api/results', (req, res) => {
  res.json({ results: store.listResults().map((r) => ({
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
  })) });
});

app.get('/api/results/:id', (req, res) => {
  const r = store.getResult(req.params.id);
  if (!r) return res.status(404).json({ error: 'النتيجة غير موجودة' });
  res.json({ result: r });
});

app.delete('/api/results/:id', (req, res) => {
  store.deleteResult(req.params.id);
  res.json({ ok: true });
});

// ---------- weak topics summary ----------
app.get('/api/weak-topics', (req, res) => {
  const results = store.listResults();
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
  res.json({ topics });
});

// ---------- health ----------
app.get('/api/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// ---------- معالج أخطاء موحد ----------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const isMulter = err instanceof multer.MulterError || err?.name === 'MulterError';
  if (isMulter) {
    let msg = 'خطأ في رفع الملف: ' + err.message;
    if (err.code === 'LIMIT_FILE_SIZE') msg = 'الملف أكبر من الحد المسموح (80MB). قلّل الحجم أو جرّب ملفاً أصغر.';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'يرجى رفع ملف واحد فقط بصيغة PDF.';
    return res.status(400).json({ error: msg });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'البيانات المرسلة كبيرة جداً.' });
  }
  console.error('UNHANDLED:', err);
  res.status(500).json({ error: 'خطأ داخلي في الخادم: ' + (err?.message || err) });
});

app.listen(PORT, () => {
  console.log(`\n  المدرّس الذكي يعمل على:  http://localhost:${PORT}\n`);
});