// اختبار شامل E2E: شرالشرح + ملخص + توليد امتحان + تصحيح (مع AI حقيقي)
const BASE = 'http://localhost:3000';

async function j(path, opts = {}) {
  const init = { method: opts.method || 'GET', headers: { 'Content-Type': 'application/json' } };
  if (opts.body) init.body = JSON.stringify(opts.body);
  const res = await fetch(BASE + path, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} -> ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function streamExplain(payload) {
  const res = await fetch(BASE + '/api/explain', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('explain ' + res.status);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '';
  const timer = setTimeout(() => reader.cancel('timeout'), 90000);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() || '';
    for (const p of parts) {
      if (!p.trim().startsWith('data:')) continue;
      const obj = JSON.parse(p.trim().slice(5));
      if (obj.type === 'chunk') full += obj.text;
      if (obj.type === 'error') throw new Error(obj.error);
    }
  }
  clearTimeout(timer);
  return full;
}

const books = await j('/api/books');
const book = books.books.find((b) => !b.empty) || books.books[0];
console.log('=> استخدام الكتاب:', book?.title, '| فصول:', book?.chapters?.length);
if (!book?.chapters?.length) { console.log('لا فصول — لا يمكن متابعة الاختبار'); process.exit(0); }

const ch = book.chapters[1] || book.chapters[0];
console.log('=> فصل للاختبار:', ch.title, ch.pageStart, '-', ch.pageEnd);

console.log('\n---[1] الشرح (streaming) ---');
try {
  const out = await streamExplain({ bookId: book.id, chapterId: ch.id, lang: 'ar' });
  console.log('الشرح المستلم:', out.length, 'حرف');
  console.log('أول 220 حرف:', out.slice(0, 220).replace(/\n+/g, ' '));
} catch (e) { console.log('فشل:', e.message); }

console.log('\n---[2] الملخص ---');
try {
  const { summary } = await j('/api/summarize', { method: 'POST', body: { bookId: book.id, chapterId: ch.id, lang: 'ar' } });
  console.log('الملخص:', summary.slice(0, 250).replace(/\n+/g, ' '));
} catch (e) { console.log('فشل:', e.message); }

console.log('\n---[3] توليد امتحان ---');
let exam = null;
try {
  exam = await j('/api/exams', {
    method: 'POST',
    body: { bookId: book.id, chapterIds: [ch.id], level: 'medium', types: ['mcq', 'concept'], count: 6, lang: 'ar' },
  });
  console.log('تم التوليد:', exam.exam.title);
  console.log('عدد الأسئلة:', exam.exam.questions.length);
  console.log('الأسئلة:', exam.exam.questions.map((q) => `[${q.type}] ${q.question.slice(0, 60)}`).join('\n  - '));
} catch (e) { console.log('فشل توليد الامتحان:', e.message); }

if (exam) {
  console.log('\n---[4] تصحيح الامتحان (مع إجابات + تتبع التقدم) ---');
  const answers = {};
  exam.exam.questions.forEach((q, i) => {
    if (q.type === 'mcq') answers[q.id] = { answerIndex: (i + q.answerIndex + 1) % q.options.length };
    else answers[q.id] = { text: 'القانون الأساسي هو: الموقع والسرعة والعجلة مرتبطة بقوانين الحركة، والعجلة معدل تغير السرعة مع الزمن. الحل يطبق F = ma مع وحدات النظام الدولي.' };
  });
  try {
    const res = await fetch(BASE + `/api/exams/${exam.exam.id}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('submit ' + res.status);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', result = null, events = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() || '';
      for (const p of parts) {
        if (!p.trim().startsWith('data:')) continue;
        const obj = JSON.parse(p.trim().slice(5).trim());
        events.push(obj);
        if (obj.type === 'progress' && obj.phase === 'grading') process.stdout.write('.');
      }
    }
    result = events.find((e) => e.type === 'result')?.result;
    console.log('\nأحداث progress استُلمت:', events.filter((e) => e.type === 'progress').length, 'حدث');
    console.log('الدرجة:', result.totalScore + '/' + result.totalPoints, '(' + result.percent + '%)');
    console.log('نقاط الضعف:', JSON.stringify(result.analysis?.weakTopics));
    console.log('التوصيات:', JSON.stringify(result.analysis?.recommendations || []).slice(0, 300));
  } catch (e) { console.log('فشل التصحيح:', e.message); }
}

console.log('\n---[5] الكونtrol النتائج ---');
try {
  const { results } = await j('/api/results');
  console.log('عدد النتائج:', results.length);
  const { topics } = await j('/api/weak-topics');
  console.log('نقاط الضعف المتراكمة:', JSON.stringify(topics));
} catch (e) { console.log('فشل جلب النتائج:', e.message); }

console.log('\nتم الاختبار.');