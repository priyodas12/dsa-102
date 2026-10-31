import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, maxSum, longestUnique, minLen, programs } from './steps.js';

const state = createState();
const last = (r) => r.steps.at(-1).caption;

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    for (const r of s.rows) {
      for (const idx of [...Object.keys(r.marks), ...Object.values(r.pointers)]) {
        assert.ok(Number(idx) >= 0 && Number(idx) < r.cells.length, `index ${idx} outside row ${r.label}`);
      }
    }
    // The window is a contiguous run of 'window' cells that matches the pointers.
    const r = s.rows[0];
    const inWindow = Object.entries(r.marks).filter(([, k]) => k === 'window').map(([i]) => Number(i));
    if (r.pointers.left !== undefined) {
      for (let i = r.pointers.left; i <= r.pointers.right; i++) {
        assert.ok(inWindow.includes(i) || r.marks[i] !== undefined, `cell ${i} inside the window is unmarked`);
      }
    }
  }
}

function rng(seed) {
  let x = seed;
  return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
}

test('maxSum slides a fixed window', () => {
  const r = maxSum(state, '2, 1, 5, 1, 3, 2', 3);
  assert.match(last(r), /maximum sum is 9, from 5 \+ 1 \+ 3/);
  checkSteps(r.steps, programs.maxSum);
  for (const s of r.steps) {
    const { left, right } = s.rows[0].pointers;
    if (left !== undefined && s.line === 5) assert.equal(right - left + 1, 3, 'window size stays k');
  }
});

test('maxSum edge cases and validation', () => {
  assert.match(last(maxSum(state, '4', 1)), /maximum sum is 4/);
  assert.match(last(maxSum(state, '1, 2, 3', 3)), /maximum sum is 6/);   // k equals the length: no sliding
  assert.match(last(maxSum(state, '-5, -2, -9', 2)), /maximum sum is -7/); // all negative
  checkSteps(maxSum(state, '1, 2, 3', 3).steps, programs.maxSum);
  assert.throws(() => maxSum(state, '1, 2', 3), RangeError);
  assert.throws(() => maxSum(state, '1, 2', 0), RangeError);
  assert.throws(() => maxSum(state, '1, x', 1), RangeError);
  assert.throws(() => maxSum(state, '', 1), RangeError);
});

test('maxSum agrees with brute force', () => {
  const next = rng(31);
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: 1 + Math.floor(next() * 12) }, () => Math.floor(next() * 40) - 10);
    const k = 1 + Math.floor(next() * a.length);
    let best = -Infinity;
    for (let i = 0; i + k <= a.length; i++) best = Math.max(best, a.slice(i, i + k).reduce((x, y) => x + y, 0));
    const r = maxSum(state, a.join(' '), k);
    checkSteps(r.steps, programs.maxSum);
    assert.match(last(r), new RegExp(`maximum sum is ${best},`), `${a} k=${k}`);
  }
});

test('longestUnique: classic examples', () => {
  const r = longestUnique(state, 'abcabcbb');
  assert.match(last(r), /length 3: "abc"/);
  checkSteps(r.steps, programs.longestUnique);
  assert.match(last(longestUnique(state, 'bbbbb')), /length 1: "b"/);
  assert.match(last(longestUnique(state, 'pwwkew')), /length 3: "wke"/);
  assert.match(last(longestUnique(state, 'a')), /length 1/);
  assert.match(last(longestUnique(state, 'abcdef')), /length 6/);
});

test('longestUnique shrinks more than once when needed and shows spaces', () => {
  const r = longestUnique(state, 'abcdea'); // 'a' repeats: drop only 'a'
  assert.match(last(r), /length 5: "abcde"/); // the first window of that length wins; a later tie is not "longer"
  const multi = longestUnique(state, 'dvdf');   // needs the window to jump past the first d
  assert.match(last(multi), /length 3: "vdf"/);
  assert.ok(longestUnique(state, 'a b').steps[0].rows[0].cells.includes('␣'));
  assert.throws(() => longestUnique(state, ''), RangeError);
  assert.throws(() => longestUnique(state, 'x'.repeat(17)), RangeError);
});

test('longestUnique agrees with brute force and never holds a repeat', () => {
  const alphabet = 'abcd1 ';
  const next = rng(13);
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + Math.floor(next() * 14) }, () => alphabet[Math.floor(next() * alphabet.length)]).join('');
    let best = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1);
      if (new Set(sub).size === sub.length) best = Math.max(best, sub.length);
    }
    const r = longestUnique(state, s);
    checkSteps(r.steps, programs.longestUnique);
    assert.match(last(r), new RegExp(`has length ${best}:`), JSON.stringify(s));
    for (const st of r.steps.filter((x) => x.line === 8)) {
      const set = st.rows[1].cells;
      assert.equal(new Set(set).size, set.length, 'set holds a repeat');
      assert.equal(set.length, st.rows[0].pointers.right - st.rows[0].pointers.left + 1, 'set matches the window');
    }
  }
});

test('minLen: classic examples', () => {
  const r = minLen(state, '2, 3, 1, 2, 4, 3', 7);
  assert.match(last(r), /shortest window has length 2: 4 \+ 3 = 7/);
  checkSteps(r.steps, programs.minLen);
  assert.match(last(minLen(state, '1, 4, 4', 4)), /length 1: 4 = 4/);
  assert.match(last(minLen(state, '1, 1, 1, 1', 10)), /Return 0/);
  assert.match(last(minLen(state, '5', 5)), /length 1/);
  assert.match(last(minLen(state, '1, 2, 3', 6)), /length 3/);
});

test('minLen rejects non-positive numbers and a bad target', () => {
  assert.throws(() => minLen(state, '1, -2, 3', 3), RangeError);
  assert.throws(() => minLen(state, '1, 0, 3', 3), RangeError);
  assert.throws(() => minLen(state, '1, 2', 0), RangeError);
  assert.throws(() => minLen(state, '1, 2', 1.5), RangeError);
});

test('minLen agrees with brute force', () => {
  const next = rng(77);
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + Math.floor(next() * 12) }, () => 1 + Math.floor(next() * 9));
    const target = 1 + Math.floor(next() * 40);
    let best = Infinity;
    for (let i = 0; i < a.length; i++) {
      let sum = 0;
      for (let j = i; j < a.length; j++) {
        sum += a[j];
        if (sum >= target) { best = Math.min(best, j - i + 1); break; }
      }
    }
    const r = minLen(state, a.join(' '), target);
    checkSteps(r.steps, programs.minLen);
    if (best === Infinity) assert.match(last(r), /Return 0/);
    else assert.match(last(r), new RegExp(`shortest window has length ${best}:`), `${a} target ${target}`);
  }
});

test('pointers only move forward and each element enters and leaves at most once', () => {
  const r = minLen(state, '2, 3, 1, 2, 4, 3', 7);
  let prevLeft = 0;
  let prevRight = -1;
  for (const s of r.steps.slice(0, -1)) { // the last step jumps back to show the best window
    const p = s.rows[0].pointers;
    if (p.left === undefined) continue;
    assert.ok(p.left >= prevLeft, 'left moved backwards');
    assert.ok(p.right >= prevRight, 'right moved backwards');
    prevLeft = p.left;
    prevRight = p.right;
  }
});

test('operations do not change the shown array', () => {
  const s = createState([1, 2, 3]);
  assert.equal(maxSum(s, '1, 2, 3', 2).final, s);
  assert.deepEqual(s.values, [1, 2, 3]);
});
