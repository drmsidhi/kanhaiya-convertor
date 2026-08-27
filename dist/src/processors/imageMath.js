/** Pure image calculations kept independent from canvas/browser APIs. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_PROCESSING_PIXELS = 32_000_000;
export const MAX_CANVAS_DIMENSION = 8192;
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

export function fitWithinProcessingLimits(width, height, { maxPixels = MAX_PROCESSING_PIXELS, maxDimension = MAX_CANVAS_DIMENSION } = {}) {
  const sourceWidth = Math.max(1, Math.round(Number(width) || 1));
  const sourceHeight = Math.max(1, Math.round(Number(height) || 1));
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight), Math.sqrt(maxPixels / (sourceWidth * sourceHeight)));
  return { width: Math.max(1, Math.floor(sourceWidth * scale)), height: Math.max(1, Math.floor(sourceHeight * scale)), scale };
}

export function validateImageFile(file) {
  if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) return { valid: false, message: 'Image format is not supported. Choose JPG, PNG or WEBP.' };
  if (file.size > MAX_FILE_BYTES) return { valid: false, message: 'This file is over the 100 MB browser limit. Please choose a smaller image.' };
  return { valid: true };
}

/** Returns the next bounded binary-search quality; encoding remains browser-specific. */
export function nextQualityRange({ low, high, candidateQuality, candidateBytes, targetBytes }) {
  if (candidateBytes <= targetBytes) return { low: candidateQuality, high, bestQuality: candidateQuality };
  return { low, high: candidateQuality, bestQuality: null };
}

export function targetStatus(resultBytes, targetBytes) {
  return !targetBytes ? 'No target selected' : resultBytes <= targetBytes ? 'Within target' : 'Closest possible result is still above target';
}
