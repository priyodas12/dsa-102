import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, push, pop, peek, brackets, programs } from './steps.js';

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

const lastCaption = (r) => r.steps.at(-1).caption;

test('push puts the value on top', () => {
  const { steps, final } = push(createState([1, 2], 4), 9);
  assert.deepEqual(final.items, [1, 2, 9]);
  checkSteps(steps, programs.push);
});

test('push onto a full stack is an overflow and changes nothing', () => {
  const state = createState([1, 2], 2);
  const r = push(state, 9);
  assert.deepEqual(r.final.items, [1, 2]);
  assert.match(lastCaption(r), /Overflow/);
  checkSteps(r.steps, programs.push);
});

test('pop returns last in, first out', () => {
  const { steps, final } = pop(createState([1, 2, 3], 4));
  assert.deepEqual(final.items, [1, 2]);
  assert.match(steps.at(-1).caption, /returns? 3|return 3/);
  checkSteps(steps, programs.pop);
});

test('pop to empty, then pop again is an underflow', () => {
  const emptied = pop(createState([7], 2));
  assert.deepEqual(emptied.final.items, []);
  checkSteps(emptied.steps, programs.pop);
  const r = pop(emptied.final);
  assert.match(lastCaption(r), /Underflow/);
  checkSteps(r.steps, programs.pop);
});

test('peek leaves the stack unchanged', () => {
  const state = createState([1, 2], 3);
  const r = peek(state);
  assert.deepEqual(r.final.items, [1, 2]);
  assert.match(lastCaption(r), /2/);
  checkSteps(r.steps, programs.peek);
  assert.match(lastCaption(peek(createState([], 2))), /empty/);
});

test('operations do not mutate their input', () => {
  const state = createState([1, 2], 4);
  push(state, 3);
  pop(state);
  assert.deepEqual(state.items, [1, 2]);
});

const verdict = (text) => {
  const r = brackets(createState([], 1), text);
  checkSteps(r.steps, programs.brackets);
  return !/not balanced/i.test(lastCaption(r)) && /balanced/i.test(lastCaption(r));
};

test('balanced brackets', () => {
  assert.equal(verdict('{[()]}'), true);
  assert.equal(verdict('()[]{}'), true);
});

test('unbalanced brackets', () => {
  assert.equal(verdict('(('), false);   // opener never closed
  assert.equal(verdict(')'), false);    // closer with empty stack
  assert.equal(verdict('(]'), false);   // wrong type
  assert.equal(verdict('([)]'), false); // wrong order
});

test('brackets ignores other characters and rejects empty input', () => {
  assert.equal(verdict('a(b)c'), true);
  assert.throws(() => brackets(createState([], 1), 'abc'), RangeError);
});
