import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import 'dotenv/config';

const DATA = path.join(process.cwd(), 'data');
const DIRS = ['books', 'pages', 'exams', 'results'];

for (const d of DIRS) {
  const p = path.join(DATA, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const file = (dir, id) => path.join(DATA, dir, `${id}.json`);

export function readJSON(p, fallback = null) {
  try {
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
  return obj;
}

export const uid = () => crypto.randomUUID();

// ---------- Settings ----------
export function getSettings() {
  const s = readJSON(file('books', '_settings'), {}) || {};
  return {
    provider: s.provider || process.env.DEFAULT_PROVIDER || 'openrouter',
    model: s.model || process.env.DEFAULT_MODEL || 'minimax/minimax-m3:free',
    openrouterKey: s.openrouterKey || process.env.OPENROUTER_API_KEY || '',
    moonshotKey: s.moonshotKey || process.env.MOONSHOT_API_KEY || '',
    lang: s.lang || 'ar',
  };
}

export function saveSettings(patch) {
  const s = readJSON(file('books', '_settings'), {}) || {};
  Object.assign(s, patch);
  writeJSON(file('books', '_settings'), s);
  return getSettings();
}

// ---------- Books ----------
export function saveBook(book) {
  writeJSON(file('books', book.id), book);
  return book;
}
export function getBook(id) {
  return readJSON(file('books', id), null);
}
export function listBooks() {
  const dir = path.join(DATA, 'books');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => readJSON(path.join(dir, f)))
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export function deleteBook(id) {
  for (const dir of ['books', 'pages']) {
    const p = file(dir, id);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

export function savePages(id, pages) {
  writeJSON(path.join(DATA, 'pages', `${id}.json`), pages);
}
export function getPages(id) {
  return readJSON(path.join(DATA, 'pages', `${id}.json`), []);
}

// ---------- Exams ----------
export function saveExam(exam) {
  writeJSON(file('exams', exam.id), exam);
  return exam;
}
export function getExam(id) {
  return readJSON(file('exams', id), null);
}
export function listExams(bookId) {
  if (!fs.existsSync(path.join(DATA, 'exams'))) return [];
  return fs
    .readdirSync(path.join(DATA, 'exams'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJSON(path.join(DATA, 'exams', f)))
    .filter(Boolean)
    .filter((e) => !bookId || e.bookId === bookId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}
export function deleteExam(id) {
  const p = file('exams', id);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

// ---------- Results ----------
export function saveResult(result) {
  writeJSON(file('results', result.id), result);
  return result;
}
export function getResult(id) {
  return readJSON(file('results', id), null);
}
export function getResultByExam(examId) {
  return listResults().find((r) => r.examId === examId) || null;
}
export function listResults() {
  if (!fs.existsSync(path.join(DATA, 'results'))) return [];
  return fs
    .readdirSync(path.join(DATA, 'results'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJSON(path.join(DATA, 'results', f)))
    .filter(Boolean)
    .sort((a, b) => (b.takenAt || 0) - (a.takenAt || 0));
}
export function deleteResult(id) {
  const p = file('results', id);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

export function resetAll() {
  for (const dir of DIRS) {
    const p = path.join(DATA, dir);
    for (const f of fs.readdirSync(p)) {
      if (!f.startsWith('_')) fs.unlinkSync(path.join(p, f));
    }
  }
}