import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, insert, search, remove, traversal, lca, inorderValues, count, programs } from './steps.js';

const DEFAULT = [50, 30, 70, 20, 40, 60, 80];
const tree = (values = DEFAULT) => createState(values);
const values = (s) => inorderValues(s.root);

function ids(n, out = []) {
  if (n) { out.push(n.id); ids(n.left, out); ids(n.right, out); }
  return out;
}

// BST rule must hold for whole subtrees, not just parent and child.
function isBst(n, lo = -Infinity, hi = Infinity) {
  return !n || (n.value > lo && n.value < hi && isBst(n.left, lo, n.value) && isBst(n.right, n.value, hi));
}

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    const known = new Set(ids(s.tree.root));
    for (const id of Object.keys(s.tree.marks)) assert.ok(known.has(Number(id)), `mark on missing node ${id}`);
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) < r.cells.length);
    }
  }
}

const output = (r) => r.steps.at(-1).rows.at(-1).cells.filter((c) => c !== null);

test('createState builds a valid BST with unique ids', () => {
  const s = tree();
  assert.deepEqual(values(s), [20, 30, 40, 50, 60, 70, 80]);
  assert.ok(isBst(s.root));
  assert.equal(new Set(ids(s.root)).size, 7);
});

test('insert adds a leaf and does not mutate the input', () => {
  const s = tree();
  const r = insert(s, 45);
  assert.deepEqual(values(r.final), [20, 30, 40, 45, 50, 60, 70, 80]);
  assert.ok(isBst(r.final.root));
  assert.equal(count(s.root), 7);
  checkSteps(r.steps, programs.insert);
});

test('insert into an empty tree and a duplicate', () => {
  const first = insert(createState(), 5);
  assert.deepEqual(values(first.final), [5]);
  checkSteps(first.steps, programs.insert);
  const dup = insert(first.final, 5);
  assert.equal(count(dup.final.root), 1);
  assert.match(dup.steps.at(-1).caption, /already/);
});

test('insert rejects bad values and enforces the node limit', () => {
  assert.throws(() => insert(tree(), 1.5), RangeError);
  assert.throws(() => insert(tree(), 5000), RangeError);
  const full = createState(Array.from({ length: 15 }, (_, i) => i));
  assert.throws(() => insert(full, 100), RangeError);
});

test('sorted input degrades to a chain (height n)', () => {
  const s = createState([1, 2, 3, 4, 5]);
  let h = 0;
  for (let n = s.root; n; n = n.right) h++;
  assert.equal(h, 5);
});

test('search found and not found', () => {
  const hit = search(tree(), 60);
  assert.match(hit.steps.at(-1).caption, /found after 3 comparisons/);
  checkSteps(hit.steps, programs.search);
  const miss = search(tree(), 65);
  assert.match(miss.steps.at(-1).caption, /not in the tree/);
  assert.match(search(createState(), 1).steps.at(-1).caption, /not in the tree/);
});

test('delete: leaf, one child, two children, root', () => {
  let r = remove(tree(), 20);
  assert.deepEqual(values(r.final), [30, 40, 50, 60, 70, 80]);
  checkSteps(r.steps, programs.delete);

  const oneChild = insert(tree(), 10).final; // 20 now has a left child
  r = remove(oneChild, 20);
  assert.deepEqual(values(r.final), [10, 30, 40, 50, 60, 70, 80]);
  assert.ok(isBst(r.final.root));
  checkSteps(r.steps, programs.delete);

  r = remove(tree(), 30); // two children
  assert.deepEqual(values(r.final), [20, 40, 50, 60, 70, 80]);
  assert.ok(isBst(r.final.root));
  checkSteps(r.steps, programs.delete);

  r = remove(tree(), 50); // the root, two children
  assert.deepEqual(values(r.final), [20, 30, 40, 60, 70, 80]);
  assert.equal(r.final.root.value, 60); // in-order successor
  checkSteps(r.steps, programs.delete);
});

test('delete the only node, a missing value, and no mutation', () => {
  assert.equal(remove(createState([7]), 7).final.root, null);
  const s = tree();
  assert.match(remove(s, 99).steps.at(-1).caption, /not in the tree/);
  remove(s, 50);
  assert.equal(count(s.root), 7);
});

test('every deletion order keeps a valid BST with unique ids', () => {
  const order = [50, 20, 70, 40, 30, 80, 60];
  let s = tree();
  const left = new Set(DEFAULT);
  for (const v of order) {
    s = remove(s, v).final;
    left.delete(v);
    assert.ok(isBst(s.root));
    assert.deepEqual(values(s), [...left].sort((a, b) => a - b));
    assert.equal(new Set(ids(s.root)).size, left.size);
  }
});

test('traversal orders', () => {
  const run = (kind) => {
    const r = traversal(tree(), kind);
    checkSteps(r.steps, programs[kind]);
    return output(r);
  };
  assert.deepEqual(run('inorder'), [20, 30, 40, 50, 60, 70, 80]);
  assert.deepEqual(run('preorder'), [50, 30, 20, 40, 70, 60, 80]);
  assert.deepEqual(run('postorder'), [20, 40, 30, 60, 80, 70, 50]);
  assert.deepEqual(run('levelorder'), [50, 30, 70, 20, 40, 60, 80]);
});

test('traversals on an empty and a single-node tree', () => {
  for (const kind of ['inorder', 'preorder', 'postorder', 'levelorder']) {
    assert.match(traversal(createState(), kind).steps[0].caption, /empty/);
    const r = traversal(createState([9]), kind);
    assert.deepEqual(output(r), [9]);
    checkSteps(r.steps, programs[kind]);
  }
});

test('lowest common ancestor', () => {
  const at = (p, q) => {
    const r = lca(tree(), p, q);
    checkSteps(r.steps, programs.lca);
    return Number(r.steps.at(-1).caption.match(/(\d+) is the lowest/)[1]);
  };
  assert.equal(at(20, 40), 30);
  assert.equal(at(20, 80), 50);
  assert.equal(at(30, 40), 30); // a node is its own descendant
  assert.equal(at(60, 60), 60);
  assert.throws(() => lca(tree(), 20, 99), RangeError);
});
