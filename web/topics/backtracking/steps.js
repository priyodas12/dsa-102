// Pure step generators for the backtracking topic. Each operation explores a decision tree depth first:
// choose, explore, then undo the choice (backtrack) and try the next one.
//
// State: { } is unused, kept so every topic has the same shape.
// Tree problems: step.search = { root, marks } where a node is { id, label, edge, children } and `edge`
// names the choice that led to it. The tree grows as the search discovers it, so you see exactly what has
// been explored. marks: 'active' (the node being worked on), 'path' (its ancestors), 'visited' (finished),
// 'found' (a solution), 'removed' (pruned: cut off without exploring).
// N-Queens uses a board instead. Every step: { rows, caption, line, size, meta }.
// Every operation returns { steps, final }.

export const programs = {
  subsets: [
    'void subsets(int[] nums, int i, List<Integer> path, List<List<Integer>> out) {',
    '  if (i == nums.length) { out.add(new ArrayList<>(path)); return; } // decided about every number',
    '  subsets(nums, i + 1, path, out);  // choice 1: leave nums[i] out',
    '  path.add(nums[i]);                // choice 2: take nums[i]',
    '  subsets(nums, i + 1, path, out);',
    '  path.remove(path.size() - 1);     // undo the choice (backtrack)',
    '}',
  ],
  permutations: [
    'void permute(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> out) {',
    '  if (path.size() == nums.length) { out.add(new ArrayList<>(path)); return; }',
    '  for (int i = 0; i < nums.length; i++) {',
    '    if (used[i]) continue;                         // already in the path',
    '    used[i] = true; path.add(nums[i]);             // choose',
    '    permute(nums, used, path, out);                // explore',
    '    used[i] = false; path.remove(path.size() - 1); // un-choose (backtrack)',
    '  }',
    '}',
  ],
  parentheses: [
    'void generate(int open, int close, int n, String path, List<String> out) {',
    '  if (path.length() == 2 * n) { out.add(path); return; }',
    '  if (open < n) generate(open + 1, close, n, path + "(", out);     // can still open a bracket',
    '  if (close < open) generate(open, close + 1, n, path + ")", out); // can only close one that is open',
    '}',
  ],
  nQueens: [
    'void solve(int row, int[] cols, List<int[]> out) {',
    '  if (row == n) { out.add(cols.clone()); return; } // every row has a queen',
    '  for (int c = 0; c < n; c++) {',
    '    if (!safe(row, c, cols)) continue; // same column or diagonal as a queen above',
    '    cols[row] = c;                     // place a queen',
    '    solve(row + 1, cols, out);         // explore the next row',
    '  } // finishing the iteration removes the queen again (backtrack)',
    '}',
  ],
};

export const createState = () => ({});

// --- helpers ---------------------------------------------------------------

function checkInt(v, what, lo, hi) {
  if (!Number.isInteger(v) || v < lo || v > hi) throw new RangeError(`${what} must be a whole number from ${lo} to ${hi}`);
}

function parseDistinct(text, max) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter some numbers, for example 1, 2, 3');
  if (parts.length > max) throw new RangeError(`enter at most ${max} numbers (the number of results grows very fast)`);
  const nums = parts.map((p) => {
    const v = Number(p);
    checkInt(v, `"${p}"`, -9, 99);
    return v;
  });
  if (new Set(nums).size !== nums.length) throw new RangeError('the numbers must all be different');
  return nums;
}

const tagsRow = (label, cells) => ({ label, tags: true, cells, marks: {}, pointers: {} });

// A decision tree that grows as the search discovers it, plus the bookkeeping every tree step needs.
function session({ pathLabel, resultLabel = 'results so far' }) {
  let nextId = 0;
  const root = { id: nextId++, label: '', edge: '', children: [] };
  const stack = []; // ancestors of the node being worked on
  const done = new Set();
  const pruned = new Set();
  const results = [];
  const steps = [];
  let count = 1;
  let path = [];

  const copy = (n) => ({ id: n.id, label: n.label, edge: n.edge, children: n.children.map(copy) });
  const add = (extra, line, caption) => {
    const marks = {};
    for (const id of done) marks[id] = 'visited';
    for (const id of stack) marks[id] = 'path';
    for (const id of pruned) marks[id] = 'removed';
    steps.push({
      search: { root: copy(root), marks: { ...marks, ...extra } },
      rows: [tagsRow('current path', path.length ? path.map(String) : ['(empty)']), tagsRow(resultLabel, results.map(String))],
      line,
      caption,
      size: count,
      meta: `nodes ${count} · results ${results.length}`,
    });
  };
  const child = (parent, label, edge) => {
    const node = { id: nextId++, label, edge, children: [] };
    parent.children.push(node);
    count++;
    return node;
  };
  return {
    root, steps, results, add, child, pruned, done, stack,
    setPath: (p) => { path = p; },
    label: pathLabel,
  };
}

// --- subsets: a binary decision tree (leave out / take) --------------------------------

export function subsets(state, numbersText) {
  const nums = parseDistinct(numbersText, 4);
  const n = nums.length;
  const s = session({ pathLabel: (p) => `{${p.join(',')}}` });
  const path = [];
  s.root.label = '{}';

  function rec(i, node) {
    s.stack.push(node.id);
    s.setPath(path.slice());
    if (i === n) {
      s.results.push(s.label(path));
      s.add({ [node.id]: 'found' }, 1, `all ${n} numbers are decided: record ${s.label(path)} as one subset`);
    } else {
      s.add({ [node.id]: 'active' }, 0, `at ${s.label(path)}: decide about ${nums[i]}. First choice: leave it out`);
      const skip = s.child(node, s.label(path), `skip ${nums[i]}`);
      rec(i + 1, skip);
      s.setPath(path.slice());
      s.add({ [node.id]: 'active' }, 3, `back at ${s.label(path)}: that whole branch is finished. Second choice: take ${nums[i]}, path.add(${nums[i]})`);
      path.push(nums[i]);
      const take = s.child(node, s.label(path), `take ${nums[i]}`);
      rec(i + 1, take);
      path.pop();
      s.setPath(path.slice());
      s.add({ [node.id]: 'active' }, 5, `both choices for ${nums[i]} are explored. Undo: path.remove(${nums[i]}) takes it out again, so the path is back to ${s.label(path)} (backtrack)`);
    }
    s.stack.pop();
    s.done.add(node.id);
  }

  s.add({ [s.root.id]: 'active' }, 0, `subsets of {${nums.join(', ')}}: for each number there are two choices, leave it out or take it. The tree has one level per number`);
  rec(0, s.root);
  s.stack.length = 0;
  s.setPath([]);
  s.add({}, 6, `done: ${s.results.length} subsets = 2^${n}. Every leaf is one complete set of choices, and no subset was missed or repeated`);
  return { steps: s.steps, final: state };
}

// --- permutations: a tree with up to n children per node ----------------------------------

export function permutations(state, numbersText) {
  const nums = parseDistinct(numbersText, 3);
  const n = nums.length;
  const s = session({ pathLabel: (p) => `[${p.join(',')}]` });
  const path = [];
  const used = Array(n).fill(false);
  s.root.label = '[]';

  function rec(node, how) {
    s.stack.push(node.id);
    s.setPath(path.slice());
    if (path.length === n) {
      s.results.push(s.label(path));
      s.add({ [node.id]: 'found' }, 1, `the path has all ${n} numbers: record ${s.label(path)} as one permutation`);
    } else {
      s.add({ [node.id]: 'active' }, how === null ? 0 : 4, how === null
        ? `permutations of [${nums.join(', ')}]: fill each position with a number that is not used yet`
        : `${how}. Path is ${s.label(path)}: fill the next position`);
      for (let i = 0; i < n; i++) {
        if (used[i]) {
          s.add({ [node.id]: 'active' }, 3, `${nums[i]} is already in the path, so skip it`);
          continue;
        }
        used[i] = true;
        path.push(nums[i]);
        const next = s.child(node, s.label(path), String(nums[i]));
        rec(next, `choose ${nums[i]}`);
        path.pop();
        used[i] = false;
        s.setPath(path.slice());
        s.add({ [node.id]: 'active' }, 6, `un-choose ${nums[i]}: it is free again and the path is back to ${s.label(path)} (backtrack). Try the next number`);
      }
    }
    s.stack.pop();
    s.done.add(node.id);
  }

  rec(s.root, null);
  s.stack.length = 0;
  s.setPath([]);
  const factorial = Array.from({ length: n }, (_, i) => i + 1).reduce((x, y) => x * y, 1);
  s.add({}, 8, `done: ${s.results.length} permutations = ${n}! = ${factorial}. The number of results multiplies at every level, which is why backtracking gets slow quickly`);
  return { steps: s.steps, final: state };
}

// --- generate parentheses: pruning invalid choices early (LeetCode 22) ------------------------

const catalan = (n) => Array.from({ length: n }, (_, i) => i + 1).reduce((c, k) => (c * 2 * (2 * k - 1)) / (k + 1), 1);

export function parentheses(state, n) {
  checkInt(n, 'n', 1, 3);
  const s = session({ pathLabel: (p) => p.join('') });
  s.root.label = '∅';

  function rec(node, open, close, text, how) {
    s.stack.push(node.id);
    s.setPath(text ? [...text] : []);
    if (text.length === 2 * n) {
      s.results.push(text);
      s.add({ [node.id]: 'found' }, 1, `"${text}" has ${n} pairs and every ")" matched a "(": record it`);
    } else {
      s.add({ [node.id]: 'active' }, 0, `${how}${text ? ` Path "${text}"` : 'Path is empty'}: ${open} of ${n} "(" used, ${close} ")" used`);
      if (open < n) {
        rec(s.child(node, `${text}(`, '('), open + 1, close, `${text}(`, 'Added "(".');
        s.setPath([...text]);
        s.add({ [node.id]: 'active' }, 3, `back at "${text || '∅'}": the "(" branch is finished. Now consider adding ")"`);
      } else {
        const cut = s.child(node, `${text}(`, '(');
        s.pruned.add(cut.id);
        s.add({ [node.id]: 'active' }, 2, `open = ${open} = n: all ${n} "(" are used, so adding another is illegal. This branch is pruned: nothing below it is ever explored`);
      }
      if (close < open) {
        rec(s.child(node, `${text})`, ')'), open, close + 1, `${text})`, 'Added ")".');
        s.setPath([...text]);
        s.add({ [node.id]: 'active' }, 3, `back at "${text || '∅'}": both choices are explored`);
      } else {
        const cut = s.child(node, `${text})`, ')');
        s.pruned.add(cut.id);
        s.add({ [node.id]: 'active' }, 3, `close = ${close} equals open = ${open}: a ")" now would close nothing, so the string could never be valid. Pruned, including every string that would start this way`);
      }
    }
    s.stack.pop();
    s.done.add(node.id);
  }

  s.add({ [s.root.id]: 'active' }, 0, `generate(${n}): all well-formed strings with ${n} pair${n === 1 ? '' : 's'} of brackets. At each step we can add "(" or ")", but only if the result can still become valid`);
  rec(s.root, 0, 0, '', 'Start.');
  s.stack.length = 0;
  s.setPath([]);
  s.add({}, 4, `done: ${s.results.length} valid strings (the Catalan number ${catalan(n)}). The search looked at ${s.steps.at(-1).size} nodes, while checking every one of the ${2 ** (2 * n)} possible strings of "(" and ")" would have been brute force`);
  return { steps: s.steps, final: state };
}

// --- N-Queens: backtracking on a board (LeetCode 51) ----------------------------------------------

export function nQueens(state, n) {
  checkInt(n, 'n', 1, 5);
  const cols = Array(n).fill(-1);
  const solutions = [];
  const steps = [];
  let placements = 0;

  const add = (marks, line, caption) => {
    steps.push({
      rows: [
        { label: 'column', grid: true, header: true, cells: Array.from({ length: n }, (_, c) => c), marks: {}, pointers: {} },
        ...Array.from({ length: n }, (_, r) => ({
          label: `row ${r}`, grid: true, cells: Array.from({ length: n }, (_, c) => (cols[r] === c ? '♛' : '')), marks: marks[r] ?? {}, pointers: {},
        })),
        tagsRow('solutions found', solutions.map((sol) => sol.join(' '))),
      ],
      line,
      caption,
      size: n * n,
      meta: `queens placed ${placements} · solutions ${solutions.length}`,
    });
  };
  const conflict = (r, c) => {
    for (let r2 = 0; r2 < r; r2++) {
      if (cols[r2] === c) return { r2, why: `column ${c} already has a queen (row ${r2})` };
      if (Math.abs(cols[r2] - c) === r - r2) return { r2, why: `it shares a diagonal with the queen at row ${r2}, column ${cols[r2]}` };
    }
    return null;
  };

  function solve(r) {
    if (r === n) {
      solutions.push(cols.slice());
      add(Object.fromEntries(cols.map((c, row) => [row, { [c]: 'found' }])), 1, `all ${n} rows have a queen and none attack each other: solution ${solutions.length} is columns ${cols.join(' ')}`);
      return;
    }
    let placed = false;
    for (let c = 0; c < n; c++) {
      const bad = conflict(r, c);
      if (bad) {
        add({ [r]: { [c]: 'error' }, [bad.r2]: { [cols[bad.r2]]: 'error' } }, 3, `row ${r}, column ${c}: unsafe, ${bad.why}. Skip it`);
        continue;
      }
      placed = true;
      cols[r] = c;
      placements++;
      add({ [r]: { [c]: 'new' } }, 4, `row ${r}, column ${c}: safe. Place a queen and move on to row ${r + 1}`);
      solve(r + 1);
      cols[r] = -1;
      add({ [r]: { [c]: 'removed' } }, 6, `back at row ${r}: remove the queen from column ${c} (backtrack) and try the next column`);
    }
    if (!placed) {
      add({}, 6, `row ${r}: no column is safe, a dead end. Return to row ${r - 1} and move its queen`);
    }
  }

  add({}, 0, `${n} queens on a ${n} × ${n} board with none attacking another (same row, column or diagonal). Place one queen per row, top to bottom, and back up when stuck`);
  solve(0);
  add({}, 7, `done: ${solutions.length} solution${solutions.length === 1 ? '' : 's'} for ${n} queens${n === 1 ? '' : n < 4 ? ': there is no way to place them' : ''}. ${placements} queens were placed along the way, far fewer than the ${n ** n} ways to put one in each row`);
  return { steps, final: state };
}
