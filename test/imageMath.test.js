import test from 'node:test';
import assert from 'node:assert/strict';
import { physicalToPixels, calculateResizeDimensions, validateImageFile, nextQualityRange, targetStatus } from '../src/processors/imageMath.js';
import { presetPixels, presets } from '../presets/index.js';

test('converts centimetres to pixels at DPI', () => assert.equal(physicalToPixels(3.5, 'cm', 300), 413));
test('converts inches to pixels at DPI', () => assert.equal(physicalToPixels(2, 'in', 300), 600));
test('calculates a proportional resize when only width is provided', () => assert.deepEqual(calculateResizeDimensions({ sourceWidth: 1200, sourceHeight: 800, width: 600 }), { width: 600, height: 400 }));
test('swaps output dimensions after quarter-turn rotation', () => assert.deepEqual(calculateResizeDimensions({ sourceWidth: 1200, sourceHeight: 800, width: 600, rotate: 90 }), { width: 400, height: 600 }));
test('calculates configured preset pixels', () => assert.deepEqual(presetPixels(presets.find(p => p.slug === 'passport')), { width: 413, height: 531 }));
test('binary quality step tightens upper bound when above target', () => assert.deepEqual(nextQualityRange({ low: .05, high: .9, candidateQuality: .5, candidateBytes: 60000, targetBytes: 50000 }), { low: .05, high: .5, bestQuality: null }));
test('binary quality step saves a within-target candidate', () => assert.deepEqual(nextQualityRange({ low: .05, high: .9, candidateQuality: .5, candidateBytes: 40000, targetBytes: 50000 }), { low: .5, high: .9, bestQuality: .5 }));
test('reports file validation errors and accepted image file', () => { assert.equal(validateImageFile({ type: 'application/pdf', size: 1 }).valid, false); assert.equal(validateImageFile({ type: 'image/jpeg', size: 21 * 1024 * 1024 }).valid, false); assert.equal(validateImageFile({ type: 'image/webp', size: 12 }).valid, true); });
test('reports target result honestly', () => { assert.equal(targetStatus(49000, 50000), 'Within target'); assert.match(targetStatus(51000, 50000), /Above target/); });
