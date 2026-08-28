import 'dotenv/config';

async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, error: 'no key' };
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return { ok: false, status: res.status };
  const data = await res.json();
  const free = (data?.data || []).filter(m => m.id.toLowerCase().includes(':free')).map(m => m.id);
  return { ok: true, total: (data?.data || []).length, freeModels: free };
}

async function testMoonshot() {
  const key = process.env.MOONSHOT_API_KEY;
  if (!key) return { ok: false, error: 'no key' };
  const res = await fetch('https://api.moonshot.ai/v1/models', {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => '') };
  const data = await res.json();
  return { ok: true, models: (data?.data || []).map(m => m.id) };
}

async function quickChat(provider, model) {
  const base = provider === 'moonshot' ? 'https://api.moonshot.ai/v1' : 'https://openrouter.ai/api/v1';
  const key = provider === 'moonshot' ? process.env.MOONSHOT_API_KEY : process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, error: 'no key' };
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'Smart Tutor' } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say OK in one word' }],
        max_tokens: 20,
        temperature: 0.3,
      }),
    });
    if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => '') };
    const data = await res.json();
    return { ok: true, reply: data?.choices?.[0]?.message?.content?.trim() };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

const or = await testOpenRouter();
console.log('OPENROUTER:', or.status === undefined && or.ok ? `مفتاح سليم، عدد الموديلات = ${or.total}` : JSON.stringify(or));
if (or.ok) {
  const top = ['deepseek/deepseek-chat-v3-0324:free', 'qwen/qwen2.5-72b-instruct:free', 'meta-llama/llama-3.3-70b-instruct:free'].filter(m => or.freeModels.includes(m));
  console.log('Free models available (sample):', top.length ? top.join(' | ') : '(batch listed below)');
  console.log('All free models:', or.freeModels.join(' | '));
}

const ms = await testMoonshot();
console.log('MOONSHOT:', ms.ok ? `مفتاح سليم، الموديلات = ${ms.models.join(' | ')}` : JSON.stringify(ms));

const chat = await quickChat('openrouter', 'deepseek/deepseek-chat-v3-0324:free');
console.log('OPENROUTER CHAT TEST:', chat.ok ? `OK -> "${chat.reply}"` : JSON.stringify(chat));

if (ms.ok && ms.models?.length) {
  const m = ms.models.find(x => /kimi/i.test(x)) || ms.models[0];
  const c2 = await quickChat('moonshot', m);
  console.log('MOONSHOT CHAT TEST (' + m + '):', c2.ok ? `OK -> "${c2.reply}"` : JSON.stringify(c2));
}