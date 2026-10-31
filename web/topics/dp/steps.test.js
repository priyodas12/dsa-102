import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, fibMemo, coinChange, knapsack, lcs, programs } from './steps.js';

const state = createState();
const last = (r) => r.steps.at(-1).caption;

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    assert.ok(typeof s.meta === 'string' && s.meta.length > 0);
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) >= 0 && Number(idx) < r.cells.length, `mark ${idx} outside row ${r.label}`);
    }
  }
}

// Table cells only ever change from empty to filled, and never change once filled.
function checkMonotonic(steps) {
  const first = steps[0].rows.length;
  for (let k = 1; k < steps.length; k++) {
    steps[k].rows.forEach((row, ri) => {
      if (row.header || ri >= first) return;
      row.cells.forEach((v, ci) => {
        const before = steps[k - 1].rows[ri]?.cells[ci];
        if (before !== null && before !== undefined && row.label === steps[k - 1].rows[ri].label && row.grid) {
          assert.equal(v, before, `cell [${ri}][${ci}] changed after being filled (step ${k})`);
        }
      });
    });
  }
}

function rng(seed) {
  let x = seed;
  return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
}

test('fibMemo computes fib(n) and reuses stored answers', () => {
  const r = fibMemo(state, 7);
  assert.match(last(r), /fib\(7\) = 13\. With the memo this took 13 calls\. Plain recursion with no memo would make 41/);
  assert.ok(r.steps.some((s) => /already in the memo/.test(s.caption)));
  checkSteps(r.steps, programs.fibMemo);
});

test('fibMemo matches iteration for every n and makes 2n-1 calls (n >= 1)', () => {
  let a = 0;
  let b = 1;
  for (let n = 0; n <= 10; n++) {
    const r = fibMemo(state, n);
    checkSteps(r.steps, programs.fibMemo);
    assert.match(last(r), new RegExp(`fib\\(${n}\\) = ${a}\\.`));
    if (n >= 1) assert.match(last(r), new RegExp(`took ${2 * n - 1} calls`), `n=${n}`);
    [a, b] = [b, a + b];
  }
  assert.throws(() => fibMemo(state, 11), RangeError);
  assert.throws(() => fibMemo(state, -1), RangeError);
  assert.throws(() => fibMemo(state, 2.5), RangeError);
});

test('fibMemo call stack is balanced and never deeper than n + 1', () => {
  const r = fibMemo(state, 8);
  const depths = r.steps.map((s) => s.rows[0].cells.length);
  assert.equal(depths[0], 0);
  assert.ok(Math.max(...depths) <= 9);
  checkMonotonic(r.steps);
});

test('coinChange: greedy fails, DP finds the best', () => {
  const r = coinChange(state, '1, 5, 6', 10);
  assert.match(last(r), /fewest coins for amount 10 is 2, for example 5 \+ 5/);
  checkSteps(r.steps, programs.coinChange);
  // Unlike the other tables, a coin-change cell can improve while the coins are tried: it only ever goes down.
  const toNum = (v) => (v === '∞' ? Infinity : v);
  for (let k = 1; k < r.steps.length; k++) {
    r.steps[k].rows[1].cells.forEach((v, i) => assert.ok(toNum(v) <= toNum(r.steps[k - 1].rows[1].cells[i]), `dp[${i}] went up`));
  }
});

test('coinChange edge cases', () => {
  assert.match(last(coinChange(state, '2', 3)), /cannot be made.*Return -1/);
  assert.match(last(coinChange(state, '5', 0)), /fewest coins for amount 0 is 0/);
  assert.match(last(coinChange(state, '1', 15)), /is 15/);
  assert.match(last(coinChange(state, '7, 7', 14)), /is 2/);
  checkSteps(coinChange(state, '2', 3).steps, programs.coinChange);
  assert.throws(() => coinChange(state, '', 5), RangeError);
  assert.throws(() => coinChange(state, '0, 2', 5), RangeError);
  assert.throws(() => coinChange(state, '1 2 3 4 5', 5), RangeError);
  assert.throws(() => coinChange(state, '1', 16), RangeError);
});

test('coinChange agrees with a reference DP on random inputs', () => {
  const next = rng(11);
  for (let t = 0; t < 200; t++) {
    const coins = Array.from({ length: 1 + Math.floor(next() * 4) }, () => 1 + Math.floor(next() * 12));
    const amount = Math.floor(next() * 16);
    const ref = Array(amount + 1).fill(Infinity);
    ref[0] = 0;
    for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) ref[a] = Math.min(ref[a], ref[a - c] + 1);
    const r = coinChange(state, coins.join(' '), amount);
    checkSteps(r.steps, programs.coinChange);
    if (ref[amount] === Infinity) assert.match(last(r), /cannot be made/, `${coins} / ${amount}`);
    else {
      assert.match(last(r), new RegExp(`amount ${amount} is ${ref[amount]}\\b`), `${coins} / ${amount}`);
      const used = last(r).match(/for example ([\d +]+)\./)?.[1].split(' + ').map(Number) ?? [];
      assert.equal(used.length, ref[amount]);
      assert.equal(used.reduce((x, y) => x + y, 0), amount);
      assert.ok(used.every((u) => coins.includes(u)));
    }
  }
});

test('knapsack: the classic example', () => {
  const r = knapsack(state, '1:1, 3:4, 4:5, 5:7', 7);
  assert.match(last(r), /best value is 9, by taking item 2 and item 3/);
  checkSteps(r.steps, programs.knapsack);
  checkMonotonic(r.steps);
});

test('knapsack: nothing fits, everything fits, one item', () => {
  assert.match(last(knapsack(state, '5:10, 6:20', 4)), /best value is 0.*no item fits/);
  assert.match(last(knapsack(state, '1:2, 2:3', 10)), /best value is 5, by taking item 1 and item 2/);
  assert.match(last(knapsack(state, '3:7', 3)), /best value is 7/);
  checkSteps(knapsack(state, '5:10, 6:20', 4).steps, programs.knapsack);
});

test('knapsack rejects bad input', () => {
  assert.throws(() => knapsack(state, '', 5), RangeError);
  assert.throws(() => knapsack(state, '3-4', 5), RangeError);
  assert.throws(() => knapsack(state, '0:4', 5), RangeError);
  assert.throws(() => knapsack(state, '3:0', 5), RangeError);
  assert.throws(() => knapsack(state, '11:4', 5), RangeError);
  assert.throws(() => knapsack(state, '1:1, 1:1, 1:1, 1:1, 1:1, 1:1', 5), RangeError);
  assert.throws(() => knapsack(state, '1:1', 0), RangeError);
  assert.throws(() => knapsack(state, '1:1', 11), RangeError);
});

test('knapsack agrees with brute force over all subsets, and the traced items fit and sum to the answer', () => {
  const next = rng(23);
  for (let t = 0; t < 150; t++) {
    const items = Array.from({ length: 1 + Math.floor(next() * 5) }, () => ({ w: 1 + Math.floor(next() * 8), v: 1 + Math.floor(next() * 20) }));
    const cap = 1 + Math.floor(next() * 10);
    let best = 0;
    for (let mask = 0; mask < 1 << items.length; mask++) {
      let w = 0;
      let v = 0;
      items.forEach((it, i) => { if (mask & (1 << i)) { w += it.w; v += it.v; } });
      if (w <= cap) best = Math.max(best, v);
    }
    const r = knapsack(state, items.map((i) => `${i.w}:${i.v}`).join(' '), cap);
    checkSteps(r.steps, programs.knapsack);
    assert.match(last(r), new RegExp(`best value is ${best}\\b`), JSON.stringify({ items, cap }));
    const taken = [...last(r).matchAll(/item (\d+)/g)].map((m) => Number(m[1]) - 1);
    assert.equal(taken.reduce((s, i) => s + items[i].v, 0), best, 'traced items add up to the best value');
    assert.ok(taken.reduce((s, i) => s + items[i].w, 0) <= cap, 'traced items fit');
  }
});

test('lcs: the classic example', () => {
  const r = lcs(state, 'ABCBDA', 'BDCABA');
  assert.match(last(r), /has length 4: "[A-D]{4}"/);
  checkSteps(r.steps, programs.lcs);
  checkMonotonic(r.steps);
  assert.equal(r.steps[0].rows.length, 8); // header + 7 rows (empty prefix + 6 letters)
});

test('lcs edge cases', () => {
  assert.match(last(lcs(state, 'ABC', 'XYZ')), /length 0/);
  assert.match(last(lcs(state, 'ABC', 'ABC')), /length 3: "ABC"/);
  assert.match(last(lcs(state, 'A', 'A')), /length 1: "A"/);
  assert.match(last(lcs(state, 'AXB', 'AB')), /length 2: "AB"/);
  assert.throws(() => lcs(state, '', 'A'), RangeError);
  assert.throws(() => lcs(state, 'A', 'TOOLONG'), RangeError);
  assert.throws(() => lcs(state, 'A B', 'A'), RangeError);
});

test('lcs agrees with brute force, and the returned string is a subsequence of both', () => {
  const isSubseq = (s, t) => { let i = 0; for (const ch of t) if (ch === s[i]) i++; return i === s.length; };
  const next = rng(5);
  for (let t = 0; t < 200; t++) {
    const word = () => Array.from({ length: 1 + Math.floor(next() * 6) }, () => 'ABC'[Math.floor(next() * 3)]).join('');
    const a = word();
    const b = word();
    let best = 0;
    for (let mask = 0; mask < 1 << a.length; mask++) {
      const sub = [...a].filter((_, i) => mask & (1 << i)).join('');
      if (sub.length > best && isSubseq(sub, b)) best = sub.length;
    }
    const r = lcs(state, a, b);
    checkSteps(r.steps, programs.lcs);
    assert.match(last(r), new RegExp(`has length ${best}\\b`), `${a} / ${b}`);
    const word2 = last(r).match(/: "(\w+)"/)?.[1] ?? '';
    assert.equal(word2.length, best);
    assert.ok(isSubseq(word2, a) && isSubseq(word2, b), `${word2} must be a subsequence of both`);
  }
});

test('operations do not change the (unused) state', () => {
  const s = createState();
  assert.equal(fibMemo(s, 5).final, s);
  assert.equal(lcs(s, 'AB', 'BA').final, s);
});
