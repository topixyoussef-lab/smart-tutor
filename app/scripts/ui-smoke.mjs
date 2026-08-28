// اختبار UI في بيئة DOM حقيقية (jsdom) ضد الخادم الحي
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:3000';
const html = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: BASE,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
});

const { window } = dom;
const realFetch = globalThis.fetch;
window.fetch = async (url, opts = {}) => realFetch(new URL(url, BASE).href, opts);
window.marked = { parse: (s) => String(s || '') };
window.DOMPurify = { sanitize: (s) => String(s || '') };
// scrollTo غير موجود في jsdom
window.scrollTo = () => {};

const errors = [];
window.addEventListener('error', (e) => errors.push('WINDOW ERROR: ' + e.message));

const ev = (code) => window.eval(code);

async function waitInit(ms = 12000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      if (ev('typeof state !== "undefined" && !!state.settings && typeof renderBooks === "function"')) {
        return ev('state.books.length');
      }
    } catch { }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('init لم يكتمل');
}

let booksCount;
try { booksCount = await waitInit(); console.log('✓ init اكتمل، عدد الكتب =', booksCount); }
catch (e) { booksCount = -1; console.error('init fail:', e.message); }

const checks = [];
const run = (name, fn) => {
  try { fn(); checks.push('✓ ' + name); }
  catch (e) { checks.push('✗ ' + name + ' => ' + e.message); errors.push(name + ': ' + e.message); }
};

ev('switchTab("library")'); await new Promise((r) => setTimeout(r, 300));
run('renderBooks (بعد init) => DOM contains book', () => {
  const htmlNow = window.document.getElementById('booksGrid')?.innerHTML || '';
  if (!htmlNow.includes('sample-physics')) throw new Error('الكتاب غير مرسوم');
});

ev('switchTab("learn")');
run('fill learn selects', () => {
  ev(`state.learn.bookId = state.books[0]?.id; state.learn.chapterId = state.books[0]?.chapters?.[0]?.id; fillLearnSelects();`);
  const sel = window.document.getElementById('learnChapter');
  if (sel.options.length < 2) throw new Error('فصول غير ممتلئة');
});

ev('switchTab("exams")'); ev('state.examTaking = null');
run('renderExamsView (بعد اختيار كتاب)', () => {
  ev('renderExamsView()');
  ev(`const b = state.books[0]; if (b) { const sel = document.getElementById("examBook"); sel.value = b.id; renderExamChapterCheckboxes(); }`);
  const wrap = window.document.getElementById('examChapters');
  if (!wrap || wrap.querySelectorAll('.exam-ch').length === 0) throw new Error('لا فصول في نموذج الامتحان');
});

ev('switchTab("results")');
run('renderResultsView', () => { ev('renderResultsView()'); });

ev('switchTab("settings")');
run('renderSettings + populateModelSelect', () => { ev('renderSettings(); populateModelSelect();'); });

// رسم امتحان وهمي
run('renderExamTaking وهمي', () => {
  ev(`state.examTaking = { id:'x', title:'ت', bookTitle:'b', level:'medium',
       questions:[
         {id:'q1',type:'mcq',topic:'حركة',points:1,question:'اختبار؟',options:['أ','ب','ج','د']},
         {id:'q2',type:'problem',topic:'قوانين',points:3,question:'مسألة؟'},
         {id:'q3',type:'concept',topic:'مفاهيم',points:2,question:'مفهوم؟'}
       ]}; renderExamTaking();`);
  const wrap = window.document.getElementById('examsList');
  if (!wrap || !wrap.innerHTML.includes('q1')) throw new Error('الامتحان غير مرسوم');
});

// قراءة إجابات فارغة
run('answersFromForm فارغ => لا يرمي', () => {
  const a = ev('answersFromForm()');
  if (Object.keys(a).length !== 0) throw new Error('مفروض فارغ');
});

// كتابة إجابة MCQ وقراءتها
run('answersFromForm يلتقط اختيار MCQ', () => {
  const radio = window.document.querySelector('input[name="ansq-q1"]');
  if (!radio) throw new Error('لا radio');
  radio.value = '1'; radio.checked = true;
  const a = ev('answersFromForm()');
  if (!a.q1 || a.q1.answerIndex !== 1) throw new Error('لم يلتقط الاختيار');
});

checks.forEach((c) => console.log(c));
if (errors.length) {
  console.error('\n=== أخطاء ===');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}
console.log('\nنجح كل شيء — لا أخطاء Runtime في واجهة المستخدم.');