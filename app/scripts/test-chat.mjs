// اختبار سريع لميزة المحادثة (chat) داخل الفصل
const BASE = 'http://localhost:3000';

async function streamChat(payload) {
  const res = await fetch(BASE + '/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('chat ' + res.status);
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
      const obj = JSON.parse(p.trim().slice(5).trim());
      if (obj.type === 'chunk') full += obj.text;
      if (obj.type === 'error') throw new Error(obj.error);
      if (obj.type === 'done') break;
    }
  }
  clearTimeout(timer);
  return full;
}

const { books } = await fetch(BASE + '/api/books').then((r) => r.json());
const b = books.find((x) => x.chapters?.length) || books[0];
const ch = b?.chapters?.[0];
if (!ch) { console.log('لا يوجد كتاب/فصول'); process.exit(0); }

console.log('=> كتاب:', b.title, '| فصل:', ch.title);
const out = await streamChat({ bookId: b.id, chapterId: ch.id, lang: 'ar', history: [{ role: 'user', content: 'ما الفرق بين السرعة والعجلة؟' }] });
console.log('رد الشات (' + out.length + ' حرف):', out.slice(0, 300).replace(/\n+/g, ' '));
console.log('تم اختبار الشات بنجاح ✓');