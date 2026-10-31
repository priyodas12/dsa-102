// Pure step generators for the dynamic programming topic. Each operation is one classic problem.
//
// State: { } is unused (the topic is only about the tables), kept so every topic has the same shape.
// Step: { rows, caption, line, size, meta }. Tables are rows with `grid: true`; a `header` row labels
// the columns. A table fills in cell by cell: an empty (null) cell has not been solved yet.
// Every operation returns { steps, final }.

export const programs = {
  fibMemo: [
    'long fib(int n, long[] memo) {',
    '  if (n <= 1) return n; // base cases',
    '  if (memo[n] != 0) return memo[n]; // already solved: reuse it',
    '  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);',
    '  return memo[n];',
    '}',
  ],
  coinChange: [
    'int coinChange(int[] coins, int amount) {',
    '  int[] dp = new int[amount + 1]; // dp[a] = fewest coins that make amount a',
    '  Arrays.fill(dp, INF); dp[0] = 0; // zero coins make amount 0',
    '  for (int a = 1; a <= amount; a++) {',
    '    for (int coin : coins) {',
    '      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;',
    '    }',
    '  }',
    '  return dp[amount] >= INF ? -1 : dp[amount];',
    '}',
  ],
  knapsack: [
    'int knapsack(int[] w, int[] v, int cap) {',
    '  int[][] dp = new int[w.length + 1][cap + 1]; // dp[i][c] = best value using the first i items with capacity c',
    '  for (int i = 1; i <= w.length; i++) {',
    '    for (int c = 0; c <= cap; c++) {',
    '      dp[i][c] = dp[i - 1][c]; // option 1: skip item i',
    '      if (w[i - 1] <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w[i - 1]] + v[i - 1]); // option 2: take it',
    '    }',
    '  }',
    '  return dp[w.length][cap];',
    '}',
  ],
  lcs: [
    'int lcs(String a, String b) {',
    '  int[][] dp = new int[a.length() + 1][b.length() + 1]; // dp[i][j] = LCS of the first i chars of a and the first j of b',
    '  for (int i = 1; i <= a.length(); i++) {',
    '    for (int j = 1; j <= b.length(); j++) {',
    '      if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1; // match: extend the diagonal',
    '      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);                     // no match: skip one character',
    '    }',
    '  }',
    '  return dp[a.length()][b.length()];',
    '}',
  ],
};

export const createState = () => ({});

// --- helpers ---------------------------------------------------------------

function checkInt(v, what, lo, hi) {
  if (!Number.isInteger(v) || v < lo || v > hi) throw new RangeError(`${what} must be a whole number from ${lo} to ${hi}`);
}

function parseList(text, { max, lo, hi, what }) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError(`enter some ${what}, for example 1, 5, 6`);
  if (parts.length > max) throw new RangeError(`enter at most ${max} ${what}`);
  return parts.map((p) => {
    const v = Number(p);
    checkInt(v, `"${p}"`, lo, hi);
    return v;
  });
}

function parseWord(text, what) {
  const s = String(text).trim();
  if (!/^[A-Za-z0-9]{1,6}$/.test(s)) throw new RangeError(`${what} must be 1 to 6 letters or digits`);
  return s;
}

// A table row. null cells are empty (not solved yet). marks: { columnIndex: kind }.
export const gridRow = (label, cells, marks = {}) => ({ label, grid: true, cells, marks, pointers: {} });
export const headerRow = (label, cells) => ({ label, grid: true, header: true, cells, marks: {}, pointers: {} });

const show = (v) => (v === Infinity ? '∞' : v);

// --- top-down: Fibonacci with memoization ------------------------------------------

function naiveCalls(n) {
  const calls = [1, 1];
  for (let i = 2; i <= n; i++) calls[i] = 1 + calls[i - 1] + calls[i - 2];
  return calls[n];
}

export function fibMemo(state, n) {
  checkInt(n, 'n', 0, 10);
  const memo = Array(n + 1).fill(null);
  memo[0] = 0;
  if (n >= 1) memo[1] = 1;
  const stack = [];
  let calls = 0;
  const steps = [];
  const add = (marks, line, caption) => {
    steps.push({
      rows: [
        { label: 'call stack (newest on the right)', cells: stack.slice(), marks: {}, pointers: stack.length ? { top: stack.length - 1 } : {} },
        headerRow('n', Array.from({ length: n + 1 }, (_, i) => i)),
        gridRow('memo: fib(n)', memo.slice(), marks),
      ],
      line,
      caption,
      size: n + 1,
      meta: `calls ${calls} · solved ${memo.filter((v) => v !== null).length} of ${n + 1}`,
    });
  };

  function fib(k) {
    calls++;
    stack.push(`fib(${k})`);
    add({ [k]: 'active' }, 0, `call fib(${k})`);
    let result;
    if (k <= 1) {
      add({ [k]: 'keep' }, 1, `fib(${k}) is a base case: it is just ${k}`);
      result = k;
    } else if (memo[k] !== null) {
      add({ [k]: 'found' }, 2, `fib(${k}) is already in the memo: reuse ${memo[k]} instantly. No recursion, so no repeated work`);
      result = memo[k];
    } else {
      add({ [k]: 'active' }, 3, `fib(${k}) is not in the memo yet: it needs fib(${k - 1}) + fib(${k - 2})`);
      const a = fib(k - 1);
      const b = fib(k - 2);
      memo[k] = a + b;
      add({ [k]: 'new' }, 3, `fib(${k - 1}) = ${a} and fib(${k - 2}) = ${b}, so fib(${k}) = ${a + b}. Store it in the memo so it is never computed again`);
      result = memo[k];
    }
    stack.pop();
    return result;
  }

  add({}, 0, `fib(${n}): each value is the sum of the previous two. The subproblems overlap (fib(${Math.max(n - 2, 0)}) is needed both by fib(${n - 1}) and fib(${n})), so remember each answer in a memo table`);
  const value = fib(n);
  add({ [n]: 'found' }, 4, `fib(${n}) = ${value}. With the memo this took ${calls} calls. Plain recursion with no memo would make ${naiveCalls(n)}`);
  return { steps, final: state };
}

// --- bottom-up, 1D table: fewest coins (LeetCode 322) ----------------------------------

export function coinChange(state, coinsText, amount) {
  const coins = parseList(coinsText, { max: 4, lo: 1, hi: 20, what: 'coin values' });
  checkInt(amount, 'amount', 0, 15);
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const pick = Array(amount + 1).fill(null);
  const steps = [];
  const add = (marks, line, caption) =>
    steps.push({
      rows: [headerRow('amount', Array.from({ length: amount + 1 }, (_, i) => i)), gridRow('fewest coins', dp.map(show), marks)],
      line,
      caption,
      size: amount + 1,
      meta: `coins ${coins.join(', ')} · amount ${amount}`,
    });

  add({}, 0, `coinChange: the fewest coins from {${coins.join(', ')}} that add up to ${amount}. Solve every smaller amount first, and build each answer from smaller ones`);
  add({ 0: 'keep' }, 2, 'dp[0] = 0: zero coins make amount 0. Every other amount starts as ∞ (not reachable yet)');
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin > a) {
        add({ [a]: 'active' }, 5, `amount ${a}, coin ${coin}: the coin is bigger than ${a}, so it cannot be used`);
        continue;
      }
      const prior = dp[a - coin];
      if (prior === Infinity) {
        add({ [a]: 'active', [a - coin]: 'compare' }, 5, `amount ${a}, coin ${coin}: that leaves ${a - coin}, which cannot be made (∞), so this coin does not help`);
        continue;
      }
      const candidate = prior + 1;
      if (candidate < dp[a]) {
        const old = dp[a];
        dp[a] = candidate;
        pick[a] = coin;
        add({ [a]: 'new', [a - coin]: 'compare' }, 5, `amount ${a}, coin ${coin}: dp[${a - coin}] + 1 = ${prior} + 1 = ${candidate}, better than ${show(old)}. dp[${a}] = ${candidate}`);
      } else {
        add({ [a]: 'active', [a - coin]: 'compare' }, 5, `amount ${a}, coin ${coin}: dp[${a - coin}] + 1 = ${candidate}, not better than ${dp[a]}. Keep ${dp[a]}`);
      }
    }
  }
  if (dp[amount] === Infinity) {
    add({}, 8, `the table is full: amount ${amount} cannot be made from these coins. Return -1`);
  } else {
    const used = [];
    const path = {};
    for (let a = amount; a > 0; a -= pick[a]) {
      path[a] = 'found';
      used.push(pick[a]);
    }
    path[0] = 'found';
    add(path, 8, `the table is full: the fewest coins for amount ${amount} is ${dp[amount]}${used.length ? `, for example ${used.join(' + ')}` : ''}. Following the green cells back shows which coins were used`);
  }
  return { steps, final: state };
}

// --- bottom-up, 2D table: 0/1 knapsack ----------------------------------------------------

function parseItems(text) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter items as weight:value, for example 1:1, 3:4, 4:5');
  if (parts.length > 5) throw new RangeError('enter at most 5 items');
  return parts.map((p) => {
    const m = /^(\d+):(\d+)$/.exec(p);
    if (!m) throw new RangeError(`"${p}" is not weight:value, for example 3:4`);
    const [w, v] = [Number(m[1]), Number(m[2])];
    checkInt(w, `weight in "${p}"`, 1, 10);
    checkInt(v, `value in "${p}"`, 1, 99);
    return { w, v };
  });
}

export function knapsack(state, itemsText, cap) {
  const items = parseItems(itemsText);
  checkInt(cap, 'capacity', 1, 10);
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(null));
  dp[0].fill(0);
  const steps = [];
  const add = (marks, line, caption) =>
    steps.push({
      rows: [
        headerRow('capacity', Array.from({ length: cap + 1 }, (_, c) => c)),
        ...dp.map((cells, i) => gridRow(i === 0 ? 'no items' : `item ${i} (w${items[i - 1].w}, v${items[i - 1].v})`, cells.slice(), marks[i] ?? {})),
      ],
      line,
      caption,
      size: (n + 1) * (cap + 1),
      meta: `${n} items · capacity ${cap}`,
    });
  const put = add;

  put({}, 0, `knapsack: pick items to get the most value without going over weight ${cap}. Each item is taken once or not at all. dp[i][c] is the best value using only the first i items with capacity c`);
  put({ 0: Object.fromEntries(Array.from({ length: cap + 1 }, (_, c) => [c, 'keep'])) }, 1, 'with no items the best value is 0 at every capacity, so row 0 is all zeros');
  for (let i = 1; i <= n; i++) {
    const { w, v } = items[i - 1];
    for (let c = 0; c <= cap; c++) {
      const skip = dp[i - 1][c];
      if (w > c) {
        dp[i][c] = skip;
        put({ [i]: { [c]: 'new' }, [i - 1]: { [c]: 'compare' } }, 4, `item ${i} weighs ${w}, more than capacity ${c}: it cannot be taken. Copy ${skip} from above`);
        continue;
      }
      const take = v + dp[i - 1][c - w];
      dp[i][c] = Math.max(skip, take);
      put({ [i]: { [c]: 'new' }, [i - 1]: { [c]: 'compare', [c - w]: 'compare' } }, 5,
        `capacity ${c}: skip item ${i} = ${skip} (above), or take it = ${v} + dp[${i - 1}][${c - w}] (${dp[i - 1][c - w]}) = ${take}. Best: ${dp[i][c]}`);
    }
  }
  const taken = [];
  const path = {};
  let c = cap;
  for (let i = n; i >= 1; i--) {
    path[i] = { [c]: 'found' };
    if (dp[i][c] !== dp[i - 1][c]) {
      taken.unshift(i);
      c -= items[i - 1].w;
    }
  }
  path[0] = { [c]: 'found' };
  put(path, 8, `the table is full: the best value is ${dp[n][cap]}${taken.length ? `, by taking ${taken.map((i) => `item ${i}`).join(' and ')}` : ' (no item fits)'}. The green cells trace the choices back from the corner`);
  return { steps, final: state };
}

// --- bottom-up, 2D table: longest common subsequence (LeetCode 1143) ---------------------------

export function lcs(state, firstText, secondText) {
  const a = parseWord(firstText, 'first');
  const b = parseWord(secondText, 'second');
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
  dp[0].fill(0);
  for (let i = 1; i <= m; i++) dp[i][0] = 0;
  const steps = [];
  let marks = {};
  const add = (line, caption) =>
    steps.push({
      rows: [
        headerRow(`${a} vs ${b}`, ['∅', ...b]),
        ...dp.map((cells, i) => gridRow(i === 0 ? '∅' : a[i - 1], cells.slice(), marks[i] ?? {})),
      ],
      line,
      caption,
      size: (m + 1) * (n + 1),
      meta: `${m} × ${n} characters`,
    });
  const put = (m2, line, caption) => { marks = m2; add(line, caption); };

  put({}, 0, `lcs("${a}", "${b}"): the longest sequence of characters that appears in both, in order but not necessarily next to each other. dp[i][j] is the answer for the first i letters of "${a}" and the first j of "${b}"`);
  put({}, 1, 'an empty string has nothing in common with anything, so the first row and column are 0');
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        put({ [i]: { [j]: 'new' }, [i - 1]: { [j - 1]: 'compare' } }, 4,
          `'${a[i - 1]}' = '${b[j - 1]}': a match. Extend the best answer for both strings without these letters (the diagonal, ${dp[i - 1][j - 1]}) by one: ${dp[i][j]}`);
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        put({ [i]: { [j]: 'new', [j - 1]: 'compare' }, [i - 1]: { [j]: 'compare' } }, 5,
          `'${a[i - 1]}' ≠ '${b[j - 1]}': no match. Drop one letter: ${dp[i - 1][j]} (above, without '${a[i - 1]}') or ${dp[i][j - 1]} (left, without '${b[j - 1]}'). Take the larger: ${dp[i][j]}`);
      }
    }
  }
  const letters = [];
  const path = {};
  for (let i = m, j = n; i > 0 && j > 0;) {
    if (a[i - 1] === b[j - 1]) {
      letters.unshift(a[i - 1]);
      path[i] = { ...path[i], [j]: 'found' };
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  put(path, 8, `the table is full: the longest common subsequence has length ${dp[m][n]}${letters.length ? `: "${letters.join('')}"` : ''}. The green cells are the matches found by walking back from the corner`);
  return { steps, final: state };
}
