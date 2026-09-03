export const MAX_PDF_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PDF_FILES = 50;

export function validatePdfFile(file) {
  if (!file || file.type !== 'application/pdf') return { valid: false, message: 'PDF format required. Choose a PDF file.' };
  if (file.size > MAX_PDF_FILE_BYTES) return { valid: false, message: 'This PDF is over the 100 MB browser limit.' };
  return { valid: true };
}

export function parsePageSelection(value, pageCount) {
  const pages = new Set();
  for (const part of String(value || '').split(',')) {
    const item = part.trim();
    if (!item) continue;
    const range = item.split('-').map(Number);
    if (range.length === 1 && Number.isInteger(range[0]) && range[0] >= 1 && range[0] <= pageCount) pages.add(range[0] - 1);
    else if (range.length === 2 && Number.isInteger(range[0]) && Number.isInteger(range[1]) && range[0] >= 1 && range[1] <= pageCount && range[0] <= range[1]) {
      for (let page = range[0]; page <= range[1]; page++) pages.add(page - 1);
    } else return { valid: false, message: `Enter pages from 1 to ${pageCount}, for example 1-3 or 1,4.` };
  }
  return pages.size ? { valid: true, pages: [...pages].sort((a, b) => a - b) } : { valid: false, message: 'Choose at least one page.' };
}

export async function mergePdfFiles(files, pdfLib) {
  if (!files.length) throw Error('Choose at least one PDF file.');
  const merged = await pdfLib.PDFDocument.create();
  for (const file of files) {
    const source = await pdfLib.PDFDocument.load(await file.arrayBuffer());
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }
  return new Blob([await merged.save()], { type: 'application/pdf' });
}

export async function splitPdfFile(file, selection, pdfLib) {
  const source = await pdfLib.PDFDocument.load(await file.arrayBuffer());
  const chosen = parsePageSelection(selection, source.getPageCount());
  if (!chosen.valid) throw Error(chosen.message);
  const outputs = [];
  for (const pageIndex of chosen.pages) {
    const document = await pdfLib.PDFDocument.create();
    const [page] = await document.copyPages(source, [pageIndex]);
    document.addPage(page);
    outputs.push({ page: pageIndex + 1, blob: new Blob([await document.save()], { type: 'application/pdf' }) });
  }
  return outputs;
}