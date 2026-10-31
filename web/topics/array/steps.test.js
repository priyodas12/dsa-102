import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, access, search, insert, remove, programs } from './steps.js';

const values = (s) => s.data.slice(0, s.size);

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

test('insert in the middle shifts right', () => {
  const { steps, final } = insert(createState([1, 2, 3], 5), 1, 9);
  assert.deepEqual(values(final), [1, 9, 2, 3]);
  checkSteps(steps, programs.insert);
});

test('insert at the front and at the end', () => {
  assert.deepEqual(values(insert(createState([1, 2], 4), 0, 9).final), [9, 1, 2]);
  assert.deepEqual(values(insert(createState([1, 2], 4), 2, 9).final), [1, 2, 9]);
});

test('insert into an empty array', () => {
  const { final } = insert(createState([], 1), 0, 5);
  assert.deepEqual(values(final), [5]);
});

test('insert into a full array doubles capacity', () => {
  const { steps, final } = insert(createState([1, 2, 3], 3), 3, 4);
  assert.equal(final.data.length, 6);
  assert.deepEqual(values(final), [1, 2, 3, 4]);
  assert.ok(steps.some((s) => s.rows.length === 2), 'shows old and new array');
  checkSteps(steps, programs.insert);
});

test('insert does not mutate its input', () => {
  const state = createState([1, 2], 4);
  insert(state, 0, 9);
  assert.deepEqual(values(state), [1, 2]);
});

test('insert rejects bad indices', () => {
  const s = createState([1, 2], 4);
  assert.throws(() => insert(s, 3, 0), RangeError);
  assert.throws(() => insert(s, -1, 0), RangeError);
  assert.throws(() => insert(s, 1.5, 0), RangeError);
});

test('delete shifts left and clears the tail', () => {
  const { steps, final } = remove(createState([1, 2, 3, 4], 5), 1);
  assert.deepEqual(values(final), [1, 3, 4]);
  assert.equal(final.data[3], null);
  checkSteps(steps, programs.delete);
});

test('delete the last and the only element', () => {
  assert.deepEqual(values(remove(createState([1, 2], 3), 1).final), [1]);
  assert.deepEqual(values(remove(createState([7], 1), 0).final), []);
});

test('delete rejects index == size', () => {
  assert.throws(() => remove(createState([1, 2], 4), 2), RangeError);
});

test('search finds the first match and stops', () => {
  const { steps } = search(createState([4, 7, 7], 4), 7);
  assert.equal(steps.at(-1).rows[0].marks[1], 'found');
  checkSteps(steps, programs.search);
});

test('search miss compares every element', () => {
  const { steps } = search(createState([1, 2, 3], 4), 9);
  assert.equal(steps.filter((s) => s.line === 2).length, 3);
  assert.match(steps.at(-1).caption, /-1/);
});

test('access returns in a constant number of steps', () => {
  const small = access(createState([1, 2, 3], 3), 2).steps.length;
  const big = access(createState(Array.from({ length: 50 }, (_, i) => i), 50), 49).steps.length;
  assert.equal(small, big);
  assert.throws(() => access(createState([1], 2), 1), RangeError);
});
