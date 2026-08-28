import { getSettings } from './store.js';

export const FREE_MODELS = [
  { id: 'minimax/minimax-m3:free', name: 'MiniMax M3 (مجاني، ممتاز بالعربية)', tag: 'مجاني' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'NVIDIA Nemotron Super 120B (مجاني)', tag: 'مجاني' },
  { id: 'z-ai/glm-5.2:free', name: 'GLM 5.2 (مجاني، ذكي جداً)', tag: 'مجاني' },
  { id: 'google/gemma-4-31b-it:free', name: 'Google Gemma 4 31B (مجاني)', tag: 'مجاني' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Google Gemma 4 26B (مجاني)', tag: 'مجاني' },
  { id: 'minimax/minimax-m2.7:free', name: 'MiniMax M2.7 (مجاني)', tag: 'مجاني' },
];

export const MOONSHOT_MODELS = [
  { id: 'kimi-k2.7-code', name: 'Kimi K2.7 Code' },
  { id: 'kimi-k2.6', name: 'Kimi K2.6' },
  { id: 'kimi-k2-turbo-preview', name: 'Kimi K2 Turbo Preview' },
];

export function endpointFor(provider) {
  if (provider === 'moonshot') return 'https://api.moonshot.ai/v1';
  return 'https://openrouter.ai/api/v1';
}

function headersFor(provider, key) {
  const h = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (provider === 'openrouter') {
    h['HTTP-Referer'] = 'http://localhost:3000';
    h['X-Title'] = 'Smart Tutor'; // يبقى ASCII فقط (فاريث fetch لا يقبل قيماً غير لاتينية)
  }
  return h;
}

export function currentConfig() {
  const s = getSettings();
  const provider = s.provider;
  const model = s.model;
  const key = provider === 'moonshot' ? s.moonshotKey : s.openrouterKey;
  if (!key) throw new Error('لا يوجد مفتاح API. افتح "الإعدادات" وأضف المفتاح.');
  return { provider, model, key };
}

export class AIError extends Error {
  constructor(message, status, raw) {
    super(message);
    this.status = status;
    this.raw = raw;
  }
}

export async function parseError(res, provider) {
  let bodyText = '';
  try { bodyText = await res.text(); } catch { bodyText = ''; }
  let msg = `خطأ من المزوّد (${res.status})`;
  try {
    const data = JSON.parse(bodyText);
    msg = data?.error?.message || data?.message || msg;
  } catch { /* keep generic */ }
  if (bodyText.length > 400) msg += ' — ' + bodyText.slice(0, 400);
  return new AIError(msg, res.status, bodyText);
}

export function stripFences(text) {
  let t = (text || '').trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) t = fence[1].trim();
  return t;
}

export function parseJson(text) {
  const t = stripFences(text);
  try { return JSON.parse(t); } catch { /* continue */ }
  // try to extract first balanced {...} or [...] block
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

export function buildMessages(messages, json = false) {
  const body = { model: null, messages };
  if (json) body.response_format = { type: 'json_object' };
  return body;
}

export async function chat(msgs, { json = false, temperature = 0.4, maxTokens = 8000, retries = 1, model } = {}) {
  const { provider, model: m, key } = currentConfig();
  const usedModel = model || m;
  const url = `${endpointFor(provider)}/chat/completions`;
  let attempt = 0;
  while (attempt <= retries) {
    const body = buildMessages(msgs, json);
    body.model = usedModel;
    body.temperature = temperature;
    body.max_tokens = maxTokens;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: headersFor(provider, key),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await parseError(res, provider);
        if (err.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)));
          attempt++;
          continue;
        }
        throw err;
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new AIError('استجابة فارغة من الموديل.');
      return content;
    } catch (e) {
      if (e instanceof AIError && e.status === 429 && attempt < retries) {
        attempt++;
        continue;
      }
      throw e;
    }
  }
  throw new AIError('فشل الاتصال بالمزوّد.');
}

export async function chatJson(msgs, opts = {}) {
  const out = await chat(msgs, { ...opts, json: true });
  return parseJson(out);
}

export async function* streamChat(msgs, { temperature = 0.4, maxTokens = 8000, model } = {}) {
  const { provider, model: m, key } = currentConfig();
  const usedModel = model || m;
  const url = `${endpointFor(provider)}/chat/completions`;
  const body = buildMessages(msgs, false);
  body.model = usedModel;
  body.temperature = temperature;
  body.max_tokens = maxTokens;
  body.stream = true;

  const res = await fetch(url, { method: 'POST', headers: headersFor(provider, key), body: JSON.stringify(body) });
  if (!res.ok) throw await parseError(res, provider);
  if (!res.body) throw new AIError('لا يوجد دفق للاستجابة.');

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