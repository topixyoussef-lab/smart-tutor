import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'node:fs';

const buf = fs.readFileSync(process.cwd() + '/scripts/sample-physics.pdf');
const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
console.log('pages:', pdf.numPages);
for (let n = 1; n <= pdf.numPages; n++) {
  const page = await pdf.getPage(n);
  const content = await page.getTextContent();
  console.log(`--- page ${n}: items=${content.items.length}`);
  for (const it of content.items.slice(0, 6)) {
    console.log('   ', JSON.stringify(it.str), 'hasEOL=', !!it.hasEOL);
  }
  page.cleanup();
}
pdf.destroy();