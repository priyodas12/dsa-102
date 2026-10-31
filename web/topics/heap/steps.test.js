import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, insert, extractMin, peek, heapify, topK, isMinHeap, build, programs } from './steps.js';

const sorted = (a) => a.slice().sort((x, y) => x - y);

function treeIds(n, out = []) {
  if (n) { out.push(n.id); treeIds(n.left, out); treeIds(n.right, out); }
  return out;
}

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    const ids = new Set(treeIds(s.tree.root));
    for (const id of Object.keys(s.tree.marks)) assert.ok(ids.has(Number(id)), `mark on missing node ${id}`);
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) < r.cells.length || r.label === 'input');
    }
    assert.equal(s.size, treeIds(s.tree.root).length);
  }
}

// Deterministic pseudo-random numbers so failures are reproducible.
function rng(seed) {
  let x = seed;
  return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
}

test('tree built from the array uses array indices as ids', () => {
  const root = build([1, 2, 3, 4]);
  assert.equal(root.left.value, 2);
  assert.equal(root.right.id, 2);
  assert.equal(root.left.left.id, 3);
  assert.equal(build([]), null);
});

test('createState builds a valid min-heap', () => {
  const s = createState([10, 20, 15, 30, 40, 25, 18]);
  assert.ok(isMinHeap(s.items));
  assert.equal(s.items[0], 10);
  assert.deepEqual(sorted(s.items), [10, 15, 18, 20, 25, 30, 40]);
});

test('insert sifts a small value all the way up', () => {
  const s = createState([10, 20, 15, 30, 40]);
  const r = insert(s, 5);
  assert.equal(r.final.items[0], 5);
  assert.ok(isMinHeap(r.final.items));
  assert.ok(r.steps.some((st) => /swap/.test(st.caption)));
  checkSteps(r.steps, programs.insert);
});

test('insert a large value needs no swaps; into an empty heap', () => {
  const r = insert(createState([1, 2, 3]), 99);
  assert.equal(r.final.items.at(-1), 99);
  assert.ok(!r.steps.some((st) => /swap/.test(st.caption)));
  checkSteps(r.steps, programs.insert);
  const first = insert(createState(), 7);
  assert.deepEqual(first.final.items, [7]);
  checkSteps(first.steps, programs.insert);
});

test('insert does not mutate input and rejects bad values', () => {
  const s = createState([3, 5]);
  insert(s, 1);
  assert.deepEqual(s.items, [3, 5]);
  assert.throws(() => insert(s, 1.5), RangeError);
  assert.throws(() => insert(createState(Array.from({ length: 15 }, (_, i) => i)), 100), RangeError);
});

test('extractMin removes the smallest and restores the heap', () => {
  const s = createState([10, 20, 15, 30, 40, 25, 18]);
  const r = extractMin(s);
  assert.equal(r.final.items.length, 6);
  assert.ok(isMinHeap(r.final.items));
  assert.deepEqual(sorted(r.final.items), [15, 18, 20, 25, 30, 40]);
  assert.match(r.steps.at(-1).caption, /returns? 10/);
  checkSteps(r.steps, programs.extract);
});

test('extractMin on one element and on an empty heap', () => {
  const one = extractMin(createState([4]));
  assert.deepEqual(one.final.items, []);
  checkSteps(one.steps, programs.extract);
  const none = extractMin(createState());
  assert.match(none.steps.at(-1).caption, /empty/);
  assert.deepEqual(none.final.items, []);
  checkSteps(none.steps, programs.extract);
});

test('repeated extractMin returns values in sorted order', () => {
  let s = createState([9, 4, 7, 1, 8, 2, 6, 3]);
  const out = [];
  while (s.items.length) {
    out.push(s.items[0]);
    s = extractMin(s).final;
    assert.ok(isMinHeap(s.items));
  }
  assert.deepEqual(out, [1, 2, 3, 4, 6, 7, 8, 9]);
});

test('random inserts and extracts always keep the heap property', () => {
  const next = rng(42);
  let s = createState();
  const model = [];
  for (let n = 0; n < 200; n++) {
    if (s.items.length < 15 && (s.items.length === 0 || next() < 0.55)) {
      const v = Math.floor(next() * 50);
      s = insert(s, v).final;
      model.push(v);
    } else {
      assert.equal(s.items[0], Math.min(...model));
      s = extractMin(s).final;
      model.splice(model.indexOf(Math.min(...model)), 1);
    }
    assert.ok(isMinHeap(s.items));
    assert.deepEqual(sorted(s.items), sorted(model));
  }
});

test('peek reads the root and changes nothing', () => {
  const s = createState([4, 9, 6]);
  const r = peek(s);
  assert.match(r.steps.at(-1).caption, /4/);
  assert.deepEqual(r.final.items, s.items);
  checkSteps(r.steps, programs.peek);
  assert.match(peek(createState()).steps.at(-1).caption, /empty/);
});

test('heapify builds a valid heap from any array', () => {
  const r = heapify(createState(), '9, 4, 7, 1, 8, 2, 6');
  assert.ok(isMinHeap(r.final.items));
  assert.equal(r.final.items[0], 1);
  assert.deepEqual(sorted(r.final.items), [1, 2, 4, 6, 7, 8, 9]);
  checkSteps(r.steps, programs.heapify);
  for (const text of ['5', '2 1', '1 2 3 4 5', '5 4 3 2 1', '3,3,3']) {
    const out = heapify(createState(), text);
    assert.ok(isMinHeap(out.final.items), text);
    checkSteps(out.steps, programs.heapify);
  }
});

test('heapify and topK reject bad input', () => {
  assert.throws(() => heapify(createState(), ''), RangeError);
  assert.throws(() => heapify(createState(), '1, x'), RangeError);
  assert.throws(() => heapify(createState(), Array(16).fill(1).join(',')), RangeError);
  assert.throws(() => topK(createState(), '1 2 3', 4), RangeError);
  assert.throws(() => topK(createState(), '1 2 3', 0), RangeError);
});

test('topK keeps the k largest and reports the k-th largest', () => {
  const nums = [3, 9, 4, 7, 1, 8];
  const r = topK(createState(), nums.join(', '), 3);
  checkSteps(r.steps, programs.topk);
  const last = r.steps.at(-1);
  assert.match(last.caption, /9, 8, 7/);
  assert.match(last.caption, /root, 7, is the 3rd largest/);
  assert.equal(last.rows.at(-1).cells.length, 3);
  assert.ok(isMinHeap(last.rows.at(-1).cells));
});

test('topK matches a plain sort on many inputs', () => {
  const next = rng(7);
  for (let t = 0; t < 50; t++) {
    const nums = Array.from({ length: 1 + Math.floor(next() * 12) }, () => Math.floor(next() * 30));
    const k = 1 + Math.floor(next() * nums.length);
    const r = topK(createState(), nums.join(' '), k);
    const expected = nums.slice().sort((a, b) => b - a).slice(0, k);
    assert.match(r.steps.at(-1).caption, new RegExp(`the ${k} largest are ${expected.join(', ')}\\.`));
  }
});
