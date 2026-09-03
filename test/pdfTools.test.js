import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { mergePdfFiles, parsePageSelection, splitPdfFile, validatePdfFile } from '../src/processors/pdfTools.js';

async function pdfFile(pageCount, name) {
  const document = await PDFDocument.create();
  for (let page = 0; page < pageCount; page++) document.addPage([300, 400]);
  return new File([await document.save()], name, { type: 'application/pdf' });
}

test('validates PDF files and rejects unsupported files', () => {
  assert.equal(validatePdfFile({ type: 'application/pdf', size: 12 }).valid, true);
  assert.equal(validatePdfFile({ type: 'image/png', size: 12 }).valid, false);
});
test('parses page ranges and removes duplicate selections', () => assert.deepEqual(parsePageSelection('1-3, 3, 5', 5), { valid: true, pages: [0, 1, 2, 4] }));
test('merges PDFs and splits selected pages', async () => {
  const first = await pdfFile(1, 'first.pdf');
  const second = await pdfFile(2, 'second.pdf');
  const merged = await PDFDocument.load(await (await mergePdfFiles([first, second], { PDFDocument })).arrayBuffer());
  assert.equal(merged.getPageCount(), 3);
  const outputs = await splitPdfFile(second, '1-2', { PDFDocument });
  assert.equal(outputs.length, 2);
  assert.equal((await PDFDocument.load(await outputs[0].blob.arrayBuffer())).getPageCount(), 1);
});