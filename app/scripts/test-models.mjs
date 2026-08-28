import 'dotenv/config';
const key = process.env.OPENROUTER_API_KEY;
const candidates = [
  'z-ai/glm-5.2:free',
  'thinknear/glm-5.2:free',
  'minimax/minimax-m3:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'thinkingmachines/inkling:free',
  'google/gemma-4-31b-it:free',
];
const q = 'اشرح باختصار قانون نيوتن الثاني في الفيزياء بالعربي، واكتب معادلته.';
for (const model of candidates) {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Smart Tutor',
      },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: q }], max_tokens: 200, temperature: 0.4 }),
    });
    if (!res.ok) { console.log(`\n[${model}] FAIL ${res.status}: ${(await res.text()).slice(0, 200)}`); continue; }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.replace(/\n+/g, ' ').slice(0, 180);
    console.log(`\n[${model}] OK (${data?.usage?.completion_tokens} tok)\n  -> ${reply}`);
  } catch (e) { console.log(`\n[${model}] ERROR: ${e}`); }
}