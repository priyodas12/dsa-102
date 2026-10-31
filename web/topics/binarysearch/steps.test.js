import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, search, lowerBound, rotated, sqrt, programs } from './steps.js';

const state = createState();
const last = (r) => r.steps.at(-1).caption;

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  steps.forEach((s, k) => {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    assert.ok(Number.isInteger(s.probes) && s.probes >= (steps[k - 1]?.probes ?? 0), 'probes never decrease');
    for (const r of s.rows) {
      for (const idx of [...Object.keys(r.marks), ...Object.values(r.pointers), ...(r.dim ?? [])]) {
        assert.ok(Number(idx) >= 0 && Number(idx) < r.cells.length, `index ${idx} outside row ${r.label}`);
      }
    }
  });
}

function rng(seed) {
  let x = seed;
  return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
}

const sortedRandom = (next, maxLen = 16, spread = 60) =>
  Array.from({ length: 1 + Math.floor(next() * maxLen) }, () => Math.floor(next() * spread) - 10).sort((x, y) => x - y);

test('search finds a target and halves the window each probe', () => {
  const r = search(state, '2, 5, 8, 12, 16, 23, 38, 56, 72, 91', 23);
  assert.match(last(r), /found 23 at index 5 after 3 probes/);
  checkSteps(r.steps, programs.search);
  const sizes = r.steps.filter((s) => s.line === 3).map((s) => s.rows[0].pointers.hi - s.rows[0].pointers.lo + 1);
  assert.ok(sizes.every((w, i) => i === 0 || w <= Math.ceil(sizes[i - 1] / 2)), 'window at least halves');
});

test('search edge cases', () => {
  assert.match(last(search(state, '7', 7)), /found 7 at index 0 after 1 probe\./);
  assert.match(last(search(state, '7', 3)), /not in the array/);
  assert.match(last(search(state, '1, 2, 3', 1)), /index 0/);                     // first element
  assert.match(last(search(state, '1, 2, 3', 3)), /index 2/);                     // last element
  assert.match(last(search(state, '1, 2, 3', 0)), /not in the array/);            // smaller than all
  assert.match(last(search(state, '1, 2, 3', 99)), /not in the array/);           // larger than all
  checkSteps(search(state, '1, 2, 3', 99).steps, programs.search);
});

test('search validation', () => {
  assert.throws(() => search(state, '3, 1, 2', 1), RangeError);
  assert.throws(() => search(state, '', 1), RangeError);
  assert.throws(() => search(state, '1, x', 1), RangeError);
  assert.throws(() => search(state, Array.from({ length: 17 }, (_, i) => i).join(','), 1), RangeError);
  assert.throws(() => search(state, '1, 2', 1.5), RangeError);
});

test('search agrees with a linear scan, keeps the target inside the window, and uses at most log2(n)+1 probes', () => {
  const next = rng(41);
  for (let t = 0; t < 300; t++) {
    const a = sortedRandom(next);
    const target = Math.floor(next() * 60) - 10;
    const r = search(state, a.join(' '), target);
    checkSteps(r.steps, programs.search);
    const m = last(r).match(/found (-?\d+) at index (\d+) after (\d+) probes?/);
    if (a.includes(target)) {
      assert.ok(m, `${a} should contain ${target}`);
      assert.equal(a[Number(m[2])], target);
      assert.ok(Number(m[3]) <= Math.floor(Math.log2(a.length)) + 1, 'too many probes');
      for (const s of r.steps) {
        const { lo, hi } = s.rows[0].pointers;
        if (lo !== undefined) assert.ok(a.slice(lo, hi + 1).includes(target), 'target fell out of the window');
      }
    } else {
      assert.match(last(r), /not in the array/);
    }
  }
});

test('lowerBound finds the first of several duplicates', () => {
  const r = lowerBound(state, '1, 2, 2, 2, 3, 5, 5, 8', 2);
  assert.match(last(r), /is 1\. a\[1\] = 2, the first occurrence/);
  checkSteps(r.steps, programs.lowerBound);
});

test('lowerBound edge cases: missing, below all, above all, single, empty window start', () => {
  assert.match(last(lowerBound(state, '1, 3, 5', 4)), /is 2\..*not present/);
  assert.match(last(lowerBound(state, '1, 3, 5', -50)), /is 0\./);
  assert.match(last(lowerBound(state, '1, 3, 5', 99)), /is 3\. Every value is smaller/);
  assert.match(last(lowerBound(state, '4', 4)), /is 0\..*first occurrence/);
  assert.match(last(lowerBound(state, '4', 5)), /is 1\./);
  checkSteps(lowerBound(state, '1, 3, 5', 99).steps, programs.lowerBound);
  assert.equal(lowerBound(state, '1, 3, 5', 99).steps[0].rows[0].cells.length, 4); // extra "past the end" slot
});

test('lowerBound agrees with a reference on random arrays with duplicates', () => {
  const next = rng(8);
  for (let t = 0; t < 300; t++) {
    const a = sortedRandom(next, 16, 10);
    const target = Math.floor(next() * 14) - 2;
    const expected = a.findIndex((v) => v >= target);
    const r = lowerBound(state, a.join(' '), target);
    checkSteps(r.steps, programs.lowerBound);
    assert.match(last(r), new RegExp(`is ${expected === -1 ? a.length : expected}\\.`), `${a} target ${target}`);
  }
});

test('rotated array search: the classic example and sorted-half reasoning', () => {
  const r = rotated(state, '4, 5, 6, 7, 0, 1, 2', 0);
  assert.match(last(r), /found 0 at index 4/);
  assert.ok(r.steps.some((s) => /half \(blue\)/.test(s.caption)));
  checkSteps(r.steps, programs.rotated);
  assert.match(last(rotated(state, '4, 5, 6, 7, 0, 1, 2', 3)), /not in the array/);
  assert.match(last(rotated(state, '1', 1)), /found 1 at index 0/);
  assert.match(last(rotated(state, '3, 1', 1)), /found 1 at index 1/);
  assert.match(last(rotated(state, '1, 2, 3', 3)), /found 3 at index 2/); // rotation by zero
});

test('rotated array validation', () => {
  assert.throws(() => rotated(state, '1, 2, 1, 2', 1), RangeError); // two descents and duplicates
  assert.throws(() => rotated(state, '3, 1, 2, 4', 1), RangeError); // not a rotation
  assert.throws(() => rotated(state, '2, 2, 3', 2), RangeError);    // duplicates
  assert.throws(() => rotated(state, '', 1), RangeError);
});

test('rotated search agrees with indexOf for every rotation of random distinct arrays', () => {
  const next = rng(99);
  for (let t = 0; t < 200; t++) {
    const base = [...new Set(sortedRandom(next, 12, 40))];
    const rot = Math.floor(next() * base.length);
    const a = [...base.slice(rot), ...base.slice(0, rot)];
    const target = Math.floor(next() * 50) - 10;
    const r = rotated(state, a.join(' '), target);
    checkSteps(r.steps, programs.rotated);
    const idx = a.indexOf(target);
    if (idx === -1) assert.match(last(r), /not in the array/, `${a} target ${target}`);
    else assert.match(last(r), new RegExp(`found ${target} at index ${idx} `), `${a} target ${target}`);
  }
});

test('sqrt gives the integer square root for every x in range', () => {
  for (let x = 0; x <= 30; x++) {
    const r = sqrt(state, x);
    checkSteps(r.steps, programs.sqrt);
    assert.match(last(r), new RegExp(`integer square root of ${x} is ${Math.floor(Math.sqrt(x))},`), `x=${x}`);
  }
  assert.ok(sqrt(state, 30).steps.at(-1).probes <= 5);
});

test('sqrt rejects out-of-range input', () => {
  assert.throws(() => sqrt(state, -1), RangeError);
  assert.throws(() => sqrt(state, 31), RangeError);
  assert.throws(() => sqrt(state, 2.5), RangeError);
});

test('operations do not change the shown array', () => {
  const s = createState([1, 2, 3]);
  assert.equal(search(s, '1, 2, 3', 2).final, s);
  assert.deepEqual(s.values, [1, 2, 3]);
});
