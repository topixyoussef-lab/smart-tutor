/* ================= المُدرِّس الذكي — واجهة المستخدم ================= */
const $ = (sel) => document.querySelector(sel);

const LABELS = {
  ar: {
    tagline: 'ارفع كتابك، تعلّمه، واختبر نفسك بالذكاء الاصطناعي',
    tabLibrary: 'المكتبة', tabLearn: 'الشرح', tabExams: 'الامتحانات', tabResults: 'النتائج', tabSettings: 'الإعدادات',
    addBook: 'إضافة كتاب PDF', dropHint: 'اسحب ملف PDF هنا أو انقر للاختيار', orClick: 'يدعم الكتب الكبيرة (حتى 80MB)',
    btnUpload: 'رفع الكتاب وتحليل فعوله', myBooks: 'كتبي',
    lblBook: 'الكتاب', lblChapter: 'الفصل', lblExplainStyle: 'أسلوب الشرح', lblChapters: 'الفصول المشمولة', lblLevel: 'المستوى', lblTypes: 'أنواع الأسئلة', lblCount: 'عدد الأسئلة', lblExamLang: 'لغة الامتحان', lblProvider: 'مزوّد الذكاء الاصطناعي', lblModel: 'الموديل', lblKey: 'مفتاح API', lblUILang: 'لغة الواجهة',
    styleDetailed: 'شرح مفصّل', styleSimple: 'مبسّط', styleExamFocus: 'مركّز للامتحانات',
    fsEnter: 'ملء الشاشة', fsExit: 'الخروج من ملء الشاشة',
    btnExplain: 'اشرح لي', btnDiagram: '🌐 الرسم والمخططات', btnSummary: 'ملخص', btnStop: 'إيقاف', btnSend: 'إرسال', btnGenerate: 'توليد الامتحان', btnSave: 'حفظ',
    askFollowUp: 'اسأل عن هذا الفصل', newExam: 'امتحان جديد', myExams: 'الامتحانات',
    pdfPaneTitle: '📄 صفحات الكتاب',
    pdfShow: '📄 صفحات الكتاب', pdfHide: 'إخفاء صفحات الكتاب', pdfRangeHint: 'صفحات الفصل:',
    panePdfTab: '📄 صفحات الكتاب', paneDiagramTab: '🌐 الرسم والمخططات', diagramTitle: 'Visual/Diagram-based Explanation — الشرح باستخدام الرسوم والمخططات (Flowchart)',
    diagramThinking: 'جاري رسم مخطط الفصل...', diagramNoApi: 'أضف مفتاح API من الإعدادات أولاً',
    lvEasy: 'سهل', lvMedium: 'متوسط', lvHard: 'صعب',
    typeConcept: 'مفهومي', typeProblem: 'مسائل',
    topicsSummary: 'نقاط الضعف الأكثر تكراراً ', history: 'تاريخ الاختبارات',
    aiProvider: 'إعدادات الذكاء الاصطناعي', settingsNote: 'المفاتيح تُحفظ محلياً على جهازك فقط (في ملف data داخل المجلد) ولا تُرفع لأي مكان. موديلات :free على OpenRouter مجانية 100%.',
    settingsSaved: 'تم حفظ الإعدادات بنجاح', chooseBookFirst: 'اختر كتاباً أولاً', noChapters: 'لم يُعثر على فصول. يمكنك إضافتها يدوياً من المكتبة.', chooseChapter: 'اختر فصلاً', wholeBook: 'الكتاب كاملاً', goToExplainHint: 'انتقلنا لتبويب الشرح — اختر فصلاً ثم اضغط "اشرح لي"', genStarted: 'جاري توليد الامتحان بواسطة الذكاء الاصطناعي... قد يستغرق دقيقة', examGenerated: 'تم توليد الامتحان بنجاح',
    noExams: 'لم تنشئ أي امتحان بعد. ابدأ بالتوليد الآن!', noResults: 'لا توجد نتائج بعد. جرّب امتحاناً!',
    startText: 'ابدأ الامتحان', retake: 'إعادة المحاولة', view: 'المعاينة', del: 'حذف',
    yourAnswer: 'إجابتك', correctAnswer: 'الإجابة الصحيحة', explanation: 'الشرح', feedback: 'التقييم', whatYouCovered: 'ما أجبت عنه صحيحاً', whatMissing: 'ما فاتك / احتاج مراجعة', modelAnswer: 'الحل النموذجي',
    scoreTitle: 'النتيجة', weakTitle: 'مواضيع تحتاج مراجعة', strongTitle: 'نقاط قوتك', recoTitle: 'خطة المراجعة المقترحة',
    unanswered: 'لم تجب', typeLabel: { mcq: 'اختيار من متعدد', concept: 'مفهومي', problem: 'مسألة' },
    weakTopics: 'نقاط الضعف', strengths: 'نقاط القوة', recommendations: 'توصيات',
    genError: 'خطأ أثناء توليد الامتحان', submitExam: 'تسليم الامتحان', confirmedSubmit: 'متأكد من تسليم الامتحان؟ لن تتمكن من التعديل بعدها.',
    uploadSuccess: 'تم رفع الكتاب وفصل الفصول تلقائياً', uploadFail: 'فشل رفع الكتاب', fileSelect: 'اضغط للاختيار', uploading: 'جاري رفع الكتاب واستخراج النص...',
    progressUpload: 'جاري رفع الملف...', progressLoadFile: 'تجهيز الملف وقراءة بياناته...', progressExtractPage: 'استخراج نص الصفحة', progressChapters: 'اكتشاف الفصول...', progressDone: 'اكتمل!', progressError: 'تعذّرت قراءة الملف.',
    chaptersManaged: 'تم حفظ الفصول', modelMissing: 'لاحظ: الموديل المجاني قد يبدو بطيئاً بسبب حصة الاستخدام. جرّب موديلاً آخر من الإعدادات إذا لزم.',
    stop: 'إيقاف', thinking: 'جاري التفكير...',
    emptyAnswer: 'اكتب إجابة أو اختر خياراً قبل التسليم',
    deleteConfirm: 'متأكد من الحذف؟', examNewCreated: 'تم إنشاؤه', noKeyNote: 'يرجى إضافة مفتاح API في الإعدادات أولاً',
    progressGrading: 'جاري تصحيح الامتحان...', progressQuestion: 'السؤال', progressAnalysis: 'جاري تحليل نقاط الضعف...',
    progressError: 'خطأ أثناء التصحيح', progressDone: 'تم التصحيح بالكامل',
  },
  en: {
    tagline: 'Upload your book, learn it, and test yourself with AI',
    tabLibrary: 'Library', tabLearn: 'Learn', tabExams: 'Exams', tabResults: 'Results', tabSettings: 'Settings',
    addBook: 'Add PDF book', dropHint: 'Drag & drop your PDF here or click to select', orClick: 'Handles large books (up to 80MB)',
    btnUpload: 'Upload & index book', myBooks: 'My books',
    lblBook: 'Book', lblChapter: 'Chapter', lblExplainStyle: 'Explanation style', lblChapters: 'Chapters included', lblLevel: 'Level', lblTypes: 'Question types', lblCount: 'Number of questions', lblExamLang: 'Exam language', lblProvider: 'AI provider', lblModel: 'Model', lblKey: 'API key', lblUILang: 'UI language',
    styleDetailed: 'Detailed', styleSimple: 'Simplified', styleExamFocus: 'Exam-focused',
    fsEnter: 'Fullscreen', fsExit: 'Exit fullscreen',
    btnExplain: 'Explain', btnDiagram: '🌐 Visual Diagram', btnSummary: 'Summary', btnStop: 'Stop', btnSend: 'Send', btnGenerate: 'Generate exam', btnSave: 'Save',
    askFollowUp: 'Ask about this chapter', newExam: 'New exam', myExams: 'My exams',
    pdfPaneTitle: '📄 Book pages',
    pdfShow: '📄 Book pages', pdfHide: 'Hide book pages', pdfRangeHint: 'Chapter pages:',
    panePdfTab: '📄 Book pages', paneDiagramTab: '🌐 Diagram', diagramTitle: 'Visual/Diagram-based Explanation — الشرح باستخدام الرسوم والمخططات (Flowchart)',
    diagramThinking: 'Drawing the chapter flowchart...', diagramNoApi: 'Add an API key in Settings first',
    lvEasy: 'Easy', lvMedium: 'Medium', lvHard: 'Hard',
    typeConcept: 'Conceptual', typeProblem: 'Problems',
    topicsSummary: 'Most frequent weak topics', history: 'Test history',
    aiProvider: 'AI settings', settingsNote: 'Keys are stored only on your device (data folder) and never uploaded anywhere. :free models on OpenRouter are 100% free.',
    settingsSaved: 'Settings saved successfully', chooseBookFirst: 'Choose a book first', noChapters: 'No chapters found. You can add them manually from the library.', chooseChapter: 'Choose a chapter', wholeBook: 'Entire book', goToExplainHint: 'Switched to Learn tab — pick a chapter and press "Explain"', genStarted: 'Generating exam with AI... may take a minute', examGenerated: 'Exam generated successfully',
    noExams: 'No exams yet. Start generating now!', noResults: 'No results yet. Try an exam!',
    startText: 'Start exam', retake: 'Retry', view: 'Review', del: 'Delete',
    yourAnswer: 'Your answer', correctAnswer: 'Correct answer', explanation: 'Explanation', feedback: 'Feedback', whatYouCovered: 'What you covered correctly', whatMissing: 'Missing / needs review', modelAnswer: 'Model answer',
    scoreTitle: 'Score', weakTitle: 'Topics to review', strongTitle: 'Strengths', recoTitle: 'Suggested revision plan',
    unanswered: 'Unanswered', typeLabel: { mcq: 'Multiple choice', concept: 'Conceptual', problem: 'Problem' },
    weakTopics: 'Weak topics', strengths: 'Strengths', recommendations: 'Recommendations',
    genError: 'Error generating exam', submitExam: 'Submit exam', confirmedSubmit: 'Submit exam? You will not be able to edit afterwards.',
    uploadSuccess: 'Book uploaded and chapters indexed automatically', uploadFail: 'Upload failed', fileSelect: 'Click to select', uploading: 'Uploading and extracting text...',
    progressUpload: 'Uploading file...', progressLoadFile: 'Preparing file and reading data...', progressExtractPage: 'Extracting text from page', progressChapters: 'Detecting chapters...', progressDone: 'Done!', progressError: 'Could not read the file.',
    chaptersManaged: 'Chapters saved', modelMissing: 'Note: free models can be slow due to rate limits. Try another model in settings if needed.',
    stop: 'Stop', thinking: 'Thinking...',
    emptyAnswer: 'Write an answer or choose an option before submitting',
    deleteConfirm: 'Delete?', examNewCreated: 'Created', noKeyNote: 'Please add an API key in Settings first',
    progressGrading: 'Grading exam...', progressQuestion: 'Question', progressAnalysis: 'Analyzing weak topics...',
    progressError: 'Grading error', progressDone: 'Grading complete',
  },
};

let state = {
  lang: 'ar',
  settings: null,
  books: [],
  exams: [],
  results: [],
  weakTopics: [],
  currentTab: 'library',
  learn: { bookId: null, chapterId: null },
  examTaking: null,
  examChapters: [],
  chat: { messages: [], controller: null, sending: false },
  explain: { controller: null },
  currentResultId: null,
  uploadBusy: false,
};

/* ---------------- helpers ---------------- */
const L = () => LABELS[state.lang] || LABELS.ar;

function setLang(lang) {
  state.lang = lang || 'ar';
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = state.lang;
  $('#langToggleText').textContent = state.lang === 'ar' ? 'EN' : 'عربي';
  applyI18n();
}

function applyI18n() {
  const l = L();
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = l[key] || el.textContent;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.dataset.i18nPh;
    el.placeholder = l[key] || el.placeholder;
  });
  document.querySelectorAll('[data-i18n-opt]').forEach((el) => {
    const key = el.dataset.i18nOpt;
    if (el.value === '0') el.textContent = l.styleDetailed;
    else if (el.value === '1') el.textContent = l.styleSimple;
    else if (el.value === '2') el.textContent = l.styleExamFocus;
    else if (el.value === 'easy') el.textContent = l.lvEasy;
    else if (el.value === 'medium') el.textContent = l.lvMedium;
    else if (el.value === 'hard') el.textContent = l.lvHard;
    else el.textContent = l[key] || el.textContent;
  });
}

function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toastWrap').appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}

function loading(on, text = '') {
  $('#loadingOverlay').classList.toggle('hidden', !on);
  if (text) $('#loadingText').textContent = text;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderMarkdown(src) {
  const raw = marked.parse(src || '');
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

/* ---------------- API ---------------- */
async function api(path, opts = {}) {
  const { method = 'GET', body, form } = opts;
  const init = { method };
  if (form) init.body = form;
  else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(path, init);
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) throw new Error(data?.error || `خطأ ${res.status}`);
  return data;
}

// SSE via fetch stream
async function streamApi(path, body, { onEvent, onChunk, onDone, onError, signal } = {}) {
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const init = {
    method: 'POST',
    headers: {},
    body: isForm ? body : JSON.stringify(body),
    ...(signal ? { signal } : {}),
  };
  if (!isForm) init.headers['Content-Type'] = 'application/json';
  const res = await fetch(path, init);
  if (!res.ok) {
    let msg = `خطأ ${res.status}`;
    try { const d = await res.json(); msg = d.error || msg; } catch { }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() || '';
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        if (onEvent) { onEvent(obj); continue; }
        if (obj.type === 'chunk') onChunk?.(obj.text || '');
        else if (obj.type === 'done') onDone?.();
        else if (obj.type === 'error') throw new Error(obj.error || 'خطأ');
      } catch (e) { if (e?.message && e.message !== 'خطأ') { onError?.(e.message); return; } }
    }
  }
  onDone?.();
}

/* ---------------- progress bar ---------------- */
function progressOn(title) {
  $('#progressTitle').textContent = title;
  progressUpdate(0, '');
  $('#progressOverlay').classList.remove('hidden');
}
function progressUpdate(pct, step) {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  $('#progressFill').style.width = p + '%';
  $('#progressPct').textContent = p + '%';
  $('#progressStep').textContent = step || '';
}
function progressOff() {
  $('#progressOverlay').classList.add('hidden');
}

/* ---------------- tabs ---------------- */
function switchTab(name) {
  state.currentTab = name;
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
  $(`#view-${name}`).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  if (name === 'library') renderBooks();
  if (name === 'learn') renderLearn();
  if (name === 'exams') renderExamsView();
  if (name === 'results') renderResultsView();
  if (name === 'settings') renderSettings();
  window.scrollTo({ top: 0 });
}

/* ================= LIBRARY ================= */
function bindUpload() {
  const dz = $('#dropZone');
  const fi = $('#fileInput');
  dz.addEventListener('click', () => fi.click());
  dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('ring-2', 'ring-brand-500'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('ring-2', 'ring-brand-500'));
  dz.addEventListener('drop', (e) => {
    e.preventDefault();
    dz.classList.remove('ring-2', 'ring-brand-500');
    if (e.dataTransfer.files[0]) fi.files = e.dataTransfer.files;
  });
  fi.addEventListener('change', () => {
    $('#uploadBtn').disabled = !fi.files[0];
    if (fi.files[0]) $('#dropZone p').textContent = fi.files[0].name;
  });
  $('#uploadBtn').addEventListener('click', uploadBook);
}

async function uploadBook() {
  const fi = $('#fileInput');
  if (!fi.files[0] || state.uploadBusy) return;
  const l = L();

  if (fi.files[0].size > 80 * 1024 * 1024) {
    toast('الملف أكبر من 80MB — غير مسموح.', 'error');
    return;
  }

  state.uploadBusy = true;
  $('#uploadBtn').disabled = true;
  progressOn(l.progressUpload);

  const form = new FormData();
  form.append('file', fi.files[0]);
  if ($('#bookTitleInput').value.trim()) form.append('title', $('#bookTitleInput').value.trim());
  if (parseInt($('#maxPagesInput').value, 10)) form.append('maxPages', $('#maxPagesInput').value);

  try {
    let data = null;
    let failMsg = null;
    await streamApi('/api/books', form, {
      onEvent: (obj) => {
        if (obj.type === 'start' || obj.type === 'progress') {
          if (obj.phase === 'load') progressUpdate(2, l.progressLoadFile);
          else if (obj.phase === 'extract') progressUpdate(obj.percent || 0, `${l.progressExtractPage} ${obj.page}/${obj.total}`);
          else if (obj.phase === 'chapters') progressUpdate(obj.percent || 94, l.progressChapters);
          $('#progressTitle').textContent = l.progressUpload;
        } else if (obj.type === 'result') {
          data = obj;
        }
      },
      onError: (msg) => { failMsg = msg; },
    });
    if (failMsg) throw new Error(failMsg);
    if (!data?.book) throw new Error(l.progressError);

    progressUpdate(100, l.progressDone);
    setTimeout(progressOff, 450);

    state.books.unshift(data.book);
    (data.warnings || []).forEach((w) => toast(w, 'error'));
    toast(l.uploadSuccess, 'success');
    fi.value = ''; $('#bookTitleInput').value = ''; $('#maxPagesInput').value = '';
    $('#dropZone p').textContent = l.dropHint;
    renderBooks();

    state.learn.bookId = data.book.id;
    state.learn.chapterId = data.book.chapters?.[0]?.id || '__all__';
    switchTab('learn');
    toast(l.goToExplainHint, 'success');
  } catch (e) {
    progressOff();
    toast(l.uploadFail + ': ' + (e.message || e), 'error');
  } finally {
    state.uploadBusy = false;
    $('#uploadBtn').disabled = false;
    loading(false);
  }
}

async function saveChapterEdits(bookId, title, chapters) {
  await api(`/api/books/${bookId}/chapters`, { method: 'PUT', body: { chapters } });
  const b = state.books.find((x) => x.id === bookId);
  const fresh = (await api(`/api/books/${bookId}`)).book;
  Object.assign(b, fresh);
  renderBooks();
  toast(L().chaptersManaged, 'success');
}

function renderBooks() {
  const grid = $('#booksGrid');
  const l = L();
  $('#bookCount').textContent = `${state.books.length}`;
  if (!state.books.length) {
    grid.innerHTML = `<div class="card p-10 text-center text-slate-400 font-bold">${l.myBooks} <span class="text-slate-300">—</span> ${l.addBook}</div>`;
    return;
  }
  grid.innerHTML = state.books.map((b) => `
    <div class="card p-5" data-book-card="${b.id}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-12 h-14 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
          <div class="min-w-0">
            <h3 class="font-extrabold text-brand-900 truncate">${esc(b.title)}</h3>
            <p class="text-xs text-slate-500">${b.pageCount} صفحة · ${b.extractedPages} مستخرج · ${b.chapters?.length || 0} فصل</p>
            ${b.empty ? '<p class="text-xs text-rose-600 font-bold mt-1">تنبيه: النص قد يكون ممسوحاً ضوئياً</p>' : ''}
          </div>
        </div>
        <button class="btn-ghost text-rose-500 del-book" data-id="${b.id}">${l.del}</button>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-slate-500">${l.lblChapter}</span>
          <span class="text-xs text-slate-400">${l.noChapters ? 'تحرير' : ''}</span>
        </div>
        <div id="chapters-${b.id}" class="space-y-1.5">
          ${(b.chapters || []).map((c, i) => `
            <div class="flex items-center gap-2 bg-slate-50 rounded-lg p-1.5">
              <span class="text-xs font-bold text-brand-600 w-7 text-center shrink-0">${i + 1}</span>
              <input class="input flex-1 text-sm ch-title" value="${esc(c.title)}" data-i="title" data-id="${c.id}" />
              <input class="input w-16 text-center text-sm ch-s" type="number" min="1" max="${b.pageCount}" value="${c.pageStart}" data-i="start" data-id="${c.id}" title="بداية" />
              <span class="text-slate-400 text-xs">→</span>
              <input class="input w-16 text-center text-sm ch-e" type="number" min="1" max="${b.pageCount}" value="${c.pageEnd}" data-i="end" data-id="${c.id}" title="نهاية" />
            </div>`).join('')}
        </div>
        <button class="btn-secondary text-xs mt-2 add-chapter" data-book="${b.id}" data-last="${b.pageCount}">+ ${l.lblChapter}</button>
        <button class="btn-primary text-xs mt-2 save-chapters" data-book="${b.id}">${l.btnSave}</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('.del-book').forEach((btn) => btn.addEventListener('click', async () => {
    if (!confirm(l.deleteConfirm)) return;
    await api(`/api/books/${btn.dataset.id}`, { method: 'DELETE' });
    state.books = state.books.filter((b) => b.id !== btn.dataset.id);
    renderBooks();
  }));
  grid.querySelectorAll('.save-chapters').forEach((btn) => btn.addEventListener('click', async () => {
    const id = btn.dataset.book;
    const chapterRows = document.querySelectorAll(`#chapters-${id} .ch-title`);
    const chapterStart = document.querySelectorAll(`#chapters-${id} .ch-s`);
    const chapterEnd = document.querySelectorAll(`#chapters-${id} .ch-e`);
    const chapters = Array.from(chapterRows).map((el, i) => ({
      id: el.dataset.id,
      title: el.value,
      pageStart: chapterStart[i].value,
      pageEnd: chapterEnd[i].value,
    }));
    await saveChapterEdits(id, '', chapters);
  }));
  grid.querySelectorAll('.add-chapter').forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.book;
    const wrap = document.querySelector(`#chapters-${id}`);
    const count = wrap.children.length;
    const lastEnd = btn.dataset.last;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 bg-slate-50 rounded-lg p-1.5';
    div.innerHTML = `
      <span class="text-xs font-bold w-7 text-center shrink-0">${count + 1}</span>
      <input class="input flex-1 text-sm" placeholder="اسم الفصل" />
      <input class="input w-16 text-center text-sm" type="number" min="1" max="${lastEnd}" value="1" />
      <span class="text-slate-400 text-xs">→</span>
      <input class="input w-16 text-center text-sm" type="number" min="1" max="${lastEnd}" value="${lastEnd}" />`;
    wrap.appendChild(div);
  }));
}

/* ================= LEARN ================= */
function fillLearnSelects() {
  const bookSel = $('#learnBook');
  bookSel.innerHTML = '<option value="">' + L().chooseBookFirst + '</option>' + state.books.map((b) => `<option value="${b.id}">${esc(b.title)}</option>`).join('');
  const b = state.books.find((x) => x.id === state.learn.bookId);
  const chSel = $('#learnChapter');
  if (!b) {
    chSel.innerHTML = '<option value="">—</option>';
    return;
  }
  const chapters = b.chapters || [];
  const opts = chapters.length
    ? chapters.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join('')
    : `<option value="__all__">${esc(L().wholeBook)}</option>`;
  chSel.innerHTML = '<option value="">' + L().chooseChapter + '</option>' + opts;
  if (state.learn.chapterId) chSel.value = state.learn.chapterId;
}

function renderLearn() {
  fillLearnSelects();
  $('#explainContent').innerHTML = '';
  $('#explainBox').classList.add('hidden');
  $('#chatBox').innerHTML = '';
  if (window.PdfViewer) window.PdfViewer.clear();
  updatePdfToggleUI();
}

function chapterPageRange() {
  const b = state.books.find((x) => x.id === state.learn.bookId);
  if (!b) return null;
  if (state.learn.chapterId !== '__all__') {
    const c = (b.chapters || []).find((x) => x.id === state.learn.chapterId);
    if (c) return { start: c.pageStart || 1, end: c.pageEnd || b.pageCount || c.pageStart || 1 };
  }
  return { start: 1, end: b.pageCount || 1 };
}

function updatePdfToggleUI() {
  const t = $('#pdfToggleText');
  if (!t) return;
  const pane = $('#pdfPane');
  const visible = pane && !pane.classList.contains('hidden');
  t.textContent = visible ? L().pdfHide : L().pdfShow;
  const pr = chapterPageRange();
  const hint = $('#pdfToggleHint');
  if (hint) hint.textContent = pr ? L().pdfRangeHint + ' ' + pr.start + '–' + pr.end : '';
}

function showChapterPdf() {
  const pr = chapterPageRange();
  if (pr && window.PdfViewer) {
    window.PdfViewer.show(state.learn.bookId, pr.start, pr.end);
    updatePdfToggleUI();
  }
}

function showChapterDiagram() {
  if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
  if (window.DiagramView) window.DiagramView.show(state.learn.bookId, state.learn.chapterId);
  updatePdfToggleUI();
}

function setStatusChip(text, className = '') {
  const chip = $('#statusChip');
  chip.className = `inline-flex items-center gap-2 text-xs font-bold ${className}`;
  chip.innerHTML = `<div class="spinner" style="width:14px;height:14px;border-width:2px"></div>${esc(text)}`;
}

function clearStatusChip() { $('#statusChip').innerHTML = ''; }

const fsState = { el: null };

function fsButtons() {
  return ['paneFsBtn', 'explainFsBtn'].map((id) => document.getElementById(id)).filter(Boolean);
}

function setFullscreenTarget(el) {
  if (!el || el.classList.contains('hidden')) return;
  const prev = fsState.el;
  if (prev) prev.classList.remove('fs-active');
  if (prev === el) { el = null; } else { el.classList.add('fs-active'); }
  document.body.classList.toggle('fs-open', !!el);
  fsState.el = el;
  fsButtons().forEach((b) => {
    const mine = !!(el && b.dataset.fsTarget === el.id);
    b.classList.toggle('fs-on', mine);
    b.title = mine ? L().fsExit : L().fsEnter;
  });
  setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
}

function bindFullscreen() {
  fsButtons().forEach((b) => b.addEventListener('click', () => {
    const el = document.getElementById(b.dataset.fsTarget);
    if (!el || el.classList.contains('hidden')) return;
    setFullscreenTarget(el);
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fsState.el) setFullscreenTarget(fsState.el);
  });
}

function bindLearn() {
  $('#learnBook').addEventListener('change', (e) => {
    state.learn.bookId = e.target.value;
    state.learn.chapterId = null;
    fillLearnSelects();
  });
  $('#learnChapter').addEventListener('change', (e) => {
    state.learn.chapterId = e.target.value;
    if (window.PdfViewer) window.PdfViewer.clear();
    updatePdfToggleUI();
  });

  $('#pdfToggleBtn').addEventListener('click', () => {
    const pane = $('#pdfPane');
    if (pane && !pane.classList.contains('hidden')) {
      if (window.PdfViewer) window.PdfViewer.clear();
      updatePdfToggleUI();
    } else {
      if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
      showChapterPdf();
    }
  });

  $('#diagramBtn').addEventListener('click', () => showChapterDiagram());
  window.addEventListener('diagram-requested', () => showChapterDiagram());
  window.addEventListener('pdf-requested', () => {
    if (state.learn.bookId && state.learn.chapterId) showChapterPdf();
  });

  $('#explainBtn').addEventListener('click', async () => {
    if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
    if (state.explain.controller) { state.explain.controller.abort(); }
    showChapterPdf();
    const controller = new AbortController();
    state.explain.controller = controller;
    $('#explainBox').classList.remove('hidden');
    $('#explainContent').innerHTML = '';
    $('#stopExplainBtn').classList.remove('hidden');
    setStatusChip(L().thinking);
    const style = $('#learnStyle').value;
    const styleInjection = style === '1' ? '\n\nملاحظة: استخدم لغة مبسطة جداً وقصّر الأمثلة.' : style === '2' ? '\n\nملاحظة: ركّز على ما يأتي في الامتحانات والأسئلة المتوقعة.' : '';
    try {
      let full = '';
      await streamApi('/api/explain', {
        bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang: state.lang,
      }, {
        signal: controller.signal,
        onChunk: (t) => {
          full += t;
          $('#explainContent').innerHTML = renderMarkdown(full);
        },
        onDone: () => {
          clearStatusChip();
          $('#stopExplainBtn').classList.add('hidden');
        },
      });
    } catch (e) {
      if (e.name !== 'AbortError') { clearStatusChip(); $('#explainContent').innerHTML += `<div class="text-rose-600 font-bold mt-4">خطأ: ${esc(e.message)}</div>`; }
      clearStatusChip();
      $('#stopExplainBtn').classList.add('hidden');
    } finally {
      state.explain.controller = null;
    }
  });

  $('#stopExplainBtn').addEventListener('click', () => {
    state.explain.controller?.abort();
    clearStatusChip();
    $('#stopExplainBtn').classList.add('hidden');
  });

  $('#summaryBtn').addEventListener('click', async () => {
    if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
    showChapterPdf();
    $('#explainBox').classList.remove('hidden');
    $('#explainContent').innerHTML = '<div class="spinner mx-auto my-6"></div>';
    try {
      const lang = state.lang;
      const { summary } = await api('/api/summarize', { method: 'POST', body: { bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang } });
      $('#explainContent').innerHTML = renderMarkdown(summary);
    } catch (e) {
      $('#explainContent').innerHTML = `<div class="text-rose-600 font-bold">خطأ: ${esc(e.message)}</div>`;
    }
  });

  $('#chatSend').addEventListener('click', sendChat);
  $('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChat(); });
  window.addEventListener('pdf-pane', () => { if (state.currentTab === 'learn') updatePdfToggleUI(); });
}

async function sendChat() {
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text || state.chat.sending || !state.learn.bookId || !state.learn.chapterId) {
    if (!text) return;
    if (!state.learn.chapterId) { toast(L().chooseChapter); return; }
    return;
  }
  input.value = '';
  state.chat.sending = true;
  const box = $('#chatBox');
  box.appendChild(userBubble(text));
  box.scrollTop = box.scrollHeight;
  const aiBubble = document.createElement('div');
  aiBubble.className = 'chat-msg chat-ai md-wrap';
  aiBubble.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div>';
  box.appendChild(aiBubble);
  box.scrollTop = box.scrollHeight;

  const history = [...state.chat.messages.slice(-10), { role: 'user', content: text }];
  let errored = false;
  try {
    let full = '';
    await streamApi('/api/chat', {
      bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang: state.lang, history,
    }, {
      onChunk: (t) => {
        full += t;
        aiBubble.innerHTML = renderMarkdown(full);
        box.scrollTop = box.scrollHeight;
      },
      onError: (msg) => {
        errored = true;
        aiBubble.innerHTML = `<div class="text-rose-600 font-bold">خطأ: ${esc(msg)}</div>`;
      },
    });
    if (full && !errored) {
      state.chat.messages.push({ role: 'user', content: text });
      state.chat.messages.push({ role: 'assistant', content: full });
    } else if (!errored) {
      aiBubble.innerHTML = '—';
    }
  } catch (e) {
    aiBubble.innerHTML = `<div class="text-rose-600 font-bold">خطأ: ${esc(e.message)}</div>`;
  } finally {
    state.chat.sending = false;
  }
}

function userBubble(text) {
  const d = document.createElement('div');
  d.className = 'chat-msg chat-user';
  d.textContent = text;
  return d;
}

/* ================= EXAMS ================= */
function renderExamsView() {
  if (state.examTaking) { renderExamTaking(); return; }
  renderExamFormBook();
  renderExamsList();
}

function renderExamFormBook() {
  const sel = $('#examBook');
  const prev = sel.value;
  sel.innerHTML = '<option value="">' + L().chooseBookFirst + '</option>' + state.books.map((b) => `<option value="${b.id}">${esc(b.title)}</option>`).join('');
  if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
  renderExamChapterCheckboxes();
}

function renderExamChapterCheckboxes() {
  const wrap = $('#examChapters');
  const id = $('#examBook').value;
  const b = state.books.find((x) => x.id === id);
  if (!b) { wrap.innerHTML = '<p class="text-xs text-slate-400 text-center py-3">' + L().chooseBookFirst + '</p>'; return; }
  if (!b.chapters?.length) { wrap.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">${L().noChapters}</p>`; return; }
  wrap.innerHTML = (b.chapters || []).map((c) => `
    <label class="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer p-1 rounded hover:bg-slate-50">
      <input type="checkbox" value="${c.id}" class="exam-ch rounded" /> ${esc(c.title)}
    </label>`).join('');
}

function renderExamsList() {
  const wrap = $('#examsList');
  const l = L();
  $('#examListCount').textContent = state.exams.length ? `${l.myExams}: ${state.exams.length}` : '';
  if (!state.exams.length) { wrap.innerHTML = `<div class="card p-10 text-center text-slate-400 font-bold">${l.noExams}</div>`; return; }
  wrap.innerHTML = state.exams.map((e) => {
    const taken = state.results.some((r) => r.examId === e.id);
    return `
    <div class="card p-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/><path d="M9 12l2 2 4-4"/></svg></div>
        <div class="min-w-0">
          <h4 class="font-extrabold text-sm text-slate-800 truncate">${esc(e.title)}</h4>
          <p class="text-xs text-slate-500">${e.questionCount} أسئلة · ${e.level} ${taken ? '· ' + L().examNewCreated : ''}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button class="btn-primary text-xs start-exam" data-id="${e.id}">${taken ? L().retake : L().startText}</button>
        <button class="btn-ghost text-rose-500 del-exam" data-id="${e.id}">${l.del}</button>
      </div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('.start-exam').forEach((b) => b.addEventListener('click', () => openExam(b.dataset.id)));
  wrap.querySelectorAll('.del-exam').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm(l.deleteConfirm)) return;
    await api(`/api/exams/${b.dataset.id}`, { method: 'DELETE' });
    state.exams = state.exams.filter((x) => x.id !== b.dataset.id);
    renderExamsList();
  }));
}

async function generateExam() {
  const l = L();
  const bookId = $('#examBook').value;
  if (!bookId) { toast(l.chooseBookFirst, 'error'); return; }
  const chapterIds = [...document.querySelectorAll('.exam-ch:checked')].map((c) => c.value);
  if (!chapterIds.length) { toast(l.chooseChapter, 'error'); return; }
  const types = [...document.querySelectorAll('#view-exams .chip-check input:checked')].map((c) => c.value);
  if (!types.length) { toast(l.lblTypes, 'error'); return; }
  const count = Math.min(30, Math.max(1, parseInt($('#examCount').value, 10) || 8));
  const payload = {
    bookId, chapterIds, level: $('#examLevel').value, types,
    count, lang: $('#examLang').value || state.lang,
  };
  $('#examStatus').classList.remove('hidden');
  $('#examStatus').className = 'text-sm font-bold mt-3 text-brand-700';
  $('#examStatus').textContent = l.genStarted;
  $('#generateExamBtn').disabled = true;
  try {
    const data = await api('/api/exams', { method: 'POST', body: payload });
    state.exams.unshift(data.exam);
    toast(l.examGenerated, 'success');
    renderExamsList();
    openExam(data.exam.id);
  } catch (e) {
    $('#examStatus').textContent = l.genError + ': ' + (e.message || e);
    $('#examStatus').className = 'text-sm font-bold mt-3 text-rose-600';
  } finally {
    $('#generateExamBtn').disabled = false;
  }
}

async function openExam(examId) {
  const { exam } = await api(`/api/exams/${examId}`);
  state.examTaking = exam;
  switchTab('exams');
}

function answersFromForm() {
  const answers = {};
  for (const q of state.examTaking.questions) {
    if (q.type === 'mcq') {
      const sel = document.querySelector(`input[name="ansq-${q.id}"]:checked`);
      if (sel) answers[q.id] = { answerIndex: parseInt(sel.value, 10) };
    } else {
      const ta = document.getElementById(`textq-${q.id}`);
      if (ta && ta.value.trim()) answers[q.id] = { text: ta.value.trim() };
    }
  }
  return answers;
}

function renderExamTaking() {
  const exam = state.examTaking;
  if (!exam) { renderExamsList(); return; }
  const l = L();
  const wrap = $('#examsList');
  wrap.innerHTML = `
    <div class="card p-6">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 class="text-lg font-extrabold text-brand-900">${esc(exam.title)}</h3>
          <p class="text-xs text-slate-500 mt-1">${exam.questions?.length ?? 0} أسئلة · ${l.lvMedium === exam.level ? '' : esc(exam.level)}</p>
        </div>
        <button class="btn-ghost" id="examBackBtn">← ${esc(l.myExams)}</button>
      </div>
      <div class="space-y-6 mt-5">
        ${exam.questions.map((q, i) => `
          <div class="border border-slate-200 rounded-xl p-4" data-qid="${q.id}">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' : q.type === 'problem' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}">${l.typeLabel[q.type] || q.type} · ${q.points} نقطة</span>
              <span class="text-xs text-slate-400 font-bold">س ${i + 1}</span>
            </div>
            <p class="font-bold text-[15px] text-slate-800 leading-relaxed">${esc(q.question)}</p>
            ${q.type === 'mcq'
              ? `<div class="mt-3 space-y-2">${q.options.map((o, oi) => `
                  <label class="q-option">
                    <input type="radio" name="ansq-${q.id}" value="${oi}" class="mt-1 accent-indigo-600" />
                    <span class="font-semibold text-sm">${esc(o)}</span>
                  </label>`).join('')}</div>`
              : `<textarea id="textq-${q.id}" rows="4" class="input w-full mt-3" placeholder="${l.yourAnswer}..."></textarea>`}
          </div>`).join('')}
      </div>
      <div class="mt-6 flex items-center gap-3">
        <button id="submitExamBtn" class="btn-primary px-8">${l.submitExam}</button>
      </div>
    </div>`;

  wrap.querySelectorAll('.q-option').forEach((opt) => opt.addEventListener('click', () => {
    const input = opt.querySelector('input');
    const name = input.name;
    wrap.querySelectorAll(`input[name="${name}"]`).forEach((x) => x.checked = false);
    input.checked = true;
    wrap.querySelectorAll(`input[name="${name}"]`).forEach((x) => x.closest('.q-option').classList.remove('selected'));
    opt.classList.add('selected');
  }));

  $('#examBackBtn').addEventListener('click', () => { state.examTaking = null; renderExamsList(); });
  $('#submitExamBtn').addEventListener('click', async () => {
    if (!confirm(l.confirmedSubmit)) return;
    const answers = answersFromForm();
    const total = state.examTaking.questions.length;
    progressOn(l.progressGrading);
    let result = null;
    try {
      await streamApi(`/api/exams/${exam.id}/submit`, { answers }, {
        onEvent: (obj) => {
          if (obj.type === 'progress') {
            if (obj.phase === 'grading') {
              const pct = Math.round((obj.graded / obj.total) * 100);
              progressUpdate(pct, `${l.progressQuestion} ${obj.graded}/${obj.total}${obj.current ? ' — ' + obj.current : ''}`);
            } else if (obj.phase === 'analysis') {
              progressUpdate(96, l.progressAnalysis);
            }
          } else if (obj.type === 'result') {
            result = obj.result;
          } else if (obj.type === 'error') {
            throw new Error(obj.error || l.progressError);
          }
        },
      });
      if (!result) throw new Error(l.progressError);
      progressUpdate(100, l.progressDone);
      setTimeout(() => progressOff(), 450);
      state.results.unshift(result);
      renderResultsView();
      showResultDetail(result.id);
      switchTab('results');
    } catch (e) {
      progressOff();
      toast('خطأ في التصحيح: ' + (e.message || e), 'error');
    }
  });
}

/* ================= RESULTS ================= */
function renderResultsView() {
  renderWeakBars();
  renderResultsList();
}

function renderWeakBars() {
  const wrap = $('#weakBars');
  const l = L();
  if (!state.weakTopics.length) {
    wrap.innerHTML = `<p class="text-sm text-slate-400 font-bold text-center py-4">${l.noResults}</p>`;
    return;
  }
  const top = state.weakTopics.slice(0, 8);
  wrap.innerHTML = `<p class="text-sm font-extrabold text-brand-900 mb-2">${l.topicsSummary}</p>` +
    top.map((t) => `
      <div class="weak-bar-wrap">
        <span class="weak-bar-label" title="${esc(t.topic)}">${esc(t.topic)}</span>
        <div class="weak-bar-track"><div class="weak-bar-fill" style="width:${t.weakPct}%"></div></div>
        <span class="text-xs font-bold text-slate-500 w-14 text-center">${t.weakPct}%</span>
      </div>`).join('');
}

function renderResultsList() {
  const wrap = $('#resultsList');
  const l = L();
  if (!state.results.length) { wrap.innerHTML = `<div class="card p-8 text-center text-slate-400 font-bold">${l.noResults}</div>`; return; }
  wrap.innerHTML = state.results.map((r) => `
    <div class="card p-4 flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition view-result" data-id="${r.id}">
      <div class="flex items-center gap-3 min-w-0">
        <div class="score-circle relative flex items-center justify-center shrink-0 ${r.percent >= 70 ? 'text-emerald-600' : r.percent >= 50 ? 'text-amber-600' : 'text-rose-600'}">
          <svg width="56" height="56" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" stroke-width="4"/><circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="${r.percent},100" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg>
          <span class="absolute text-sm font-extrabold">${r.percent}%</span>
        </div>
        <div class="min-w-0">
          <h4 class="font-extrabold text-sm text-slate-800 truncate">${esc(r.examTitle)}</h4>
          <p class="text-xs text-slate-500">${r.totalScore}/${r.totalPoints} · ${new Date(r.takenAt).toLocaleString()}</p>
          ${r.weakTopics?.length ? `<p class="text-xs text-rose-500 font-bold mt-1 truncate">${r.weakTopics.slice(0, 3).join('، ')}</p>` : ''}
        </div>
      </div>
      <button class="btn-ghost text-rose-500 del-result" data-id="${r.id}">${l.del}</button>
    </div>`).join('');

  wrap.querySelectorAll('.view-result').forEach((b) => b.addEventListener('click', (e) => {
    if (e.target.closest('.del-result')) return;
    showResultDetail(b.dataset.id);
  }));
  wrap.querySelectorAll('.del-result').forEach((b) => b.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm(l.deleteConfirm)) return;
    await api(`/api/results/${b.dataset.id}`, { method: 'DELETE' });
    state.results = state.results.filter((r) => r.id !== b.dataset.id);
    if (state.currentResultId === b.dataset.id) $('#resultDetail').innerHTML = '';
    renderResultsView();
  }));
}

async function showResultDetail(id) {
  state.currentResultId = id;
  const { result } = await api(`/api/results/${id}`);
  const l = L();
  const gradeColor = result.percent >= 70 ? 'text-emerald-600' : result.percent >= 50 ? 'text-amber-600' : 'text-rose-600';
  const wrap = $('#resultDetail');
  wrap.innerHTML = `
    <div class="text-center">
      <p class="text-xs font-bold text-slate-400 mb-1">${l.scoreTitle}</p>
      <div class="progress-ring-wrap">
        <div class="relative flex items-center justify-center ${gradeColor}">
          <svg width="120" height="120" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" stroke-width="5"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="${result.percent},100" stroke-linecap="round" transform="rotate(-90 18 18)"/></svg>
          <span class="absolute text-3xl font-extrabold">${result.percent}%</span>
        </div>
      </div>
      <p class="text-sm text-slate-500 mt-1 font-bold">${result.totalScore} / ${result.totalPoints} نقطة</p>
    </div>
    <hr class="my-4 border-slate-100" />
    <div class="space-y-4">
      <div>
        <p class="font-extrabold text-sm text-brand-900 mb-1">${l.weakTitle}</p>
        ${(result.analysis?.weakTopics || []).length
          ? `<ul class="text-sm text-rose-600 font-semibold space-y-0.5">${result.analysis.weakTopics.map((t) => `<li>• ${esc(t)}</li>`).join('')}</ul>`
          : `<p class="text-sm text-slate-400">—</p>`}
      </div>
      <div>
        <p class="font-extrabold text-sm text-brand-900 mb-1">${l.strongTitle}</p>
        ${(result.analysis?.strengths || []).length
          ? `<ul class="text-sm text-emerald-700 font-semibold space-y-0.5">${result.analysis.strengths.map((t) => `<li>• ${esc(t)}</li>`).join('')}</ul>`
          : `<p class="text-sm text-slate-400">—</p>`}
      </div>
      <div>
        <p class="font-extrabold text-sm text-brand-900 mb-1">${l.recoTitle}</p>
        ${(result.analysis?.recommendations || []).length
          ? `<ul class="text-sm text-slate-600 space-y-1 leading-relaxed">${result.analysis.recommendations.map((t) => `<li>• ${esc(t)}</li>`).join('')}</ul>`
          : `<p class="text-sm text-slate-400">—</p>`}
      </div>
    </div>
    <hr class="my-4 border-slate-100" />
    <p class="text-xs font-bold text-slate-400 mb-2">${l.history}</p>
    <div class="space-y-2 max-h-80 overflow-y-auto">
      ${result.questions.map((q, i) => {
        const ok = q.correct;
        const badgeCls = q.unanswered ? 'bg-slate-200 text-slate-500' : ok ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600';
        const badge = q.unanswered ? l.unanswered : ok ? '✓' : '✗';
        return `
        <details class="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
          <summary class="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
            <span class="w-6 h-6 rounded-full ${badgeCls} flex items-center justify-center text-xs shrink-0">${badge}</span>
            <span class="truncate">${esc(q.topic)}</span>
            <span class="mr-auto text-xs text-slate-400">${q.score}/${q.points}</span>
          </summary>
          <div class="mt-2 space-y-2 text-sm">
            <p class="font-semibold text-slate-800">${esc(result.examTitle.split(' — ')[0])}: ${esc(q.type === 'mcq' ? '' : '')}</p>
            ${q.type === 'mcq' && q.modelAnswer ? `<p class="text-xs text-slate-500">${l.correctAnswer}: ${esc(q.chosen !== undefined ? 'الخيار ' + (q.correctAnswer + 1) : '')}</p>` : ''}
            ${q.feedback ? `<p class="text-xs text-slate-600 bg-white rounded p-2 border">${l.feedback}: ${esc(q.feedback)}</p>` : ''}
            ${q.explanation ? `<p class="text-xs text-slate-600">${l.explanation}: ${esc(q.explanation)}</p>` : ''}
            ${q.modelAnswer ? `<p class="text-xs text-slate-600"><b>${l.modelAnswer}:</b> ${esc(q.modelAnswer)}</p>` : ''}
          </div>
        </details>`;
      }).join('')}
    </div>`;
}

/* ================= SETTINGS ================= */
function renderSettings() {
  const s = state.settings;
  if (!s) return;
  $('#setProvider').value = s.provider || 'openrouter';
  populateModelSelect();
  const custom = s.model;
  const known = [...s.freeModels.map((m) => m.id), ...s.moonshotModels.map((m) => m.id)];
  if (custom && !known.includes(custom)) {
    $('#setModelCustom').value = custom;
    $('#setModelCustom').classList.remove('hidden');
  }
  $('#setKey').value = '';
  $('#setKey').placeholder = s.openrouterKey === 'set' || s.moonshotKey === 'set' ? 'المفتاح محفوظ — اتركه فارغاً للإبقاء عليه' : 'sk-...';
  $('#setLang').value = state.lang;
  $('#providerStatus').innerHTML = '';
}

function populateModelSelect() {
  const prov = $('#setProvider').value;
  const s = state.settings;
  const sel = $('#setModel');
  const list = prov === 'moonshot' ? s.moonshotModels : s.freeModels;
  sel.innerHTML = list.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('');
  if (prov === 'moonshot') sel.value = 'kimi-k2.7-code';
  else sel.value = s.model && list.some((m) => m.id === s.model) ? s.model : list[0]?.id;
}

async function saveSettings() {
  const prov = $('#setProvider').value;
  const model = $('#setModelCustom').value.trim() || $('#setModel').value;
  const key = $('#setKey').value.trim();
  const lang = $('#setLang').value;
  const body = { provider: prov, model, lang };
  if (key) body[prov === 'moonshot' ? 'moonshotKey' : 'openrouterKey'] = key;
  await api('/api/settings', { method: 'PUT', body });
  await loadSettings();
  setLang(lang);
  toast(L().settingsSaved, 'success');
}

/* ================= LOAD + INIT ================= */
async function loadSettings() {
  state.settings = await api('/api/settings');
  if (!state.lang || state.lang !== state.settings.lang) setLang(state.settings.lang || 'ar');
}

async function loadBooks() {
  const { books } = await api('/api/books');
  state.books = books;
}

async function loadExams() {
  const { exams } = await api('/api/exams');
  state.exams = exams;
}

async function loadResults() {
  const { results } = await api('/api/results');
  state.results = results;
}

async function loadWeak() {
  const { topics } = await api('/api/weak-topics');
  state.weakTopics = topics;
}

async function init() {
  await loadSettings();

  document.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  bindUpload();
  bindLearn();
  bindFullscreen();
  bindExamForm();
  bindSettings();
  switchTab('library');

  try {
    await Promise.all([loadBooks(), loadExams(), loadResults(), loadWeak()]);
    renderBooks();
    renderExamFormBook();
    renderExamsList();
    renderResultsView();
  } catch (e) {
    console.error(e);
  }
}

function bindExamForm() {
  $('#examBook').addEventListener('change', renderExamChapterCheckboxes);
  $('#generateExamBtn').addEventListener('click', generateExam);
  $('#examLang').value = state.lang;
}

function bindSettings() {
  $('#setProvider').addEventListener('change', () => {
    $('#setModelCustom').classList.add('hidden');
    populateModelSelect();
  });
  $('#setModel').addEventListener('change', () => {
    $('#setModelCustom').value = '';
    $('#setModelCustom').classList.add('hidden');
  });
  $('#saveSettingsBtn').addEventListener('click', saveSettings);
  $('#langToggle').addEventListener('click', () => {
    setLang(state.lang === 'ar' ? 'en' : 'ar');
    const body = { lang: state.lang };
    api('/api/settings', { method: 'PUT', body }).catch(() => { });
    if (state.currentTab === 'learn') renderLearn();
    if (state.currentTab === 'exams') { renderExamFormBook(); renderExamsList(); }
    if (state.currentTab === 'results') renderResultsView();
  });
  $('#examLang').addEventListener('change', (e) => state.examLang = e.target.value);
}

document.addEventListener('DOMContentLoaded', init);
window.L = L;
window.renderMarkdown = renderMarkdown;