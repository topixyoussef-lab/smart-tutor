export function systemTeacher(lang) {
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

export function explainMessages({ bookTitle, chapterTitle, chapterText, lang }) {
  const user =
    lang === 'ar'
      ? `اشرح هذا الفصل شرحاً مفصّلاً على مستوى الطالب: ضع له عناوين واضحة، اكتب القوانين أو المعادلات أو القواعد بصيغة LaTeX إن وُجدت، أعط أمثلة محلولة من الكتاب أو تطبيقات عملية، واذكر الأخطاء الشائعة.\n\n**الكتاب:** ${bookTitle}\n**الفصل:** ${chapterTitle}\n\n**نص الفصل من الكتاب:**\n${chapterText}`
      : `Explain this chapter in detail at a student level. Use clear headings, write any laws, equations, or rules in LaTeX where they exist, give worked examples from the book or practical applications, and mention common mistakes.\n\n**Book:** ${bookTitle}\n**Chapter:** ${chapterTitle}\n\n**Chapter text from the book:**\n${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
}

export function chatMessages({ bookTitle, chapterTitle, chapterText, lang, history }) {
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

export function summaryMessages({ bookTitle, chapterTitle, chapterText, lang }) {
  const user =
    lang === 'ar'
      ? `لخّص هذا الفصل كملخص مراجعة سريع: نقاط رئيسية، القوانين أو المعادلات أو المفاهيم الأساسية في قائمة، أصعب 3 أفكار، وسؤالان للتفكير.\n\n**الكتاب:** ${bookTitle}\n**الفصل:** ${chapterTitle}\n\n${chapterText}`
      : `Summarize this chapter as a quick study notes page: key points, the main laws/equations/key concepts as a list, the 3 hardest ideas, and 2 thought questions.\n\n**Book:** ${bookTitle}\n**Chapter:** ${chapterTitle}\n\n${chapterText}`;
  return [systemTeacher(lang), { role: 'user', content: user }];
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

export function examMessages({ bookTitle, chapters, level, types, count, lang }) {
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

export function gradeMessages({ question, modelAnswer, studentAnswer, points, lang, type }) {
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

export function analysisMessages({ examTitle, items, lang }) {
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

export function examTitlePrompt({ bookTitle, chapters, level, lang }) {
  const names = chapters.map((c) => c.title).join(' + ');
  const lv = level === 'easy' ? (lang === 'ar' ? 'سهل' : 'Easy') : level === 'hard' ? (lang === 'ar' ? 'صعب' : 'Hard') : lang === 'ar' ? 'متوسط' : 'Medium';
  return `${bookTitle} — ${names} (${lv})`;
}