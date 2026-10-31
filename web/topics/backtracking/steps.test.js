import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, subsets, permutations, parentheses, nQueens, programs } from './steps.js';

const state = createState();
const last = (r) => r.steps.at(-1);

function ids(n, out = []) {
  out.push(n.id);
  n.children.forEach((c) => ids(c, out));
  return out;
}

function parents(n, map = new Map()) {
  n.children.forEach((c) => { map.set(c.id, n.id); parents(c, map); });
  return map;
}

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  let prevCount = 0;
  let prevParents = new Map();
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    assert.ok(typeof s.meta === 'string');
    if (s.search) {
      const all = ids(s.search.root);
      assert.equal(new Set(all).size, all.length, 'duplicate node ids');
      for (const id of Object.keys(s.search.marks)) assert.ok(all.includes(Number(id)), `mark on missing node ${id}`);
      // The tree only grows, and a node never changes parent.
      assert.ok(all.length >= prevCount, 'tree shrank');
      const p = parents(s.search.root);
      for (const [child, parent] of prevParents) assert.equal(p.get(child), parent, 'a node moved');
      prevCount = all.length;
      prevParents = p;
      assert.equal(s.size, all.length);
    }
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) >= 0 && Number(idx) < Math.max(r.cells.length, 1), `mark ${idx} outside ${r.label}`);
    }
  }
}

const results = (r) => last(r).rows.find((row) => row.label === 'results so far').cells;
const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

test('subsets: 2^n distinct subsets, each a subset of the input', () => {
  for (const nums of [[1], [1, 2], [1, 2, 3], [4, 7, 9, 2]]) {
    const r = subsets(state, nums.join(', '));
    checkSteps(r.steps, programs.subsets);
    const out = results(r);
    assert.equal(out.length, 2 ** nums.length);
    assert.equal(new Set(out).size, out.length, 'duplicate subset');
    for (const text of out) {
      const items = text.slice(1, -1).split(',').filter(Boolean).map(Number);
      assert.ok(items.every((x) => nums.includes(x)));
      assert.deepEqual(items, nums.filter((x) => items.includes(x)), 'keeps input order');
    }
  }
  assert.match(last(subsets(state, '1, 2, 3')).caption, /8 subsets = 2\^3/);
});

test('subsets of three numbers are exactly the expected eight, in leave-out-first order', () => {
  assert.deepEqual(results(subsets(state, '1, 2, 3')), ['{}', '{3}', '{2}', '{2,3}', '{1}', '{1,3}', '{1,2}', '{1,2,3}']);
});

test('subsets tree: one level per number, every internal node has two children', () => {
  const r = subsets(state, '1, 2, 3');
  const root = last(r).search.root;
  const walk = (n, depth) => {
    if (depth === 3) assert.equal(n.children.length, 0);
    else {
      assert.equal(n.children.length, 2);
      assert.match(n.children[0].edge, /^skip/);
      assert.match(n.children[1].edge, /^take/);
      n.children.forEach((c) => walk(c, depth + 1));
    }
  };
  walk(root, 0);
  assert.equal(ids(root).length, 15);
});

test('the path is undone after every branch (backtracking)', () => {
  const r = subsets(state, '1, 2, 3');
  assert.ok(r.steps.some((s) => /Undo: path.remove/.test(s.caption)));
  assert.deepEqual(last(r).rows[0].cells, ['(empty)'], 'path is empty at the end');
});

test('permutations: n! distinct orderings of the input', () => {
  for (const nums of [[5], [1, 2], [1, 2, 3], [9, 4, 7]]) {
    const r = permutations(state, nums.join(', '));
    checkSteps(r.steps, programs.permutations);
    const out = results(r);
    assert.equal(out.length, factorial(nums.length));
    assert.equal(new Set(out).size, out.length);
    for (const text of out) assert.deepEqual(text.slice(1, -1).split(',').map(Number).sort((a, b) => a - b), nums.slice().sort((a, b) => a - b));
  }
  assert.deepEqual(results(permutations(state, '1, 2, 3')), ['[1,2,3]', '[1,3,2]', '[2,1,3]', '[2,3,1]', '[3,1,2]', '[3,2,1]']);
});

test('permutations show used numbers being skipped', () => {
  assert.ok(permutations(state, '1, 2, 3').steps.some((s) => /already in the path/.test(s.caption)));
});

test('input validation', () => {
  assert.throws(() => subsets(state, ''), RangeError);
  assert.throws(() => subsets(state, '1, 2, 3, 4, 5'), RangeError);
  assert.throws(() => subsets(state, '1, 1'), RangeError);
  assert.throws(() => subsets(state, '1, x'), RangeError);
  assert.throws(() => permutations(state, '1, 2, 3, 4'), RangeError);
  assert.throws(() => permutations(state, '100'), RangeError);
  assert.throws(() => parentheses(state, 0), RangeError);
  assert.throws(() => parentheses(state, 4), RangeError);
  assert.throws(() => parentheses(state, 1.5), RangeError);
  assert.throws(() => nQueens(state, 0), RangeError);
  assert.throws(() => nQueens(state, 6), RangeError);
});

test('parentheses: Catalan-many strings, all valid and distinct', () => {
  const valid = (s) => { let d = 0; for (const c of s) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; };
  for (const [n, count] of [[1, 1], [2, 2], [3, 5]]) {
    const r = parentheses(state, n);
    checkSteps(r.steps, programs.parentheses);
    const out = results(r);
    assert.equal(out.length, count);
    assert.equal(new Set(out).size, count);
    assert.ok(out.every((s) => s.length === 2 * n && valid(s)));
  }
  assert.deepEqual(results(parentheses(state, 3)), ['((()))', '(()())', '(())()', '()(())', '()()()']);
});

test('parentheses prunes: pruned nodes are leaves, and they beat brute force', () => {
  const r = parentheses(state, 3);
  const root = last(r).search.root;
  const prunedIds = Object.entries(last(r).search.marks).filter(([, k]) => k === 'removed').map(([id]) => Number(id));
  // Pruned marks are kept for the whole search; check a mid-search step too.
  const withPruned = r.steps.find((s) => Object.values(s.search.marks).includes('removed'));
  assert.ok(withPruned, 'some branch is pruned');
  const find = (n, id) => (n.id === id ? n : n.children.map((c) => find(c, id)).find(Boolean));
  const cut = Object.entries(withPruned.search.marks).filter(([, k]) => k === 'removed').map(([id]) => find(withPruned.search.root, Number(id)));
  assert.ok(cut.every((n) => n.children.length === 0), 'a pruned node has no children');
  assert.ok(ids(root).length < 2 ** 7 - 1, 'far fewer nodes than the full binary tree');
  assert.ok(prunedIds.length > 0);
  assert.match(last(r).caption, /Catalan number 5/);
});

test('N-Queens: known solution counts and every solution is valid', () => {
  const expected = { 1: 1, 2: 0, 3: 0, 4: 2, 5: 10 };
  for (let n = 1; n <= 5; n++) {
    const r = nQueens(state, n);
    checkSteps(r.steps, programs.nQueens);
    const sols = last(r).rows.at(-1).cells.map((t) => t.split(' ').map(Number));
    assert.equal(sols.length, expected[n], `n=${n}`);
    assert.equal(new Set(sols.map((s) => s.join())).size, sols.length);
    for (const cols of sols) {
      assert.equal(cols.length, n);
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
        assert.notEqual(cols[a], cols[b], 'same column');
        assert.notEqual(Math.abs(cols[a] - cols[b]), b - a, 'same diagonal');
      }
    }
  }
  assert.deepEqual(last(nQueens(state, 4)).rows.at(-1).cells, ['1 3 0 2', '2 0 3 1']);
});

test('N-Queens board: at most one queen per row, and queens are removed on backtrack', () => {
  const r = nQueens(state, 4);
  for (const s of r.steps) {
    for (const row of s.rows.filter((x) => x.label.startsWith('row '))) {
      assert.ok(row.cells.filter((c) => c === '♛').length <= 1, 'two queens in a row');
    }
  }
  assert.ok(r.steps.some((s) => /remove the queen/.test(s.caption)));
  assert.ok(r.steps.some((s) => /dead end/.test(s.caption)));
  assert.ok(r.steps.some((s) => /shares a diagonal/.test(s.caption)));
  assert.ok(r.steps.some((s) => /already has a queen/.test(s.caption)));
  assert.equal(last(r).rows.filter((x) => x.label.startsWith('row ')).every((row) => row.cells.every((c) => c === '')), true, 'board is empty at the end');
});

test('operations do not change the (unused) state', () => {
  const s = createState();
  assert.equal(subsets(s, '1, 2').final, s);
  assert.equal(nQueens(s, 4).final, s);
});
