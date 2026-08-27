import test from 'node:test';
import assert from 'node:assert/strict';
import { physicalToPixels, calculateResizeDimensions, fitWithinProcessingLimits, validateImageFile, nextQualityRange, targetStatus } from '../src/processors/imageMath.js';
import { presetFormValues, presetPixels, presets } from '../presets/index.js';

test('converts centimetres to pixels at DPI', () => assert.equal(physicalToPixels(3.5, 'cm', 300), 413));
test('converts inches to pixels at DPI', () => assert.equal(physicalToPixels(2, 'in', 300), 600));
test('preserves pixel values without physical unit conversion', () => assert.equal(physicalToPixels(413, 'px', 300), 413));
test('calculates a proportional resize when only width is provided', () => assert.deepEqual(calculateResizeDimensions({ sourceWidth: 1200, sourceHeight: 800, width: 600 }), { width: 600, height: 400 }));
test('swaps output dimensions after quarter-turn rotation', () => assert.deepEqual(calculateResizeDimensions({ sourceWidth: 1200, sourceHeight: 800, width: 600, rotate: 90 }), { width: 400, height: 600 }));
test('fits large output dimensions within pixel and canvas limits', () => {
  const result = fitWithinProcessingLimits(12000, 8000);
  assert.equal(result.width * result.height <= 32_000_000, true);
  assert.equal(Math.max(result.width, result.height) <= 8192, true);
  assert.equal(result.scale < 1, true);
});
test('calculates every configured physical preset in pixels', () => {
  const expected = {
    passport: { width: 413, height: 531 },
    'pan-photo': { width: 413, height: 295 },
    'pan-signature': { width: 276, height: 118 },
    visa: { width: 600, height: 600 },
    application: { width: 300, height: 300 },
  };
  for (const preset of presets) assert.deepEqual(presetPixels(preset), expected[preset.slug], preset.slug);
});
test('preset form values retain physical dimensions and declared units', () => {
  assert.deepEqual(presetFormValues(presets.find(p => p.slug === 'passport')), { width: 3.5, height: 4.5, unit: 'cm', dpi: 300 });
  assert.deepEqual(presetFormValues(presets.find(p => p.slug === 'pan-photo')), { width: 3.5, height: 2.5, unit: 'cm', dpi: 300 });
  assert.deepEqual(presetFormValues(presets.find(p => p.slug === 'pan-signature')), { width: 3.5, height: 1.5, unit: 'cm', dpi: 200 });
  assert.deepEqual(presetFormValues(presets.find(p => p.slug === 'visa')), { width: 2, height: 2, unit: 'in', dpi: 300 });
});
test('preset form values convert once to their expected final dimensions', () => {
  for (const preset of presets) {
    const form = presetFormValues(preset);
    assert.deepEqual(calculateResizeDimensions({ sourceWidth: 1000, sourceHeight: 1000, ...form }), presetPixels(preset), preset.slug);
  }
});
test('binary quality step tightens upper bound when above target', () => assert.deepEqual(nextQualityRange({ low: .05, high: .9, candidateQuality: .5, candidateBytes: 60000, targetBytes: 50000 }), { low: .05, high: .5, bestQuality: null }));
test('binary quality step saves a within-target candidate', () => assert.deepEqual(nextQualityRange({ low: .05, high: .9, candidateQuality: .5, candidateBytes: 40000, targetBytes: 50000 }), { low: .5, high: .9, bestQuality: .5 }));
test('reports file validation errors and accepted image file', () => { assert.equal(validateImageFile({ type: 'application/pdf', size: 1 }).valid, false); assert.equal(validateImageFile({ type: 'image/jpeg', size: 101 * 1024 * 1024 }).valid, false); assert.equal(validateImageFile({ type: 'image/jpeg', size: 21 * 1024 * 1024 }).valid, true); assert.equal(validateImageFile({ type: 'image/webp', size: 12 }).valid, true); });
test('reports target result honestly', () => { assert.equal(targetStatus(49000, 50000), 'Within target'); assert.match(targetStatus(51000, 50000), /above target/); });
