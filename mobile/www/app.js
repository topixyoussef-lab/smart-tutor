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
    btnFlashcards: '🃏 بطاقات', btnFlashcardsT: 'بطاقات مراجعة من الفصل',
    btnQuickQuiz: '❓ سؤال سريع', btnQuickQuizT: 'سؤال قصير أثناء القراءة',
    btnExplainMd: 'تحميل الشرح Markdown', btnExplainPrint: 'حفظ/طباعة الشرح PDF',
    btnReviewPlan: '🗓 خطة مراجعة', btnReviewPlanT: 'خطة مراجعة متباعدة لمواضيعك الضعيفة',
    cardsThinking: 'جاري توليد البطاقات...', cardsEmpty: 'لم تُولَّد بطاقات، جرّب مجدداً', cardsCount: 'بطاقة {n}', cardsFlip: 'اعرض الإجابة', cardsFlipBack: 'اعرض السؤال', cardsPrev: 'السابق', cardsNext: 'التالي',
    quizThinking: 'جاري توليد سؤال...', quizTitle: 'اختبار سريع ⚡', quizAgain: 'سؤال آخر', quizCorrect: 'إجابة صحيحة 🎉', quizWrong: 'إجابة خاطئة', quizScore: 'نتيجتك الآن: {a}/{b}',
    planTitle: 'خطة مراجعة متباعدة', planThinking: 'جاري إعداد الخطة...', planFail: 'تعذّر إعداد الخطة، جرّب مجدداً', planEmpty: 'لا توجد نتائج امتحانات بعد، حلّ اختباراً أولاً', planDay: 'اليوم',
    explainMdSave: 'تم تنزيل ملف الشرح', explainNoText: 'لا يوجد شرح بعد — اضغط "اشرح" أولاً',
    tabTimetable: 'الجدول', ttSetup: 'إعداد الجدول الزمني', ttChooseBooks: 'اختر كتب المناهج', ttStartDate: 'تاريخ البداية', ttDays: 'أيام الدراسة',
    ttSessions: 'حصص يومياً', ttMinutes: 'دقيقة/حصة', ttSubjectsDay: 'مواد في اليوم', ttOne: 'مادة واحدة', ttTwo: 'مادتان', ttThree: '3 مواد',
    ttGenerate: '🗓 إنشاء الجدول', ttReset: 'مسح الجدول', ttTitle: 'خطتك الدراسية اليومية', ttPrint: '🖨 طباعة / PDF',
    ttBooksHint: 'لا توجد كتب بعد — ارفع كتب المناهج من تبويب الكتب أولاً',
    ttStatsBooks: 'كتب', ttStatsUnits: 'درساً', ttStatsDays: 'أيام دراسية', ttStatsHours: 'ساعة/أسبوع',
    ttDayAll: 'كل الأيام',
    lblVisualExplain: 'شرح بالصور من الكتاب', visualExplain: 'شرح مرئي بالصور', visualExplainShort: 'مرئي', pngTitle: 'حفظ الرسم صورة PNG', pngFail: 'تعذّر حفظ الرسم', aiImageBtn: 'توليد صورة AI', aiImageTitle: 'توليد صورة توضيحية فوتوغرافية لهذا المفهوم', aiImageLoading: 'جارٍ توليد الصورة', aiImageFail: 'تعذّر توليد الصورة — تأكد من مفتاح OpenRouter',
    ttsListen: 'استماع للشرح', ttsStop: 'إيقاف', ttsNoText: 'لا يوجد نص للاستماع', ttsUnsupported: 'المتصفح لا يدعم القراءة الصوتية',
    darkOn: 'الوضع الليلي', darkOff: 'الوضع النهاري',
    exportPng: 'حفظ الرسم صورة', printDiagram: 'طباعة الرسم',
    btnExplain: 'اشرح لي', btnDiagram: '🌐 الرسم والمخططات', btnSummary: 'ملخص', btnStop: 'إيقاف', btnSend: 'إرسال', btnGenerate: 'توليد الامتحان', btnSave: 'حفظ',
    askFollowUp: 'اسأل عن هذا الفصل', newExam: 'امتحان جديد', myExams: 'الامتحانات',
    pdfPaneTitle: '📄 صفحات الكتاب',
    pdfShow: '📄 صفحات الكتاب', pdfHide: 'إخفاء صفحات الكتاب', pdfRangeHint: 'صفحات الفصل:',
    splitHalf: '⊞ نصفين', splitFull: '⊟ كامل', splitTitle: 'تقسيم العرض: الشرح والصفحة جنب بعض', splitTitleOff: 'إلغاء التقسيم: الشرح بعرض كامل',
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
    btnFlashcards: '🃏 Flashcards', btnFlashcardsT: 'Review flashcards from the chapter',
    btnQuickQuiz: '❓ Quick quiz', btnQuickQuizT: 'Short question while reading',
    btnExplainMd: 'Download explanation (Markdown)', btnExplainPrint: 'Save/Print explanation (PDF)',
    btnReviewPlan: '🗓 Review plan', btnReviewPlanT: 'Spaced-repetition plan for your weak topics',
    cardsThinking: 'Generating flashcards...', cardsEmpty: 'No cards generated, try again', cardsCount: 'Card {n}', cardsFlip: 'Show answer', cardsFlipBack: 'Show question', cardsPrev: 'Prev', cardsNext: 'Next',
    quizThinking: 'Generating question...', quizTitle: 'Quick quiz ⚡', quizAgain: 'Another question', quizCorrect: 'Correct! 🎉', quizWrong: 'Wrong', quizScore: 'Current score: {a}/{b}',
    planTitle: 'Spaced Repetition Plan', planThinking: 'Building your plan...', planFail: 'Could not build the plan, try again', planEmpty: 'No exam results yet — take an exam first', planDay: 'Day',
    explainMdSave: 'Explanation file downloaded', explainNoText: 'No explanation yet — press "Explain" first',
    tabTimetable: 'Schedule', ttSetup: 'Build your timetable', ttChooseBooks: 'Choose curriculum books', ttStartDate: 'Start date', ttDays: 'Study days',
    ttSessions: 'Sessions per day', ttMinutes: 'min / session', ttSubjectsDay: 'Subjects per day', ttOne: 'One subject', ttTwo: 'Two subjects', ttThree: '3 subjects',
    ttGenerate: '🗓 Generate schedule', ttReset: 'Clear schedule', ttTitle: 'Your daily study plan', ttPrint: '🖨 Print / PDF',
    ttBooksHint: 'No books yet — upload your curriculum books first',
    ttStatsBooks: 'books', ttStatsUnits: 'lessons', ttStatsDays: 'study days', ttStatsHours: 'hrs/week',
    ttDayAll: 'Every day',
    lblVisualExplain: 'Visual explanation with book pages', visualExplain: 'Visual explanation', visualExplainShort: 'Visual', pngTitle: 'Download illustration as PNG', pngFail: 'Could not save image', aiImageBtn: 'Generate AI image', aiImageTitle: 'Generate a photographic illustration for this concept', aiImageLoading: 'Generating image', aiImageFail: 'Could not generate image — check your OpenRouter key',
    ttsListen: 'Listen to explanation', ttsStop: 'Stop', ttsNoText: 'Nothing to read', ttsUnsupported: 'Your browser does not support text-to-speech',
    darkOn: 'Dark mode', darkOff: 'Light mode',
    exportPng: 'Save diagram as image', printDiagram: 'Print diagram',
    btnExplain: 'Explain', btnDiagram: '🌐 Visual Diagram', btnSummary: 'Summary', btnStop: 'Stop', btnSend: 'Send', btnGenerate: 'Generate exam', btnSave: 'Save',
    askFollowUp: 'Ask about this chapter', newExam: 'New exam', myExams: 'My exams',
    pdfPaneTitle: '📄 Book pages',
    pdfShow: '📄 Book pages', pdfHide: 'Hide book pages', pdfRangeHint: 'Chapter pages:',
    splitHalf: '⊞ Split', splitFull: '⊟ Full', splitTitle: 'Split view: explanation and page side-by-side', splitTitleOff: 'Exit split view: full width explanation',
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
  splitMode: false,
  examTaking: null,
  examChapters: [],
  chat: { messages: [], controller: null, sending: false },
  explain: { controller: null, md: '', images: [], aiImages: [] },
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
  setCommonTitles();
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
  let raw = marked.parse(src || '');
  raw = raw
    .replace(/\[FIG:[^\]]*\]([\s\S]*?)\[\/FIG\]/g, (_m, inner) => `<figure class="ai-fig">${inner}</figure>`)
    .replace(/<svg /g, '<svg ')
    .replace(/^\s*>?\s*\[FIG:.*$/gm, '')
    .replace(/^\s*>?\s*\[\/FIG\]\s*$/gm, '');
  if (window.DOMPurify) {
    if (!window.__purifyHooked) {
      window.__purifyHooked = true;
      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if ((node.tagName === 'IMG' || node.tagName === 'IMAGE' || node.tagName === 'USE') && node.getAttribute('href')) {
          const h = node.getAttribute('href');
          if (/^data:image\//.test(h)) node.setAttribute('src', h);
        }
      });
    }
    return DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
      ALLOW_DATA_ATTR: true,
      ADD_TAGS: ['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'image', 'foreignObject', 'marker', 'symbol', 'use', 'textPath', 'clipPath', 'mask', 'pattern', 'figure', 'figcaption'],
      ADD_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'fill-opacity', 'stroke-opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'opacity', 'transform', 'points', 'x1', 'y1', 'x2', 'y2', 'rx', 'ry', 'preserveAspectRatio', 'clip-path', 'fill-rule', 'stroke-dasharray', 'offset', 'gradientUnits', 'gradientTransform', 'spreadMethod', 'tableValues', 'stop-color', 'stop-opacity', 'href', 'src', 'alt', 'image-rendering'],
    });
  }
  return raw;
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
  if (name === 'timetable') renderTimetable();
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
  const vbox = $('#explainVisualBox'); if (vbox) vbox.classList.add('hidden');
  state.explain.images = [];
  const qb = $('#quizBox'); if (qb) qb.classList.add('hidden');
  const cb = $('#cardsBox'); if (cb) cb.classList.add('hidden');
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

function setSplitMode(on) {
  state.splitMode = !!on;
  const layout = $('#learnLayout');
  const btn = $('#explainSplitBtn');
  if (layout) {
    layout.classList.toggle('lg:grid-cols-2', state.splitMode);
    layout.classList.toggle('lg:grid-cols-1', !state.splitMode);
  }
  if (btn) {
    btn.classList.toggle('btn-primary', state.splitMode);
    btn.classList.toggle('btn-ghost', !state.splitMode);
    btn.textContent = state.splitMode ? '⊟' : '⊞';
    btn.title = state.splitMode ? L().splitTitleOff : L().splitTitle;
  }
}

function showChapterPdf() {
  const pr = chapterPageRange();
  if (pr && window.PdfViewer) {
    setSplitMode(true);
    window.PdfViewer.show(state.learn.bookId, pr.start, pr.end);
    updatePdfToggleUI();
  }
}

/* ================= VISUAL EXPLANATION (extract PDF pages as images) ================= */
async function extractPdfPagesAsImages(bookId, pageStart, pageEnd, maxImages) {
  const imgs = [];
  if (!window.PdfViewer || !window.__SMART) return imgs;
  try {
    const smart = await window.__SMART;
    const book = await smart.getBook(bookId);
    if (!book) return imgs;
    const file = await smart.getOriginalFile(bookId);
    if (!file) return imgs;
    const pdfjsLib = smart.pdfjs || window.pdfjsLib;
    if (!pdfjsLib) return imgs;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const count = Math.min(maxImages || 4, pageEnd - pageStart + 1);
    const step = Math.max(1, Math.floor((pageEnd - pageStart + 1) / count));
    const pages = [];
    for (let i = 0; i < count && (pageStart + i * step) <= pageEnd; i++) {
      pages.push(pageStart + i * step);
    }
    for (const pageNum of pages) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.7 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        if (dataUrl && dataUrl.length > 1000) {
          imgs.push({ page: pageNum, data: dataUrl });
        }
      } catch (e) { /* skip page */ }
    }
  } catch (e) { /* extraction failed */ }
  return imgs;
}

function renderVisualExplain(images) {
  const box = $('#explainVisualBox');
  if (!box || !images || !images.length) { if (box) box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-slate-500">🖼️ صفحات الكتاب</span>
      <button id="visualClose" class="btn-ghost text-xs px-2">✕</button>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-2" id="visualScroll">
      ${images.map((img) => `
        <div class="flex-shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer hover:shadow-lg transition" data-page="${img.page}">
          <img src="${img.data}" alt="صفحة ${img.page}" class="h-40 object-contain" />
          <div class="text-center text-[11px] font-bold text-slate-500 py-1 bg-slate-50">صفحة ${img.page}</div>
        </div>`).join('')}
    </div>`;
  $('#visualClose').addEventListener('click', () => box.classList.add('hidden'));
  box.querySelectorAll('[data-page]').forEach((el) => {
    el.addEventListener('click', () => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-brand-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-brand-500'), 1500);
    });
  });
}

/* Convert inline <svg> in the explanation into downloadable PNG images */
function wireSvgPngButtons(container) {
  if (!container) return;
  const svgs = container.querySelectorAll('.md-body svg');
  svgs.forEach((svg) => {
    if (svg.closest('.fig-actions')) return;
    const wrap = document.createElement('div');
    wrap.className = 'fig-actions flex items-center gap-2 mt-1 mb-3';
    svg.after(wrap);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-ghost text-xs px-2.5 py-1 rounded-lg';
    btn.textContent = '⬇️ PNG';
    btn.title = L().pngTitle;
    btn.addEventListener('click', () => {
      try {
        const clone = svg.cloneNode(true);
        const vb = (svg.getAttribute('viewBox') || '').split(' ').map(Number);
        const w = vb[2] || svg.width?.baseVal?.value || 700;
        const h = vb[3] || svg.height?.baseVal?.value || 300;
        const data = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => { if (blob) downloadBlob(blob, 'figure.png'); }, 'image/png');
        };
        img.onerror = () => { URL.revokeObjectURL(url); toast(L().pngFail); };
        img.src = url;
      } catch (e) { toast(L().pngFail); }
    });
    wrap.appendChild(btn);
    const aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.className = 'btn-ghost text-xs px-2.5 py-1 rounded-lg';
    aiBtn.textContent = '🖼️ ' + L().aiImageBtn;
    aiBtn.title = L().aiImageTitle;
    aiBtn.addEventListener('click', async () => {
      aiBtn.disabled = true;
      const orig = aiBtn.textContent;
      aiBtn.textContent = L().aiImageLoading + '...';
      try {
        const concept = svg.getAttribute('data-concept') || svg.textContent?.trim().slice(0, 120) || 'مفهوم الفصل';
        const prompt = state.lang === 'ar'
          ? 'ارسم صورة توضيحية تعليمية واضحة عن: ' + concept
          : 'Draw a clear educational illustration about: ' + concept;
        const r = await apiPost('/api/generate-image', { prompt, lang: state.lang });
        if (r.error) throw new Error(r.error);
        const src = r.data ? 'data:' + (r.mime || 'image/webp') + ';base64,' + r.data : r.url;
        if (!src) throw new Error(L().aiImageFail);
        if (!state.explain.aiImages) state.explain.aiImages = [];
        state.explain.aiImages.push({ src, concept: concept.slice(0, 120) });
        const imgWrap = document.createElement('div');
        imgWrap.className = 'mt-2 ai-photo rounded-xl overflow-hidden';
        imgWrap.innerHTML = '<img src="' + src + '" alt="' + esc(concept) + '" class="w-full object-contain border border-slate-200 rounded-xl">';
        svg.after(imgWrap);
      } catch (e) {
        toast(e.message || L().aiImageFail);
      } finally {
        aiBtn.disabled = false;
        aiBtn.textContent = orig;
      }
    });
    wrap.appendChild(aiBtn);
  });
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
  const active = !(prev === el);
  const target = active ? el : null;
  if (target) target.classList.add('fs-active');
  document.body.classList.toggle('fs-open', !!target);
  fsState.el = target;
  fsButtons().forEach((b) => {
    const mine = !!(target && b.dataset.fsTarget === el.id);
    b.classList.toggle('fs-on', mine);
    b.title = mine ? L().fsExit : L().fsEnter;
  });
  if (target) enterRealFs(); else exitRealFs();
  setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
}

function enterRealFs() {
  const doc = document.documentElement;
  try {
    if (doc && doc.requestFullscreen && !document.fullscreenElement) {
      const p = doc.requestFullscreen();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  } catch (e) {}
}

function exitRealFs() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      const p = document.exitFullscreen();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  } catch (e) {}
}

function setCommonTitles() {
  const t = {
    paneFsBtn: L().fsEnter, explainFsBtn: L().fsEnter,
    ttsBtn: L().ttsListen, darkToggle: document.body.classList.contains('dark') ? L().darkOff : L().darkOn,
    diagramPngBtn: L().exportPng, diagramPrintBtn: L().printDiagram,
    flashcardsBtn: L().btnFlashcardsT, quizBtn: L().btnQuickQuizT,
    explainMdBtn: L().btnExplainMd, explainPrintBtn: L().btnExplainPrint,
    reviewPlanBtn: L().btnReviewPlanT,
  };
  Object.keys(t).forEach((id) => { const el = document.getElementById(id); if (el) el.title = t[id]; });
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
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && fsState.el) {
      const el = fsState.el;
      el.classList.remove('fs-active');
      document.body.classList.remove('fs-open');
      fsState.el = null;
      fsButtons().forEach((b) => { b.classList.remove('fs-on'); b.title = L().fsEnter; });
      setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    }
  });
}

/* ================= STUDY AIDS (flashcards / quick quiz / review plan / exports) ================= */
const flashState = { cards: [], idx: 0, show: false, title: '' };
const quizState = { asked: 0, correct: 0 };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

async function apiPost(path, bodyObj) {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyObj) });
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) throw new Error(data?.error || 'HTTP ' + res.status);
  return data;
}

async function showFlashcards() {
  if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
  const box = $('#cardsBox');
  const explain = $('#explainBox');
  if (explain) explain.classList.remove('hidden');
  if (quizBoxIsVisible()) $('#quizBox').classList.add('hidden');
  box.classList.remove('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  box.innerHTML = `<div class="flex items-center justify-center gap-2 text-sm text-slate-500 py-6"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div>${esc(L().cardsThinking)}</div>`;
  try {
    const data = await apiPost('/api/flashcards', { bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang: state.lang });
    const cards = (data?.cards || []).filter((c) => c && c.question && c.answer);
    const chapter = (state.books.find((b) => b.id === state.learn.bookId)?.chapters || []).find((c) => c.id === state.learn.chapterId);
    if (!cards.length) { box.classList.add('hidden'); toast(L().cardsEmpty); return; }
    flashState.cards = cards; flashState.idx = 0; flashState.show = false; flashState.title = chapter?.title || '';
    renderFlashcard();
  } catch (e) {
    box.classList.add('hidden');
    toast(e.message || L().cardsEmpty);
  }
}

function quizBoxIsVisible() {
  const q = $('#quizBox');
  return q && !q.classList.contains('hidden');
}

function renderFlashcard() {
  const box = $('#cardsBox');
  if (!box) return;
  const c = flashState.cards[flashState.idx];
  const n = flashState.idx + 1;
  box.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-slate-500">${esc(flashState.title)} · ${esc(L().cardsCount.replace('{n}', n + '/' + flashState.cards.length))}</span>
      <button id="cardsClose" class="btn-ghost text-xs px-2.5 py-1.5 rounded-lg">✕</button>
    </div>
    <div class="rounded-xl border-2 border-brand-200 bg-white p-5 min-h-[8rem] flex flex-col justify-center">
      <p class="text-[10px] font-bold text-brand-400 tracking-wide mb-1">${flashState.show ? L().cardsFlipBack : L().cardsFlip}</p>
      <p class="font-bold text-brand-800 leading-relaxed">${esc(flashState.show ? c.answer : c.question)}</p>
    </div>
    <div class="flex flex-wrap gap-2 mt-3">
      <button id="cardsPrev" class="btn-secondary text-xs px-3 py-2 rounded-lg">${esc(L().cardsPrev)}</button>
      <button id="cardsFlip" class="btn-primary flex-1 text-xs px-3 py-2 rounded-lg">${flashState.show ? L().cardsFlipBack : L().cardsFlip}</button>
      <button id="cardsNext" class="btn-secondary text-xs px-3 py-2 rounded-lg">${esc(L().cardsNext)}</button>
    </div>`;
  const close = () => box.classList.add('hidden');
  $('#cardsClose').addEventListener('click', close);
  $('#cardsPrev').addEventListener('click', () => { if (flashState.idx > 0) { flashState.idx--; flashState.show = false; renderFlashcard(); } });
  $('#cardsNext').addEventListener('click', () => { if (flashState.idx < flashState.cards.length - 1) { flashState.idx++; flashState.show = false; renderFlashcard(); } });
  $('#cardsFlip').addEventListener('click', () => { flashState.show = !flashState.show; renderFlashcard(); });
}

async function showQuickQuiz() {
  if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
  const box = $('#quizBox');
  const explain = $('#explainBox');
  if (explain) explain.classList.remove('hidden');
  const cb = $('#cardsBox'); if (cb) cb.classList.add('hidden');
  box.classList.remove('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  box.innerHTML = `<div class="flex items-center justify-center gap-2 text-sm text-slate-500 py-6"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div>${esc(L().quizThinking)}</div>`;
  try {
    const data = await apiPost('/api/quickquiz', { bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang: state.lang });
    const q = data?.quiz;
    if (!q || !q.question || !q.options?.length) { box.classList.add('hidden'); toast(L().cardsEmpty); return; }
    quizState.asked++;
    renderQuickQuiz(q);
  } catch (e) {
    box.classList.add('hidden');
    toast(e.message || L().cardsEmpty);
  }
}

function renderQuickQuiz(q) {
  const box = $('#quizBox');
  if (!box) return;
  const idxCorrect = q.answerIndex;
  const optCls = (i, answered, chosen) => {
    if (!answered) return 'border-slate-200 bg-white hover:bg-brand-50';
    if (i === idxCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    if (i === chosen) return 'border-rose-500 bg-rose-50 text-rose-700';
    return 'border-slate-200 bg-white text-slate-400';
  };
  box.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-slate-500">⚡ ${esc(L().quizTitle)} · ${L().quizScore.replace('{a}', quizState.correct).replace('{b}', quizState.asked)}</span>
      <button id="quizClose" class="btn-ghost text-xs px-2.5 py-1.5 rounded-lg">✕</button>
    </div>
    <p class="font-bold text-slate-800 leading-relaxed mb-3">${esc(q.question)}</p>
    <div class="space-y-2" id="quizOptions"></div>
    <p id="quizExplain" class="hidden text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed mt-3"></p>
    <button id="quizAgain" class="hidden btn-primary w-full text-sm px-3 py-2.5 rounded-xl mt-3">${esc(L().quizAgain)}</button>`;
  const opts = $('#quizOptions');
  opts.innerHTML = '';
  q.options.forEach((o, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = o;
    b.className = `w-full text-right px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${optCls(i, false, -1)}`;
    b.addEventListener('click', () => {
      const isCorrect = i === idxCorrect;
      if (isCorrect) quizState.correct++;
      opts.innerHTML = '';
      q.options.forEach((oo, j) => {
        const x = document.createElement('button');
        x.type = 'button';
        x.disabled = true;
        x.textContent = oo;
        x.className = `w-full text-right px-3 py-2.5 rounded-xl border text-sm font-semibold ${optCls(j, true, i)}`;
        opts.appendChild(x);
      });
      const msg = (chosenIdx, correct) => (chosenIdx === correct ? ' ' + L().quizCorrect : ' ' + L().quizWrong + ' — ' + L().quizScore.replace('{a}', quizState.correct).replace('{b}', quizState.asked));
      const exp = $('#quizExplain');
      exp.textContent = msg(i, idxCorrect) + (q.explanation ? '\n' + q.explanation : '');
      exp.classList.add('hidden');
      requestAnimationFrame(() => exp.classList.remove('hidden'));
      const again = $('#quizAgain');
      again.classList.remove('hidden');
      again.addEventListener('click', showQuickQuiz);
    });
    opts.appendChild(b);
  });
  $('#quizClose').addEventListener('click', () => box.classList.add('hidden'));
}

function downloadExplainMd() {
  const md = state.explain?.md || '';
  if (!md.trim()) { toast(L().explainNoText); return; }
  const b = state.books.find((x) => x.id === state.learn.bookId);
  const ch = (b?.chapters || []).find((x) => x.id === state.learn.chapterId);
  const heading = (ch && ch.title) || (b && b.title) || 'explain';
  const title = heading.replace(/[\\/:*?"<>|]+/g, '-');
  let mdContent = '# ' + heading + '\n\n' + md;
  if (state.explain?.images?.length) {
    mdContent += '\n\n---\n\n## ' + L().visualExplain + '\n\n';
    state.explain.images.forEach((img) => {
      mdContent += `![صفحة ${img.page}](${img.data})\n\n`;
    });
  }
  if (state.explain?.aiImages?.length) {
    mdContent += '\n\n---\n\n## 🖼️ ' + L().aiImageBtn + '\n\n';
    state.explain.aiImages.forEach((im) => {
      mdContent += `![${im.concept}](${im.src})\n\n`;
    });
  }
  downloadBlob(new Blob([mdContent], { type: 'text/markdown;charset=utf-8' }), title + '.md');
  toast(L().explainMdSave);
}

function printExplain() {
  const el = $('#explainContent');
  if (!el || !el.textContent.trim()) { toast(L().explainNoText); return; }
  const b = state.books.find((x) => x.id === state.learn.bookId);
  const ch = (b?.chapters || []).find((x) => x.id === state.learn.chapterId);
  const title = ch?.title || b?.title || 'explanation';
  let printHtml = el.innerHTML;
  if (state.explain?.images?.length) {
    printHtml += `<h2>${esc(L().visualExplain)}</h2>` + state.explain.images.map((img) => `<div style="margin:12px 0"><img src="${img.data}" style="max-width:100%;border:1px solid #cbd5e1;border-radius:8px" /><p style="text-align:center;font-size:11px;color:#64748b">صفحة ${img.page}</p></div>`).join('');
  }
  if (state.explain?.aiImages?.length) {
    printHtml += `<h2>🖼️ ${esc(L().aiImageBtn)}</h2>` + state.explain.aiImages.map((im) => `<div style="margin:12px 0"><img src="${im.src}" style="max-width:100%;border:1px solid #cbd5e1;border-radius:8px" /><p style="text-align:center;font-size:11px;color:#64748b">${esc(im.concept)}</p></div>`).join('');
  }
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Cairo,'Segoe UI',Arial,sans-serif;direction:rtl;line-height:1.8;color:#1e293b;max-width:800px;margin:24px auto;padding:0 16px}h1,h2,h3,h4{color:#312e81}pre{background:#f1f5f9;padding:12px;border-radius:8px;direction:ltr;text-align:left;overflow-x:auto}code{background:#f1f5f9;padding:1px 5px;border-radius:4px}table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid #cbd5e1;padding:6px 10px;text-align:right}img{max-width:100%}blockquote{border-right:4px solid #c7d2fe;margin:8px 0;padding:4px 12px;color:#475569}@media print{body{margin:0;padding:0}}</style></head><body><h1>${esc(title)}</h1>${printHtml}<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
  w.document.close();
}

async function showReviewPlan() {
  const box = $('#reviewPlanBox');
  if (!box) return;
  box.classList.remove('hidden');
  box.innerHTML = `<div class="flex items-center justify-center gap-2 text-sm text-slate-500 py-6"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div>${esc(L().planThinking)}</div>`;
  try {
    const data = await apiPost('/api/review-plan', { lang: state.lang });
    const plan = data?.plan;
    const days = Array.isArray(plan?.days) ? plan.days : [];
    if (!days.length) { box.classList.add('hidden'); toast(L().planEmpty); return; }
    renderPlanCards(plan);
  } catch (e) {
    box.classList.add('hidden');
    toast(e.message || L().planFail);
  }
}

function renderPlanCards(plan) {
  const box = $('#reviewPlanBox');
  if (!box) return;
  box.innerHTML = `
    <div class="flex items-center justify-between mb-1">
      <h3 class="font-extrabold text-brand-800 text-lg">🗓 ${esc(L().planTitle)}</h3>
      <button id="planClose" class="btn-ghost text-xs px-2.5 py-1.5 rounded-lg">✕</button>
    </div>
    <p class="text-sm text-slate-500 mb-4 leading-relaxed">${esc(plan.summary || '')}</p>
    ${plan.days.map((d) => `
      <div class="border border-slate-200 rounded-xl p-4 mb-3 bg-white">
        <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
          <span class="font-extrabold text-brand-700">${esc(d.label || L().planDay + ' ' + d.day)}</span>
          <span class="flex flex-wrap gap-1">${(d.topics || []).map((t) => `<span class="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">${esc(t)}</span>`).join('')}</span>
        </div>
        <ul class="space-y-1.5">${(d.tasks || []).map((t) => `<li class="text-sm text-slate-600 flex gap-2"><span class="text-brand-400">•</span><span>${esc(t)}</span></li>`).join('')}</ul>
      </div>`).join('')}`;
  $('#planClose').addEventListener('click', () => box.classList.add('hidden'));
}

/* ================= TIMETABLE ================= */
const dayLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const dayLabelsEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
let ttSchedule = null;

function ttBooksChecked() {
  return [...document.querySelectorAll('#ttBooksList input[type="checkbox"]:checked')].map((x) => x.value);
}

function renderTimetable() {
  const l = L();
  const booksEl = $('#ttBooksList');
  if (!booksEl) return;
  if (!state.books.length) {
    booksEl.innerHTML = '<p class="text-xs text-slate-400">' + esc(l.ttBooksHint) + '</p>';
    $('#ttBooksHint').classList.remove('hidden');
  } else {
    $('#ttBooksHint').classList.add('hidden');
    booksEl.innerHTML = state.books.map((b) => `
      <label class="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
        <input type="checkbox" value="${esc(b.id)}" class="accent-brand-500">
        <span class="text-sm font-bold truncate">${esc(b.title)}</span>
        <span class="text-[11px] text-slate-400 ml-auto">${b.chapters?.length || 0}</span>
      </label>`).join('');
  }
  if (!$('#ttStartDate').value) {
    const now = new Date();
    $('#ttStartDate').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }
  const days = state.lang === 'ar' ? dayLabels : dayLabelsEn;
  $('#ttWeekdays').innerHTML = days.map((d, i) => `
    <label class="flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
      <input type="checkbox" value="${i}" checked class="accent-brand-500"> <span class="text-[11px] font-bold">${esc(d)}</span>
    </label>`).join('');
  if (ttSchedule) renderTimetableResult(ttSchedule, l);
}

function renderTimetableResult(data, l) {
  if (!data) return;
  ttSchedule = data;
  const stats = data.stats || {};
  $('#ttStats').classList.remove('hidden');
  $('#ttStats').innerHTML = `
    <div class="flex flex-wrap gap-3">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-100 rounded-full px-3 py-1.5">📚 ${esc(stats.books || 0)} ${esc(l.ttStatsBooks)}</span>
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-3 py-1.5">📖 ${esc(stats.units || 0)} ${esc(l.ttStatsUnits)}</span>
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-3 py-1.5">📅 ${esc(stats.days || 0)} ${esc(l.ttStatsDays)}</span>
      <span class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full px-3 py-1.5">⏱ ${esc(stats.hoursPerWeek || 0)} ${esc(l.ttStatsHours)}</span>
    </div>`;
  const dayN = state.lang === 'ar' ? dayLabels : dayLabelsEn;
  $('#ttResult').innerHTML = (data.schedule || []).map((d) => `
    <div class="card p-4">
      <div class="flex items-center justify-between mb-2 flex-wrap gap-1">
        <span class="text-sm font-extrabold text-brand-800">${esc(d.dayLabel)} · ${esc(String(d.date).split('-').reverse().join('/'))}</span>
        <span class="flex gap-1 flex-wrap">${(d.sessions || []).map((s) => `<span class="inline-block bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full">${esc(s.subject)} · ${esc(s.minutes)}د</span>`).join('')}</span>
      </div>
      <ul class="space-y-1.5">${(d.sessions || []).map((s) => `<li class="text-sm text-slate-700 flex gap-2"><span class="text-brand-400">▸</span><span class="font-bold">${esc(s.subject)}:</span> <span>${esc(s.text)} <span class="text-slate-400 text-xs">(${esc(s.minutes)}${esc(l.ttMinutes)})</span></span></li>`).join('')}</ul>
    </div>`).join('');
  $('#ttPrintBtn').classList.remove('hidden');
}

async function generateTimetable() {
  const l = L();
  const ids = ttBooksChecked();
  if (!ids.length) { toast(L().ttBooksHint); return; }
  const spinner = `<div class="flex items-center justify-center gap-2 text-sm text-slate-500 py-8"><div class="spinner" style="width:18px;height:18px;border-width:2px"></div>${esc(L().thinking)}</div>`;
  $('#ttStatus').classList.remove('hidden');
  $('#ttStatus').innerHTML = `<div class="flex items-center gap-2 text-sm text-slate-600"><div class="spinner" style="width:16px;height:16px;border-width:2px"></div>${esc(L().planThinking)}</div>`;
  const weekdays = [...document.querySelectorAll('#ttWeekdays input:checked')].map((x) => Number(x.value));
  try {
    const body = {
      bookIds: ids,
      startDate: $('#ttStartDate').value,
      weekdays,
      sessionsPerDay: Number($('#ttSessions').value) || 1,
      minutesPerSession: Number($('#ttMinutes').value) || 60,
      subjectsPerDay: Number($('#ttSubjectsDay').value) || 1,
      lang: state.lang,
    };
    const data = await apiPost('/api/timetable', body);
    $('#ttStatus').classList.add('hidden');
    renderTimetableResult(data, l);
    $('#ttResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    $('#ttStatus').innerHTML = `<span class="text-rose-600 font-bold">${esc(e.message || L().planFail)}</span>`;
  }
}

function resetTimetable() {
  ttSchedule = null;
  $('#ttResult').innerHTML = '';
  $('#ttStats').classList.add('hidden');
  $('#ttStats').innerHTML = '';
  $('#ttPrintBtn').classList.add('hidden');
  $('#ttStatus').classList.add('hidden');
  $('#ttStatus').innerHTML = '';
}

function printTimetable() {
  const l = L();
  if (!ttSchedule) return;
  const dayN = state.lang === 'ar' ? dayLabels : dayLabelsEn;
  const rows = ttSchedule.schedule.map((d) => `
    <tr><td class="num">${esc(d.dayLabel)}<br><small>${esc(d.date)}</small></td><td>${d.sessions.map((s) => `<b>${esc(s.subject)}:</b> ${esc(s.text)} <small>(${s.minutes} ${esc(l.ttMinutes)})</small>`).join('<br>')}</td></tr>`).join('');
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(L().ttTitle)}</title><style>body{font-family:Cairo,'Segoe UI',Arial,sans-serif;direction:rtl;line-height:1.8;color:#1e293b;max-width:800px;margin:24px auto;padding:0 16px}h1{color:#312e81}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:right;vertical-align:top}td.num{white-space:nowrap;font-weight:bold}@media print{body{margin:0;padding:0}}</style></head><body><h1>${esc(L().ttTitle)}</h1><table><thead><tr><th>${esc(l.ttDays)}</th><th>${esc(l.ttTitle)}</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
  w.document.close();
}

function bindTimetable() {
  const gen = $('#ttGenerateBtn');
  if (gen) gen.addEventListener('click', generateTimetable);
  const st = $('#ttStartDate'); if (st) st.disabled = false;
  const rs = $('#ttResetBtn'); if (rs) rs.addEventListener('click', resetTimetable);
  const pr = $('#ttPrintBtn'); if (pr) pr.addEventListener('click', printTimetable);
  const minus = $('#ttSessMinus'), plus = $('#ttSessPlus'), sess = $('#ttSessions');
  if (minus && sess) minus.addEventListener('click', () => { sess.value = Math.max(1, (Number(sess.value) || 1) - 1); });
  if (plus && sess) plus.addEventListener('click', () => { sess.value = Math.min(6, (Number(sess.value) || 1) + 1); });
}

/* ================= TTS (text to speech) ================= */
const tts = { active: false, btn: null, voices: [] };

function stopTts() {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (tts.active) { tts.active = false; updateTtsBtn(); }
}

function updateTtsBtn() {
  if (!tts.btn) return;
  tts.btn.textContent = tts.active ? '⏹' : '🔊';
  tts.btn.title = tts.active ? L().ttsStop : L().ttsListen;
}

function speakChunks(text) {
  const synth = window.speechSynthesis;
  const parts = (text.match(/[^.!؟؟؛\n]+[.!؟؟؛\n]*/g) || []).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) { tts.active = false; updateTtsBtn(); return; }
  synth.cancel();
  let i = 0;
  const next = () => {
    if (!tts.active || i >= parts.length) {
      if (i >= parts.length) { tts.active = false; updateTtsBtn(); }
      return;
    }
    const u = new SpeechSynthesisUtterance(parts[i++]);
    u.lang = 'ar-SA';
    if (tts.voices.length) {
      const v = tts.voices.find((x) => x.lang && x.lang.split('-')[0].toLowerCase() === 'ar') || tts.voices.find((x) => x.lang && x.lang.toLowerCase().indexOf('ar') === 0);
      if (v) u.voice = v;
    }
    u.rate = 1;
    u.pitch = 1;
    u.onend = () => setTimeout(next, 30);
    u.onerror = () => { tts.active = false; updateTtsBtn(); };
    synth.speak(u);
  };
  setTimeout(next, 80);
}

function toggleTts() {
  if (!('speechSynthesis' in window)) { toast(L().ttsUnsupported); return; }
  if (tts.active) { stopTts(); return; }
  const content = $('#explainContent');
  const text = (content && (content.innerText || content.textContent || '').trim()) || '';
  if (!text) { toast(L().ttsNoText); return; }
  tts.active = true;
  updateTtsBtn();
  speakChunks(text);
}

function initTts() {
  tts.btn = $('#ttsBtn');
  if (!('speechSynthesis' in window)) { if (tts.btn) tts.btn.classList.add('hidden'); return; }
  if (!tts.btn) return;
  const load = () => { tts.voices = window.speechSynthesis.getVoices(); };
  load();
  if ('onvoiceschanged' in window.speechSynthesis) window.speechSynthesis.onvoiceschanged = load;
  tts.btn.addEventListener('click', toggleTts);
  window.addEventListener('beforeunload', () => { if (tts.active) window.speechSynthesis.cancel(); });
}

/* ================= DARK MODE ================= */
function applyDark(dark) {
  const d = dark === undefined ? localStorage.getItem('darkMode') === '1' : dark;
  document.body.classList.toggle('dark', d);
  localStorage.setItem('darkMode', d ? '1' : '0');
  const btn = $('#darkToggle');
  if (btn) btn.title = d ? L().darkOff : L().darkOn;
}

function bindDark() {
  const btn = $('#darkToggle');
  if (btn) btn.addEventListener('click', () => applyDark(!document.body.classList.contains('dark')));
}

function bindStudyTools() {
  const f = $('#flashcardsBtn'); if (f) f.addEventListener('click', showFlashcards);
  const q = $('#quizBtn'); if (q) q.addEventListener('click', showQuickQuiz);
  const md = $('#explainMdBtn'); if (md) md.addEventListener('click', downloadExplainMd);
  const pr = $('#explainPrintBtn'); if (pr) pr.addEventListener('click', printExplain);
  const rp = $('#reviewPlanBtn'); if (rp) rp.addEventListener('click', showReviewPlan);
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
    setSplitMode(false);
    updatePdfToggleUI();
  });

  $('#pdfToggleBtn').addEventListener('click', () => {
    const pane = $('#pdfPane');
    if (pane && !pane.classList.contains('hidden')) {
      if (window.PdfViewer) window.PdfViewer.clear();
      setSplitMode(false);
      updatePdfToggleUI();
    } else {
      if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
      showChapterPdf();
    }
  });

  $('#explainSplitBtn').addEventListener('click', () => {
    const pane = $('#pdfPane');
    if (!pane) return;
    if (state.splitMode) {
      if (window.PdfViewer) window.PdfViewer.clear();
      setSplitMode(false);
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
  window.addEventListener('pdf-pane', () => {
    const pane = $('#pdfPane');
    if (pane && pane.classList.contains('hidden')) setSplitMode(false);
  });

  $('#explainBtn').addEventListener('click', async () => {
    if (!state.learn.bookId || !state.learn.chapterId) { toast(L().chooseChapter); return; }
    if (state.explain.controller) { state.explain.controller.abort(); }
    stopTts();
    showChapterPdf();
    const controller = new AbortController();
    state.explain.controller = controller;
    $('#explainBox').classList.remove('hidden');
    $('#explainContent').innerHTML = '';
    $('#quizBox').classList.add('hidden');
    $('#cardsBox').classList.add('hidden');
    state.explain.md = '';
    state.explain.images = [];
    state.explain.aiImages = [];
    $('#explainVisualBox').classList.add('hidden');
    $('#stopExplainBtn').classList.remove('hidden');
    setStatusChip(L().thinking);
    const style = $('#learnStyle').value;
    const styleInjection = style === '1' ? '\n\nملاحظة: استخدم لغة مبسطة جداً وقصّر الأمثلة.' : style === '2' ? '\n\nملاحظة: ركّز على ما يأتي في الامتحانات والأسئلة المتوقعة.' : '';
      const visualEl = $('#visualExplain');
    const wantVisual = !!(visualEl && visualEl.checked);
    const visualize = wantVisual;
    if (wantVisual) {
      const pr = chapterPageRange();
      setStatusChip(L().visualExplainShort);
      extractPdfPagesAsImages(state.learn.bookId, pr.start, pr.end, 3).then((imgs) => {
        state.explain.images = imgs;
        renderVisualExplain(imgs);
      }).catch(() => {});
    }
    try {
      let full = '';
      await streamApi('/api/explain', {
        bookId: state.learn.bookId, chapterId: state.learn.chapterId, lang: state.lang, visualize,
      }, {
        signal: controller.signal,
        onChunk: (t) => {
          full += t;
          state.explain.md = full;
          $('#explainContent').innerHTML = renderMarkdown(full);
          wireSvgPngButtons($('#explainContent'));
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
  bindStudyTools();
  bindFullscreen();
  bindTimetable();
  initTts();
  bindDark();
  applyDark();
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