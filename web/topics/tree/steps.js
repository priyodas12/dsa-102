// Pure step generators for the tree topic: a binary search tree (BST).
//
// State: { root, nextId }. A node is { id, value, left, right } and is never mutated, so every
// step can keep a reference to the tree exactly as it looked at that moment.
// Step: { tree: { root, marks: { nodeId: kind } }, rows, caption, line, size }
// Every operation returns { steps, final } and never mutates its input.

export const MAX_NODES = 15;

export const programs = {
  insert: [
    'Node insert(Node node, int value) {',
    '  if (node == null) return new Node(value);',
    '  if (value < node.value) node.left = insert(node.left, value);',
    '  else if (value > node.value) node.right = insert(node.right, value);',
    '  return node; // equal: already present',
    '}',
  ],
  search: [
    'boolean contains(Node node, int target) {',
    '  if (node == null) return false;',
    '  if (target == node.value) return true;',
    '  return target < node.value',
    '      ? contains(node.left, target)',
    '      : contains(node.right, target);',
    '}',
  ],
  delete: [
    'Node delete(Node node, int value) {',
    '  if (node == null) return null;',
    '  if (value < node.value) node.left = delete(node.left, value);',
    '  else if (value > node.value) node.right = delete(node.right, value);',
    '  else {',
    '    if (node.left == null) return node.right;  // 0 or 1 child',
    '    if (node.right == null) return node.left;',
    '    Node next = min(node.right);               // 2 children: in-order successor',
    '    node.value = next.value;',
    '    node.right = delete(node.right, next.value);',
    '  }',
    '  return node;',
    '}',
  ],
  inorder: [
    'void inorder(Node node, List<Integer> out) {',
    '  if (node == null) return;',
    '  inorder(node.left, out);',
    '  out.add(node.value); // visit between the children',
    '  inorder(node.right, out);',
    '}',
  ],
  preorder: [
    'void preorder(Node node, List<Integer> out) {',
    '  if (node == null) return;',
    '  out.add(node.value); // visit before the children',
    '  preorder(node.left, out);',
    '  preorder(node.right, out);',
    '}',
  ],
  postorder: [
    'void postorder(Node node, List<Integer> out) {',
    '  if (node == null) return;',
    '  postorder(node.left, out);',
    '  postorder(node.right, out);',
    '  out.add(node.value); // visit after the children',
    '}',
  ],
  levelorder: [
    'List<Integer> levelOrder(Node root) {',
    '  List<Integer> out = new ArrayList<>();',
    '  Queue<Node> queue = new ArrayDeque<>();',
    '  if (root != null) queue.add(root);',
    '  while (!queue.isEmpty()) {',
    '    Node node = queue.remove();',
    '    out.add(node.value);',
    '    if (node.left != null) queue.add(node.left);',
    '    if (node.right != null) queue.add(node.right);',
    '  }',
    '  return out;',
    '}',
  ],
  lca: [
    'Node lca(Node root, int p, int q) {',
    '  Node node = root;',
    '  while (node != null) {',
    '    if (p < node.value && q < node.value) node = node.left;',
    '    else if (p > node.value && q > node.value) node = node.right;',
    '    else return node; // the paths split here (or one of them is this node)',
    '  }',
    '  return null;',
    '}',
  ],
};

// --- tree helpers ----------------------------------------------------------

const makeNode = (id, value, left = null, right = null) => ({ id, value, left, right });

export const count = (n) => (n ? 1 + count(n.left) + count(n.right) : 0);
export const height = (n) => (n ? 1 + Math.max(height(n.left), height(n.right)) : 0);

export function inorderValues(n, out = []) {
  if (n) {
    inorderValues(n.left, out);
    out.push(n.value);
    inorderValues(n.right, out);
  }
  return out;
}

function insertNode(n, value, id) {
  if (!n) return makeNode(id, value);
  if (value < n.value) return { ...n, left: insertNode(n.left, value, id) };
  if (value > n.value) return { ...n, right: insertNode(n.right, value, id) };
  return n;
}

function deleteNode(n, value) {
  if (!n) return null;
  if (value < n.value) return { ...n, left: deleteNode(n.left, value) };
  if (value > n.value) return { ...n, right: deleteNode(n.right, value) };
  if (!n.left) return n.right;
  if (!n.right) return n.left;
  let next = n.right;
  while (next.left) next = next.left;
  return { ...n, value: next.value, right: deleteNode(n.right, next.value) };
}

function replaceNode(n, id, change) {
  if (!n) return null;
  if (n.id === id) return change(n);
  return { ...n, left: replaceNode(n.left, id, change), right: replaceNode(n.right, id, change) };
}

const step = (root, marks, line, caption, rows = []) => ({
  tree: { root, marks },
  rows,
  line,
  caption,
  size: count(root),
});

function checkValue(v, what = 'value') {
  if (!Number.isInteger(v) || v < -99 || v > 999) throw new RangeError(`${what} must be a whole number from -99 to 999`);
}

export function createState(values = []) {
  let state = { root: null, nextId: 1 };
  for (const v of values) state = insert(state, v).final;
  return state;
}

// --- operations ------------------------------------------------------------

export function insert(state, value) {
  checkValue(value);
  const { root, nextId } = state;
  if (count(root) >= MAX_NODES && !hasValue(root, value)) {
    throw new RangeError(`this demo tree holds at most ${MAX_NODES} nodes`);
  }
  const steps = [];
  const add = (r, marks, line, caption) => steps.push(step(r, marks, line, caption));

  add(root, {}, 0, `insert(${value}): walk down from the root. Smaller values go left, larger go right`);
  const seen = {};
  let comparisons = 0;
  for (let cur = root; cur; ) {
    if (value === cur.value) {
      add(root, { ...seen, [cur.id]: 'found' }, 4, `${value} is already in the tree. A BST holds no duplicates, so nothing changes`);
      return { steps, final: state };
    }
    const goLeft = value < cur.value;
    comparisons++;
    add(root, { ...seen, [cur.id]: 'compare' }, goLeft ? 2 : 3, `${value} ${goLeft ? '<' : '>'} ${cur.value}, so go ${goLeft ? 'left' : 'right'}`);
    seen[cur.id] = 'visited';
    cur = goLeft ? cur.left : cur.right;
  }
  const next = insertNode(root, value, nextId);
  add(next, { ...seen, [nextId]: 'new' }, 1,
    `reached an empty spot (null) after ${comparisons} comparison${comparisons === 1 ? '' : 's'}: create the node here. It is always added as a leaf, no other node moves`);
  return { steps, final: { root: next, nextId: nextId + 1 } };
}

function hasValue(n, value) {
  while (n) {
    if (value === n.value) return true;
    n = value < n.value ? n.left : n.right;
  }
  return false;
}

export function search(state, target) {
  checkValue(target, 'target');
  const { root } = state;
  const steps = [];
  const add = (marks, line, caption) => steps.push(step(root, marks, line, caption));

  add({}, 0, `contains(${target}): start at the root. Smaller goes left, larger goes right, so each step discards a whole subtree`);
  const seen = {};
  let comparisons = 0;
  for (let cur = root; cur; ) {
    comparisons++;
    if (target === cur.value) {
      add({ ...seen, [cur.id]: 'found' }, 2, `${target} equals ${cur.value}: found after ${comparisons} comparison${comparisons === 1 ? '' : 's'}`);
      return { steps, final: state };
    }
    const goLeft = target < cur.value;
    add({ ...seen, [cur.id]: 'compare' }, goLeft ? 4 : 5, `${target} ${goLeft ? '<' : '>'} ${cur.value}, so go ${goLeft ? 'left' : 'right'}`);
    seen[cur.id] = 'visited';
    cur = goLeft ? cur.left : cur.right;
  }
  add(seen, 1, `reached null: ${target} is not in the tree (${comparisons} comparison${comparisons === 1 ? '' : 's'}, at most the height)`);
  return { steps, final: state };
}

export function remove(state, value) {
  checkValue(value);
  const { root, nextId } = state;
  const steps = [];
  const add = (r, marks, line, caption) => steps.push(step(r, marks, line, caption));

  add(root, {}, 0, `delete(${value}): first find the node, then fix the hole it leaves behind`);
  const seen = {};
  let target = root;
  while (target && target.value !== value) {
    const goLeft = value < target.value;
    add(root, { ...seen, [target.id]: 'compare' }, goLeft ? 2 : 3, `${value} ${goLeft ? '<' : '>'} ${target.value}, so go ${goLeft ? 'left' : 'right'}`);
    seen[target.id] = 'visited';
    target = goLeft ? target.left : target.right;
  }
  if (!target) {
    add(root, seen, 1, `reached null: ${value} is not in the tree, nothing to delete`);
    return { steps, final: state };
  }

  const final = { root: deleteNode(root, value), nextId };
  if (!target.left || !target.right) {
    const child = target.left ?? target.right;
    const line = target.left ? 6 : 5;
    add(root, { ...seen, [target.id]: 'removed' }, line,
      child
        ? `${value} has one child (${child.value}): the child simply takes its place`
        : `${value} is a leaf (no children): just remove it`);
    add(final.root, child ? { [child.id]: 'new' } : {}, line,
      child ? `${child.value} moved up. Everything in its subtree is still on the correct side` : `done: the leaf is gone, nothing else moved`);
    return { steps, final };
  }

  add(root, { ...seen, [target.id]: 'removed' }, 4,
    `${value} has two children, so it cannot just be unlinked. Replace its value with the in-order successor: the smallest value in the right subtree`);
  let next = target.right;
  const path = { [target.id]: 'removed' };
  add(root, { ...path, [next.id]: 'compare' }, 7, `go right once to ${next.value}, then keep going left as far as possible`);
  while (next.left) {
    next = next.left;
    add(root, { ...path, [next.id]: 'compare' }, 7, `go left to ${next.value}`);
  }
  add(root, { ...path, [next.id]: 'found' }, 7, `${next.value} has no left child, so it is the smallest in that subtree: the successor`);
  const copied = replaceNode(root, target.id, (n) => ({ ...n, value: next.value }));
  add(copied, { [target.id]: 'new', [next.id]: 'removed' }, 8, `copy ${next.value} into the node that held ${value}. The old successor node is now a duplicate`);
  add(final.root, { [target.id]: 'new' }, 9, `delete the duplicate ${next.value} from the right subtree. It has no left child, so this is the easy case`);
  return { steps, final };
}

// --- traversals ------------------------------------------------------------

const DESCRIPTION = {
  inorder: 'in-order: left subtree, node, right subtree. On a BST this visits values in sorted order',
  preorder: 'pre-order: node, left subtree, right subtree. The node comes before its children, which is how you copy a tree',
  postorder: 'post-order: left subtree, right subtree, node. Children come first, which is how you delete a tree safely',
  levelorder: 'level-order: row by row from the top, using a queue instead of recursion',
};

export function traversal(state, kind) {
  const { root } = state;
  const n = count(root);
  if (!root) {
    return { steps: [step(root, {}, 0, 'the tree is empty, so the traversal visits nothing')], final: state };
  }
  const steps = [];
  const out = [];
  const seen = {};
  const pad = (items) => Array.from({ length: n }, (_, i) => (i < items.length ? items[i] : null));
  const outRow = () => ({
    label: 'output',
    cells: pad(out),
    marks: out.length ? { [out.length - 1]: 'visit' } : {},
    pointers: {},
  });

  if (kind === 'levelorder') return levelOrder(state, steps, out, seen, pad, outRow);

  const add = (marks, line, caption) =>
    steps.push(step(root, { ...seen, ...marks }, line, caption, [outRow()]));
  const visit = (nd, line, caption) => {
    out.push(nd.value);
    add({ [nd.id]: 'visit' }, line, caption);
    seen[nd.id] = 'visited';
  };

  add({}, 0, DESCRIPTION[kind]);
  (function walk(nd) {
    if (!nd) return;
    if (kind === 'preorder') {
      visit(nd, 2, `visit ${nd.value} first, before its children`);
      walk(nd.left);
      walk(nd.right);
    } else if (kind === 'inorder') {
      add({ [nd.id]: 'active' }, 2, `at ${nd.value}: handle everything on its left first${nd.left ? '' : ' (nothing there)'}`);
      walk(nd.left);
      visit(nd, 3, `left side done, so visit ${nd.value} now, between its two subtrees`);
      walk(nd.right);
    } else {
      add({ [nd.id]: 'active' }, 2, `at ${nd.value}: finish both subtrees before visiting it`);
      walk(nd.left);
      walk(nd.right);
      visit(nd, 4, `both subtrees of ${nd.value} are done, so visit it last`);
    }
  })(root);
  add({}, 0, `done: ${out.join(', ')}`);
  return { steps, final: state };
}

function levelOrder(state, steps, out, seen, pad, outRow) {
  const { root } = state;
  const queue = [root];
  const queueRow = () => ({
    label: 'queue (front on the left)',
    cells: pad(queue.map((q) => q.value)),
    marks: {},
    pointers: queue.length ? { front: 0, back: queue.length - 1 } : {},
  });
  const add = (marks, line, caption) => {
    const queued = Object.fromEntries(queue.map((q) => [q.id, 'queued']));
    steps.push(step(root, { ...seen, ...queued, ...marks }, line, caption, [queueRow(), outRow()]));
  };

  add({}, 0, DESCRIPTION.levelorder);
  add({}, 3, `put the root (${root.value}) in the queue`);
  while (queue.length) {
    const nd = queue.shift();
    add({ [nd.id]: 'active' }, 5, `dequeue ${nd.value} from the front`);
    out.push(nd.value);
    add({ [nd.id]: 'visit' }, 6, `visit ${nd.value}: add it to the output`);
    seen[nd.id] = 'visited';
    for (const [child, side, line] of [[nd.left, 'left', 7], [nd.right, 'right', 8]]) {
      if (!child) continue;
      queue.push(child);
      add({}, line, `enqueue its ${side} child ${child.value} at the back. It waits until everything already queued is done`);
    }
  }
  add({}, 10, `done: ${out.join(', ')}`);
  return { steps, final: state };
}

// --- interview problem: lowest common ancestor in a BST (LeetCode 235) ------

export function lca(state, p, q) {
  checkValue(p, 'p');
  checkValue(q, 'q');
  const { root } = state;
  const find = (v) => {
    let c = root;
    while (c && c.value !== v) c = v < c.value ? c.left : c.right;
    return c;
  };
  const pn = find(p);
  const qn = find(q);
  if (!pn || !qn) throw new RangeError('both p and q must already be in the tree');

  const steps = [];
  const base = { [pn.id]: 'active', [qn.id]: 'active' };
  const seen = {};
  const add = (marks, line, caption) => steps.push(step(root, { ...seen, ...base, ...marks }, line, caption));

  add({}, 0, `lca(${p}, ${q}): the lowest node that has both ${p} and ${q} in its subtree (a node counts as being in its own subtree)`);
  for (let cur = root; cur; ) {
    if (p < cur.value && q < cur.value) {
      add({ [cur.id]: 'compare' }, 3, `${p} and ${q} are both less than ${cur.value}: they are both in its left subtree, so the answer is there too`);
      seen[cur.id] = 'visited';
      cur = cur.left;
    } else if (p > cur.value && q > cur.value) {
      add({ [cur.id]: 'compare' }, 4, `${p} and ${q} are both greater than ${cur.value}: go right`);
      seen[cur.id] = 'visited';
      cur = cur.right;
    } else {
      add({ [cur.id]: 'found' }, 5,
        `at ${cur.value} the paths to ${p} and ${q} split (or one of them is ${cur.value} itself). ${cur.value} is the lowest common ancestor`);
      return { steps, final: state };
    }
  }
  throw new Error('unreachable: both values were found in the tree');
}
