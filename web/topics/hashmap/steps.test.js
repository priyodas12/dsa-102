import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, put, get, remove, twoSum, hashOf, indexFor, entriesOf, programs, MAX_ENTRIES } from './steps.js';

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) < Math.max(r.cells.length, 1), `mark ${idx} outside row ${r.label}`);
    }
  }
}

// Every entry must sit in the bucket its hash selects, with no duplicate keys, and load <= 0.75.
function checkInvariants(state) {
  const seen = new Set();
  state.buckets.forEach((chain, i) => {
    for (const e of chain) {
      assert.equal(indexFor(hashOf(e.key, state.keyType), state.capacity), i, `${e.key} is in the wrong bucket`);
      assert.ok(!seen.has(e.key), `duplicate key ${e.key}`);
      seen.add(e.key);
    }
  });
  assert.equal(seen.size, state.size);
  assert.equal(state.buckets.length, state.capacity);
  assert.ok(state.size <= state.capacity * 0.75 || state.size === 0, 'load factor exceeded');
}

const dflt = () => createState([['cat', 3], ['dog', 8], ['bee', 5]], 4);
const lookup = (state, key) => entriesOf(state).find(([k]) => k === key)?.[1];

test('String hashes match Java String.hashCode', () => {
  assert.equal(hashOf('cat', 'string'), 98262);
  assert.equal(hashOf('a', 'string'), 97);
  assert.equal(hashOf('', 'string'), 0);
  assert.equal(hashOf('12', 'int'), 12);
  assert.equal(hashOf('-5', 'int'), -5);
});

test('indexFor is never negative', () => {
  assert.equal(indexFor(-5, 4), 3);
  assert.equal(indexFor(98262, 4), 2);
  assert.equal(indexFor(0, 4), 0);
});

test('the default map has a collision: cat and bee share bucket 2', () => {
  const s = dflt();
  assert.deepEqual(s.buckets[2].map((e) => e.key), ['cat', 'bee']);
  assert.equal(s.size, 3);
  checkInvariants(s);
});

test('put into an empty bucket', () => {
  const r = put(dflt(), 'hen', 6);   // bucket 1
  assert.equal(r.final.size, 4);
  assert.equal(r.final.capacity, 8); // 4 > 0.75 * 4 triggers a resize
  checkInvariants(r.final);
  checkSteps(r.steps, programs.put);
});

test('put a colliding key appends to the chain', () => {
  const s = createState([['cat', 3]], 4);
  const r = put(s, 'pig', 1);       // pig also hashes to bucket 2 at capacity 4
  assert.deepEqual(r.final.buckets[2].map((e) => e.key), ['cat', 'pig']);
  assert.ok(r.steps.some((st) => /collision/.test(st.caption)));
  assert.equal(r.final.capacity, 4);
  checkInvariants(r.final);
  checkSteps(r.steps, programs.put);
});

test('put an existing key updates in place', () => {
  const r = put(dflt(), 'bee', 99);
  assert.equal(r.final.size, 3);
  assert.equal(lookup(r.final, 'bee'), 99);
  assert.deepEqual(r.final.buckets[2].map((e) => e.key), ['cat', 'bee']);
  checkSteps(r.steps, programs.put);
});

test('resize doubles capacity, rehashes every entry and shows each move', () => {
  const r = put(dflt(), 'ant', 7);
  assert.equal(r.final.capacity, 8);
  assert.deepEqual(r.final.buckets.map((c) => c.map((e) => e.key)), [[], [], ['bee'], [], ['dog'], [], ['cat'], ['ant']]);
  assert.equal(r.steps.filter((s) => s.line === 14).length, 4);
  assert.ok(r.steps.some((s) => s.rows[0].label === 'old entries, still to move'));
  checkInvariants(r.final);
  checkSteps(r.steps, programs.put);
});

test('put rejects bad keys and values, and enforces the entry limit', () => {
  assert.throws(() => put(dflt(), '', 1), RangeError);
  assert.throws(() => put(dflt(), 'toolong', 1), RangeError);
  assert.throws(() => put(dflt(), 'a b', 1), RangeError);
  assert.throws(() => put(dflt(), 'ok', 1.5), RangeError);
  const full = createState(Array.from({ length: MAX_ENTRIES }, (_, i) => [`k${i}`, i]));
  assert.throws(() => put(full, 'new', 1), RangeError);
  assert.doesNotThrow(() => put(full, 'k3', 100)); // updating an existing key is allowed
});

test('put does not mutate its input', () => {
  const s = dflt();
  put(s, 'ant', 7);
  assert.equal(s.capacity, 4);
  assert.equal(s.size, 3);
});

test('get finds a key at the head and further along a chain', () => {
  const first = get(dflt(), 'cat');
  assert.match(first.steps.at(-1).caption, /value is 3/);
  const second = get(dflt(), 'bee');
  assert.match(second.steps.at(-1).caption, /value is 5/);
  assert.ok(second.steps.some((s) => /different key/.test(s.caption)));
  checkSteps(first.steps, programs.get);
  checkSteps(second.steps, programs.get);
});

test('get a missing key: empty bucket, and end of a chain', () => {
  const empty = get(dflt(), 'hen');
  assert.match(empty.steps.at(-1).caption, /is empty/);
  const chain = get(dflt(), 'pig'); // bucket 2 holds cat and bee
  assert.match(chain.steps.at(-1).caption, /end of the chain/);
  checkSteps(empty.steps, programs.get);
  checkSteps(chain.steps, programs.get);
});

test('remove from a chain, a lone bucket, and a missing key', () => {
  const r = remove(dflt(), 'cat');
  assert.deepEqual(r.final.buckets[2].map((e) => e.key), ['bee']);
  assert.equal(r.final.size, 2);
  checkInvariants(r.final);
  checkSteps(r.steps, programs.remove);
  assert.equal(remove(dflt(), 'dog').final.buckets[0].length, 0);
  const none = remove(dflt(), 'zzz');
  assert.equal(none.final.size, 3);
  assert.match(none.steps.at(-1).caption, /nothing to remove/);
  checkSteps(none.steps, programs.remove);
});

test('random puts, updates and removes agree with a JS Map', () => {
  let x = 21;
  const next = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  const keys = ['a', 'b', 'c', 'ab', 'ba', 'cat', 'dog', 'bee', 'ant', 'fox', 'owl', 'pig', 'hen', 'cow', '1', '22'];
  let s = createState();
  const model = new Map();
  for (let n = 0; n < 400; n++) {
    const k = keys[Math.floor(next() * keys.length)];
    const v = Math.floor(next() * 100);
    if (next() < 0.65) {
      if (!model.has(k) && model.size >= MAX_ENTRIES) continue;
      s = put(s, k, v).final;
      model.set(k, v);
    } else {
      s = remove(s, k).final;
      model.delete(k);
    }
    checkInvariants(s);
    assert.equal(s.size, model.size);
    for (const [key, value] of model) assert.equal(lookup(s, key), value);
    const probe = keys[Math.floor(next() * keys.length)];
    assert.equal(lookup(s, probe), model.get(probe));
  }
});

test('capacity grows only, never past what the entry limit needs', () => {
  let s = createState();
  for (let i = 0; i < MAX_ENTRIES; i++) s = put(s, `k${i}`, i).final;
  assert.equal(s.capacity, 16);
  assert.equal(s.size, MAX_ENTRIES);
  checkInvariants(s);
});

test('two sum finds the pair', () => {
  const r = twoSum(createState(), '2, 7, 11, 15', 9);
  assert.match(r.steps.at(-1).caption, /Answer: \[0, 1\]/);
  checkSteps(r.steps, programs.twoSum);
  const out = twoSum(createState(), '3, 2, 4', 6);
  assert.match(out.steps.at(-1).caption, /Answer: \[1, 2\]/);
});

test('two sum with duplicates, negatives, no answer, and a number never pairing with itself', () => {
  assert.match(twoSum(createState(), '3, 3', 6).steps.at(-1).caption, /Answer: \[0, 1\]/);
  assert.match(twoSum(createState(), '-3, 4, 3, 90', 0).steps.at(-1).caption, /Answer: \[0, 2\]/);
  const none = twoSum(createState(), '1, 2, 3', 100);
  assert.match(none.steps.at(-1).caption, /no two numbers/);
  checkSteps(none.steps, programs.twoSum);
  assert.match(twoSum(createState(), '3, 5', 6).steps.at(-1).caption, /no two numbers/); // 3 + 3 would reuse index 0
});

test('two sum agrees with brute force, including when the map resizes', () => {
  let x = 3;
  const next = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 100; t++) {
    const nums = Array.from({ length: 1 + Math.floor(next() * 8) }, () => Math.floor(next() * 21) - 5);
    const target = Math.floor(next() * 25) - 5;
    let expected = null;
    for (let j = 0; j < nums.length && !expected; j++) {
      for (let i = 0; i < j; i++) if (nums[i] + nums[j] === target) { expected = [i, j]; break; }
    }
    const r = twoSum(createState(), nums.join(' '), target);
    checkSteps(r.steps, programs.twoSum);
    const caption = r.steps.at(-1).caption;
    if (expected) {
      const [i, j] = caption.match(/Answer: \[(\d+), (\d+)\]/).slice(1).map(Number);
      assert.equal(nums[i] + nums[j], target, `${nums} target ${target}`);
      assert.equal(j, expected[1], 'finds the pair that completes earliest');
    } else {
      assert.match(caption, /no two numbers/);
    }
  }
});

test('two sum rejects bad input and leaves the map unchanged', () => {
  assert.throws(() => twoSum(createState(), '', 1), RangeError);
  assert.throws(() => twoSum(createState(), '1, x', 1), RangeError);
  assert.throws(() => twoSum(createState(), '1 2 3 4 5 6 7 8 9', 1), RangeError);
  assert.throws(() => twoSum(createState(), '1 2', 1.5), RangeError);
  const s = dflt();
  assert.equal(twoSum(s, '1 2 3', 5).final, s);
});
