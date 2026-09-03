export const MAX_PREVIEW_PAGES = 30;
export const PREVIEW_WIDTH = 180;

export async function renderPdfPreview(file, container, pdfjsLib) {
  container.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'notice';
  loading.textContent = 'Generating PDF preview...';
  container.append(loading);
  try {
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableWorker: true }).promise;
    container.replaceChildren();
    const renderedPages = Math.min(pdf.numPages, container.closest('.pdf-preview-file') ? 1 : MAX_PREVIEW_PAGES);
    for (let pageNumber = 1; pageNumber <= renderedPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: PREVIEW_WIDTH / baseViewport.width });
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-thumbnail';
      canvas.width = Math.ceil(viewport.width * devicePixelRatio);
      canvas.height = Math.ceil(viewport.height * devicePixelRatio);
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: [devicePixelRatio, 0, 0, devicePixelRatio, 0, 0] }).promise;
      const item = document.createElement('figure');
      item.className = 'pdf-preview-page';
      item.dataset.page = pageNumber;
      item.append(canvas);
      const caption = document.createElement('figcaption');
      caption.textContent = `Page ${pageNumber}`;
      item.append(caption);
      container.append(item);
    }
    if (pdf.numPages > renderedPages) {
      const note = document.createElement('p');
      note.className = 'muted pdf-preview-note';
      note.textContent = `Showing the first ${renderedPages} of ${pdf.numPages} pages.`;
      container.append(note);
    }
    return { pageCount: pdf.numPages };
  } catch (error) {
    container.replaceChildren();
    const failure = document.createElement('p');
    failure.className = 'notice error';
    failure.textContent = 'Preview unavailable. The PDF may be corrupted or password protected.';
    container.append(failure);
    throw error;
  }
}

export function markSelectedPdfPages(container, selection) {
  const selected = new Set(selection || []);
  container.querySelectorAll('[data-page]').forEach(item => item.classList.toggle('selected', selected.has(Number(item.dataset.page))));
}
