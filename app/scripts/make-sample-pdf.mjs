// يولّد كتاب PDF تجريبي صغير (إنجليزي) لاختبار النظام
import fs from 'node:fs';
import path from 'node:path';

const pages = [
  ['Chapter 1  The Nature of Science', 'Science is a systematic enterprise that builds knowledge in the form of testable explanations about the universe. It relies on observation and evidence.'],
  ['Chapter 2  Motion in One Dimension', 'Position, velocity and acceleration describe motion. The equations: v = u + a t, s = u t + 0.5 a t^2'],
  ['Chapter 3  Newton Laws of Motion', 'Newton first law: inertia. Newton second law: F = m a. Newton third law: every action has an equal and opposite reaction.'],
  ['Chapter 4  Work Energy and Power', 'Work done W = F d cos theta. Kinetic energy K = 0.5 m v^2. Power P = W / t.'],
  ['Chapter 5  Optics', 'Light reflects and refracts. Snell law and the thin lens equation 1/f = 1/u + 1/v define image formation.'],
];

// object numbering: 1 catalog, 2 pages, 3 font, [4,5],[6,7],... pairs (content, page)
const fontObj = 3;
const pageObjFor = (i) => 4 + 2 * i;        // page object
const contentObjFor = (i) => 4 + 2 * i + 1;  // content stream object

function escapeTxt(s) { return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
function wrap(s, max = 88) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

const objects = new Map();
objects.set(1, '<< /Type /Catalog /Pages 2 0 R >>');
const kids = pages.map((_, i) => `${pageObjFor(i)} 0 R`).join(' ');
objects.set(2, `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
objects.set(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

pages.forEach((pg, i) => {
  const lines = [pg[0]];
  wrap(pg[1]).forEach((ln) => lines.push(ln));
  const ops = lines.map((ln, j) => `BT /F1 ${j === 0 ? 22 : 13} Tf 72 ${792 - 90 - j * 26} Td (${escapeTxt(ln)}) Tj ET`).join('\n');
  objects.set(contentObjFor(i), `<< /Length ${Buffer.byteLength(ops) + 11} >>\nstream\n${ops}\nendstream`);
  objects.set(pageObjFor(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentObjFor(i)} 0 R /Resources << /Font << /F1 ${fontObj} 0 R >> >> >>`);
});

const count = [...objects.keys()].sort((a, b) => a - b);
let pdf = '%PDF-1.4\n';
const offsets = new Map();
for (const idx of count) {
  offsets.set(idx, Buffer.byteLength(pdf, 'utf8'));
  pdf += `${idx} 0 obj\n${objects.get(idx)}\nendobj\n`;
}
const xrefPos = Buffer.byteLength(pdf, 'utf8');
const size = count[count.length - 1] + 1;
pdf += `xref\n0 ${size}\n0000000000 65535 f \n`;
for (let i = 1; i < size; i++) {
  pdf += `${String(offsets.get(i) ?? 0).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

const out = path.join(process.cwd(), 'scripts', 'sample-physics.pdf');
fs.writeFileSync(out, pdf, 'utf8');
console.log('تم توليد:', out, fs.statSync(out).size, 'bytes');