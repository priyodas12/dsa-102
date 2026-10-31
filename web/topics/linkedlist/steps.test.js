import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, prepend, append, insertAt, removeAt, search, reverse, hasCycle, valuesOf, programs, MAX_NODES } from './steps.js';

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    const ids = new Set(s.list.nodes.map((n) => n.id));
    assert.equal(ids.size, s.list.nodes.length, 'duplicate node ids');
    for (const n of s.list.nodes) assert.ok(n.next === null || ids.has(n.next), `dangling next ${n.next}`);
    for (const id of Object.keys(s.list.marks)) assert.ok(ids.has(Number(id)), `mark on missing node ${id}`);
    for (const id of Object.keys(s.list.edgeMarks)) assert.ok(ids.has(Number(id)), `edge mark on missing node ${id}`);
    for (const id of Object.values(s.list.pointers)) assert.ok(id === null || ids.has(id), `pointer to missing node ${id}`);
  }
}

// Follow next from head in the last step; stop if a node repeats.
function walk(step) {
  const byId = new Map(step.list.nodes.map((n) => [n.id, n]));
  const out = [];
  const seen = new Set();
  for (let id = step.list.pointers.head; id !== null && id !== undefined && !seen.has(id); id = byId.get(id).next) {
    seen.add(id);
    out.push(byId.get(id).value);
  }
  return out;
}

// The last step must describe exactly the final state, with nothing left floating.
function checkFinal(r, program) {
  checkSteps(r.steps, program);
  const last = r.steps.at(-1);
  assert.deepEqual(walk(last), valuesOf(r.final));
  assert.ok(last.list.nodes.every((n) => !n.lifted), 'node still lifted at the end');
  assert.equal(last.list.nodes.length, r.final.items.length);
  assert.equal(last.size, r.final.items.length);
}

const list = (...v) => createState(v);

test('prepend', () => {
  const r = prepend(list(3, 7), 1);
  assert.deepEqual(valuesOf(r.final), [1, 3, 7]);
  checkFinal(r, programs.prepend);
  const empty = prepend(createState(), 5);
  assert.deepEqual(valuesOf(empty.final), [5]);
  checkFinal(empty, programs.prepend);
});

test('append walks to the end', () => {
  const r = append(list(3, 7, 9), 4);
  assert.deepEqual(valuesOf(r.final), [3, 7, 9, 4]);
  assert.ok(r.steps.some((s) => /last node/.test(s.caption)));
  checkFinal(r, programs.append);
  const empty = append(createState(), 5);
  assert.deepEqual(valuesOf(empty.final), [5]);
  checkFinal(empty, programs.append);
});

test('insertAt at the head, middle and end', () => {
  for (const [index, expected] of [[0, [9, 3, 7, 5]], [1, [3, 9, 7, 5]], [2, [3, 7, 9, 5]], [3, [3, 7, 5, 9]]]) {
    const r = insertAt(list(3, 7, 5), index, 9);
    assert.deepEqual(valuesOf(r.final), expected, `index ${index}`);
    checkFinal(r, programs.insertAt);
  }
  const empty = insertAt(createState(), 0, 1);
  assert.deepEqual(valuesOf(empty.final), [1]);
  checkFinal(empty, programs.insertAt);
});

test('insertAt links the new node before relinking prev', () => {
  const r = insertAt(list(1, 2, 3), 1, 9);
  const linked = r.steps.find((s) => /node.next = prev.next/.test(s.caption));
  const byId = new Map(linked.list.nodes.map((n) => [n.id, n]));
  const prev = byId.get(1);
  const node = linked.list.nodes.find((n) => n.value === 9);
  assert.equal(node.next, 2);   // the new node already points at the old next
  assert.equal(prev.next, 2);   // while prev still points at it: nothing is lost
  assert.ok(node.lifted);
});

test('insert rejects bad input and enforces the node limit', () => {
  assert.throws(() => insertAt(list(1, 2), 3, 0), RangeError);
  assert.throws(() => insertAt(list(1, 2), -1, 0), RangeError);
  assert.throws(() => prepend(list(1), 1.5), RangeError);
  const full = createState(Array.from({ length: MAX_NODES }, (_, i) => i));
  assert.throws(() => append(full, 1), RangeError);
  assert.throws(() => prepend(full, 1), RangeError);
  assert.throws(() => insertAt(full, 0, 1), RangeError);
});

test('operations do not mutate their input', () => {
  const s = list(1, 2, 3);
  prepend(s, 0); append(s, 4); insertAt(s, 1, 9); removeAt(s, 1); reverse(s);
  assert.deepEqual(valuesOf(s), [1, 2, 3]);
});

test('removeAt at the head, middle and tail', () => {
  for (const [index, expected] of [[0, [7, 9, 5]], [1, [3, 9, 5]], [2, [3, 7, 5]], [3, [3, 7, 9]]]) {
    const r = removeAt(list(3, 7, 9, 5), index);
    assert.deepEqual(valuesOf(r.final), expected, `index ${index}`);
    checkFinal(r, programs.removeAt);
  }
  const only = removeAt(list(4), 0);
  assert.deepEqual(valuesOf(only.final), []);
  checkFinal(only, programs.removeAt);
});

test('removeAt skips the target before dropping it', () => {
  const r = removeAt(list(1, 2, 3), 1);
  const skip = r.steps.find((s) => /prev.next = target.next/.test(s.caption));
  assert.equal(skip.list.nodes.find((n) => n.value === 1).next, 3);
  assert.ok(skip.list.nodes.find((n) => n.value === 2).lifted);
});

test('removeAt rejects an empty list and bad indices', () => {
  assert.throws(() => removeAt(createState(), 0), RangeError);
  assert.throws(() => removeAt(list(1, 2), 2), RangeError);
  assert.throws(() => removeAt(list(1, 2), -1), RangeError);
});

test('search finds the first match or reports -1', () => {
  const hit = search(list(3, 7, 7), 7);
  assert.match(hit.steps.at(-1).caption, /found at index 1 after 2 nodes/);
  checkFinal(hit, programs.search);
  const miss = search(list(3, 7), 9);
  assert.match(miss.steps.at(-1).caption, /not present/);
  checkFinal(miss, programs.search);
  const empty = search(createState(), 1);
  assert.match(empty.steps.at(-1).caption, /empty/);
  checkSteps(empty.steps, programs.search);
});

test('reverse flips every arrow and returns the list backwards', () => {
  for (const values of [[1, 2, 3, 4], [1, 2], [1], []]) {
    const r = reverse(createState(values));
    assert.deepEqual(valuesOf(r.final), values.slice().reverse());
    checkSteps(r.steps, programs.reverse);
    if (values.length) checkFinal(r, programs.reverse);
  }
});

test('reverse: mid-way the head still points at the old first node, whose arrow now points to null', () => {
  const r = reverse(list(1, 2, 3));
  const flipped = r.steps.find((s) => /curr.next = prev/.test(s.caption));
  assert.equal(flipped.list.nodes.find((n) => n.id === 1).next, null);
  assert.equal(flipped.list.pointers.head, 1);
});

test('hasCycle finds loops and ends on plain lists', () => {
  const verdict = (state, tailTo) => {
    const r = hasCycle(state, tailTo);
    checkSteps(r.steps, programs.cycle);
    return /Return true/.test(r.steps.at(-1).caption);
  };
  for (let n = 1; n <= 8; n++) {
    const state = createState(Array.from({ length: n }, (_, i) => i));
    assert.equal(verdict(state, -1), false, `n=${n} no cycle`);
    for (let k = 0; k < n; k++) assert.equal(verdict(state, k), true, `n=${n} cycle to ${k}`);
  }
  assert.match(hasCycle(createState(), 0).steps.at(-1).caption, /empty/);
  assert.throws(() => hasCycle(list(1, 2), 2), RangeError);
  assert.throws(() => hasCycle(list(1, 2), -2), RangeError);
});

test('hasCycle does not change the stored list', () => {
  const s = list(1, 2, 3);
  const r = hasCycle(s, 0);
  assert.deepEqual(valuesOf(r.final), [1, 2, 3]);
});

test('random operations agree with a plain array', () => {
  let x = 5;
  const next = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  let s = createState();
  const model = [];
  for (let n = 0; n < 300; n++) {
    const pick = next();
    const v = Math.floor(next() * 100);
    if (model.length < MAX_NODES && pick < 0.15) { s = prepend(s, v).final; model.unshift(v); }
    else if (model.length < MAX_NODES && pick < 0.3) { s = append(s, v).final; model.push(v); }
    else if (model.length < MAX_NODES && pick < 0.6) { const i = Math.floor(next() * (model.length + 1)); s = insertAt(s, i, v).final; model.splice(i, 0, v); }
    else if (model.length && pick < 0.9) { const i = Math.floor(next() * model.length); s = removeAt(s, i).final; model.splice(i, 1); }
    else { s = reverse(s).final; model.reverse(); }
    assert.deepEqual(valuesOf(s), model);
    assert.equal(new Set(s.items.map((it) => it.id)).size, model.length);
  }
});
