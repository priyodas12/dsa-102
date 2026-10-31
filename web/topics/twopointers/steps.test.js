import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, pairSum, palindrome, dedupe, water, programs } from './steps.js';

const state = createState();

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    for (const r of s.rows) {
      for (const idx of [...Object.keys(r.marks), ...Object.values(r.pointers), ...(r.dim ?? [])]) {
        assert.ok(Number(idx) >= 0 && Number(idx) < r.cells.length, `index ${idx} outside row ${r.label}`);
      }
    }
  }
}

function rng(seed) {
  let x = seed;
  return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
}

const last = (r) => r.steps.at(-1).caption;

test('pairSum finds the pair and shrinks the window each step', () => {
  const r = pairSum(state, '1, 3, 4, 6, 8, 11', 10);
  assert.match(last(r), /found at indices \[2, 3\]/);
  checkSteps(r.steps, programs.pairSum);
  const windows = r.steps.map((s) => s.rows[0].dim.length);
  assert.ok(windows.every((w, i) => i === 0 || w >= windows[i - 1]), 'dimmed set only grows');
});

test('pairSum edge cases', () => {
  assert.match(last(pairSum(state, '5', 10)), /Return null/);               // one element
  assert.match(last(pairSum(state, '3, 3', 6)), /\[0, 1\]/);                // duplicates
  assert.match(last(pairSum(state, '-4, -1, 2, 9', 1)), /\[1, 2\]/);        // negatives
  assert.match(last(pairSum(state, '1, 2, 3', 100)), /Return null/);        // no pair
  assert.match(last(pairSum(state, '5, 5, 5', 10)), /\[0, 2\]|\[0, 1\]/);
  checkSteps(pairSum(state, '1, 2, 3', 100).steps, programs.pairSum);
});

test('pairSum rejects unsorted and bad input', () => {
  assert.throws(() => pairSum(state, '3, 1, 2', 4), RangeError);
  assert.throws(() => pairSum(state, '', 4), RangeError);
  assert.throws(() => pairSum(state, '1, x', 4), RangeError);
  assert.throws(() => pairSum(state, '1 2 3 4 5 6 7 8 9 10 11 12 13', 4), RangeError);
  assert.throws(() => pairSum(state, '1 2', 1.5), RangeError);
});

test('pairSum agrees with brute force on random sorted arrays', () => {
  const next = rng(9);
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: 1 + Math.floor(next() * 12) }, () => Math.floor(next() * 30) - 8).sort((x, y) => x - y);
    const target = Math.floor(next() * 40) - 10;
    let exists = false;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === target) exists = true;
    const r = pairSum(state, a.join(' '), target);
    checkSteps(r.steps, programs.pairSum);
    const m = last(r).match(/\[(\d+), (\d+)\]/);
    if (exists) {
      assert.ok(m, `${a} target ${target} should have a pair`);
      assert.equal(a[Number(m[1])] + a[Number(m[2])], target);
      assert.ok(Number(m[1]) < Number(m[2]));
    } else {
      assert.match(last(r), /Return null/);
    }
  }
});

test('palindrome ignores case, spaces and punctuation', () => {
  const yes = palindrome(state, "Madam, I'm Adam");
  assert.match(last(yes), /it is a palindrome/);
  assert.ok(yes.steps.some((s) => /not a letter or digit/.test(s.caption)));
  checkSteps(yes.steps, programs.palindrome);
  assert.match(last(palindrome(state, 'racecar')), /it is a palindrome/);
  assert.match(last(palindrome(state, 'a')), /it is a palindrome/);
  assert.match(last(palindrome(state, '!!!')), /it is a palindrome/);
});

test('palindrome detects a mismatch early', () => {
  const r = palindrome(state, 'abca');
  assert.match(last(r), /not a palindrome/);
  checkSteps(r.steps, programs.palindrome);
  assert.match(last(palindrome(state, 'ab')), /not a palindrome/);
});

test('palindrome rejects empty and over-long input, and shows spaces visibly', () => {
  assert.throws(() => palindrome(state, ''), RangeError);
  assert.throws(() => palindrome(state, 'x'.repeat(17)), RangeError);
  assert.ok(palindrome(state, 'a b').steps[0].rows[0].cells.includes('␣'));
});

test('palindrome agrees with the cleaned-string reference', () => {
  const alphabet = 'aAbB1 ,.';
  const next = rng(5);
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + Math.floor(next() * 12) }, () => alphabet[Math.floor(next() * alphabet.length)]).join('');
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const expected = clean === [...clean].reverse().join('');
    const r = palindrome(state, s);
    checkSteps(r.steps, programs.palindrome);
    assert.equal(/it is a palindrome/.test(last(r)), expected, JSON.stringify(s));
  }
});

test('dedupe keeps the unique values in front', () => {
  const r = dedupe(state, '1, 1, 2, 2, 2, 3, 4, 4');
  assert.match(last(r), /new length is 4, the unique values are 1, 2, 3, 4/);
  checkSteps(r.steps, programs.dedupe);
  assert.match(last(dedupe(state, '7')), /new length is 1/);
  assert.match(last(dedupe(state, '2, 2, 2')), /new length is 1/);
  assert.match(last(dedupe(state, '1, 2, 3')), /new length is 3/);
  assert.throws(() => dedupe(state, '2, 1'), RangeError);
});

test('dedupe agrees with a Set on random sorted arrays and never overwrites unread values', () => {
  const next = rng(17);
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: 1 + Math.floor(next() * 12) }, () => Math.floor(next() * 6)).sort((x, y) => x - y);
    const r = dedupe(state, a.join(' '));
    checkSteps(r.steps, programs.dedupe);
    const unique = [...new Set(a)];
    assert.match(last(r), new RegExp(`new length is ${unique.length}, the unique values are ${unique.join(', ')}`));
    for (const s of r.steps) {
      const { slow, fast } = s.rows[0].pointers;
      if (fast !== undefined) assert.ok(slow <= fast, 'slow never overtakes fast');
    }
  }
});

test('water finds the best container', () => {
  const r = water(state, '1, 8, 6, 2, 5, 4, 8, 3, 7');
  assert.match(last(r), /maximum area is 49/);
  checkSteps(r.steps, programs.water);
  assert.match(last(water(state, '5, 5')), /maximum area is 5/);
  assert.match(last(water(state, '9')), /maximum area is 0/);
  assert.throws(() => water(state, '0, 3'), RangeError);
});

test('water agrees with brute force on random heights', () => {
  const next = rng(23);
  for (let t = 0; t < 200; t++) {
    const h = Array.from({ length: 1 + Math.floor(next() * 12) }, () => 1 + Math.floor(next() * 20));
    let best = 0;
    for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
    const r = water(state, h.join(' '));
    checkSteps(r.steps, programs.water);
    assert.match(last(r), new RegExp(`maximum area is ${best}\\.`), `${h}`);
  }
});

test('operations do not change the shown array', () => {
  const s = createState([1, 2, 3]);
  assert.equal(pairSum(s, '1, 2, 3', 5).final, s);
  assert.equal(palindrome(s, 'abc').final, s);
  assert.deepEqual(s.values, [1, 2, 3]);
});
