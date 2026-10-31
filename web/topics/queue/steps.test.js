import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, enqueue, dequeue, peek, josephus, programs } from './steps.js';

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const step of steps) {
    assert.ok(step.caption.length > 0);
    assert.ok(step.line >= 0 && step.line < program.length, `line ${step.line} out of range`);
    for (const r of step.rows) {
      for (const idx of [...Object.keys(r.marks), ...Object.values(r.pointers)]) {
        assert.ok(Number(idx) >= 0 && Number(idx) < r.cells.length, `index ${idx} outside row`);
      }
    }
  }
}

// Read the queue front to back, following the wrap-around.
const items = ({ data, head, size }) => Array.from({ length: size }, (_, i) => data[(head + i) % data.length]);
const lastCaption = (r) => r.steps.at(-1).caption;

test('enqueue then dequeue is first in, first out', () => {
  let s = createState([], 3);
  s = enqueue(s, 1).final;
  s = enqueue(s, 2).final;
  const r = dequeue(s);
  assert.match(lastCaption(r), /return 1/);
  assert.deepEqual(items(r.final), [2]);
  checkSteps(r.steps, programs.dequeue);
});

test('enqueue wraps around the end of the array', () => {
  const r = enqueue(createState([1, 2, 3], 4, 2), 9); // occupies 2,3,0 -> next free is 1
  assert.deepEqual(items(r.final), [1, 2, 3, 9]);
  assert.equal(r.final.data[1], 9);
  assert.ok(r.steps.some((st) => /wrapped/.test(st.caption)));
  checkSteps(r.steps, programs.enqueue);
});

test('dequeue wraps head back to 0', () => {
  const r = dequeue(createState([5, 6], 3, 2)); // occupies 2,0
  assert.equal(r.final.head, 0);
  assert.deepEqual(items(r.final), [6]);
  checkSteps(r.steps, programs.dequeue);
});

test('enqueue into a full queue is an overflow and changes nothing', () => {
  const r = enqueue(createState([1, 2], 2), 9);
  assert.deepEqual(items(r.final), [1, 2]);
  assert.match(lastCaption(r), /Overflow/);
  checkSteps(r.steps, programs.enqueue);
});

test('dequeue from an empty queue is an underflow', () => {
  const r = dequeue(createState([], 2));
  assert.match(lastCaption(r), /Underflow/);
  assert.equal(r.final.size, 0);
  checkSteps(r.steps, programs.dequeue);
});

test('queue can be filled, emptied and reused', () => {
  let s = createState([], 2);
  for (const v of [1, 2]) s = enqueue(s, v).final;
  for (let i = 0; i < 2; i++) s = dequeue(s).final;
  s = enqueue(enqueue(s, 3).final, 4).final;
  assert.deepEqual(items(s), [3, 4]);
});

test('peek leaves the queue unchanged', () => {
  const state = createState([7, 8], 4, 1);
  const r = peek(state);
  assert.match(lastCaption(r), /7/);
  assert.deepEqual(items(r.final), [7, 8]);
  checkSteps(r.steps, programs.peek);
  assert.match(lastCaption(peek(createState([], 2))), /empty/);
});

test('operations do not mutate their input', () => {
  const state = createState([1, 2], 4);
  enqueue(state, 3);
  dequeue(state);
  assert.deepEqual(items(state), [1, 2]);
});

test('hot potato: known Josephus answers', () => {
  const winner = (n, k) => {
    const r = josephus(createState([], 1), n, k);
    checkSteps(r.steps, programs.josephus);
    return Number(lastCaption(r).match(/person (\d+) wins/)[1]);
  };
  assert.equal(winner(5, 3), 4);
  assert.equal(winner(7, 3), 4);
  assert.equal(winner(1, 5), 1);
  assert.equal(winner(4, 1), 4); // skip 1 removes the front each round
});

test('hot potato rejects bad input', () => {
  const s = createState([], 1);
  assert.throws(() => josephus(s, 0, 3), RangeError);
  assert.throws(() => josephus(s, 5, 11), RangeError);
  assert.throws(() => josephus(s, 2.5, 2), RangeError);
});
