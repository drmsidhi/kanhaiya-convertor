/** Pure image calculations kept independent from canvas/browser APIs. */
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function physicalToPixels(value, unit = 'px', dpi = 300) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  if (unit === 'cm') return Math.round((number / 2.54) * dpi);
  if (unit === 'in') return Math.round(number * dpi);
  return Math.round(number);
}

export function calculateResizeDimensions({ sourceWidth, sourceHeight, width, height, unit = 'px', dpi = 300, rotate = 0 }) {
  const requestedWidth = physicalToPixels(width, unit, dpi);
  const requestedHeight = physicalToPixels(height, unit, dpi);
  let outputWidth = requestedWidth || Math.round(sourceWidth);
  let outputHeight = requestedHeight || Math.round(sourceHeight);
  if (requestedWidth && !requestedHeight) outputHeight = Math.round(sourceHeight * (outputWidth / sourceWidth));
  if (requestedHeight && !requestedWidth) outputWidth = Math.round(sourceWidth * (outputHeight / sourceHeight));
  if (Number(rotate) % 180 !== 0) [outputWidth, outputHeight] = [outputHeight, outputWidth];
  return { width: outputWidth, height: outputHeight };
}

export function validateImageFile(file) {
  if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) return { valid: false, message: 'Image format is not supported. Choose JPG, PNG or WEBP.' };
  if (file.size > MAX_FILE_BYTES) return { valid: false, message: 'The image is too large for this device to process safely. Please select an image under 20 MB.' };
  return { valid: true };
}

/** Returns the next bounded binary-search quality; encoding remains browser-specific. */
export function nextQualityRange({ low, high, candidateQuality, candidateBytes, targetBytes }) {
  if (candidateBytes <= targetBytes) return { low: candidateQuality, high, bestQuality: candidateQuality };
  return { low, high: candidateQuality, bestQuality: null };
}

export function targetStatus(resultBytes, targetBytes) {
  return !targetBytes ? 'No target selected' : resultBytes <= targetBytes ? 'Within target' : 'Above target — reduce dimensions or try a larger target';
}
