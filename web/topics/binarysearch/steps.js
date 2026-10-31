// Pure step generators for the binary search topic. Each operation is one classic problem.
//
// State: { values } is only the array shown before anything runs; no operation changes it.
// Step: { rows, caption, line, size, probes }. The window [lo, hi] is what is still in play; cells
// outside it are faded. `probes` counts how many middle elements have been looked at so far.
// Every operation returns { steps, final }.

export const programs = {
  search: [
    'int binarySearch(int[] a, int target) {',
    '  int lo = 0, hi = a.length - 1;',
    '  while (lo <= hi) {',
    '    int mid = lo + (hi - lo) / 2; // not (lo + hi) / 2: that can overflow',
    '    if (a[mid] == target) return mid;',
    '    if (a[mid] < target) lo = mid + 1; // the target is in the right half',
    '    else hi = mid - 1;                 // the target is in the left half',
    '  }',
    '  return -1;',
    '}',
  ],
  lowerBound: [
    'int lowerBound(int[] a, int target) {',
    '  int lo = 0, hi = a.length; // hi is one past the end: the answer can be a.length',
    '  while (lo < hi) {',
    '    int mid = lo + (hi - lo) / 2;',
    '    if (a[mid] < target) lo = mid + 1; // everything up to mid is too small',
    '    else hi = mid;                     // mid might be the answer: keep it',
    '  }',
    '  return lo; // the first index whose value is >= target',
    '}',
  ],
  rotated: [
    'int searchRotated(int[] a, int target) {',
    '  int lo = 0, hi = a.length - 1;',
    '  while (lo <= hi) {',
    '    int mid = lo + (hi - lo) / 2;',
    '    if (a[mid] == target) return mid;',
    '    if (a[lo] <= a[mid]) { // the left half is sorted',
    '      if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;',
    '    } else {               // the right half is sorted',
    '      if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;',
    '    }',
    '  }',
    '  return -1;',
    '}',
  ],
  sqrt: [
    'int mySqrt(int x) {',
    '  int lo = 0, hi = x, ans = 0;',
    '  while (lo <= hi) {',
    '    int mid = lo + (hi - lo) / 2;',
    '    if ((long) mid * mid <= x) { ans = mid; lo = mid + 1; } // mid works: try a bigger one',
    '    else hi = mid - 1;                                      // too big: try a smaller one',
    '  }',
    '  return ans;',
    '}',
  ],
};

export const createState = (values = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]) => ({ values });

// --- helpers ---------------------------------------------------------------

function checkNumber(v, what, lo = -99, hi = 999) {
  if (!Number.isInteger(v) || v < lo || v > hi) throw new RangeError(`${what} must be a whole number from ${lo} to ${hi}`);
}

export function parseNumbers(text, { max = 16, sorted = false } = {}) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter some numbers, for example 2, 5, 8, 12');
  if (parts.length > max) throw new RangeError(`enter at most ${max} numbers`);
  const values = parts.map((p) => {
    const v = Number(p);
    checkNumber(v, `"${p}"`);
    return v;
  });
  if (sorted && values.some((v, i) => i > 0 && v < values[i - 1])) {
    throw new RangeError('the numbers must be in sorted (non-decreasing) order for binary search');
  }
  return values;
}

// The array shown as one row; indices outside the window [lo, hi] are faded.
function recorder(cells, n) {
  const steps = [];
  let probes = 0;
  const add = (lo, hi, mid, marks, line, caption, { rows = [] } = {}) => {
    const live = lo <= hi;
    const dim = cells.map((_, i) => i).filter((i) => !live || i < lo || i > hi);
    const pointers = live ? { lo, hi, ...(mid === null ? {} : { mid }) } : {};
    steps.push({ rows: [{ label: 'array', cells, marks, pointers, dim }, ...rows], line, caption, size: n, probes });
  };
  return { steps, add, probe: () => { probes++; return probes; }, count: () => probes };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const midOf = (lo, hi) => lo + Math.floor((hi - lo) / 2);

// --- classic: find a target in a sorted array --------------------------------------

export function search(state, numbersText, target) {
  const a = parseNumbers(numbersText, { sorted: true });
  checkNumber(target, 'target');
  const n = a.length;
  const { steps, add, probe } = recorder(a, n);

  let lo = 0;
  let hi = n - 1;
  add(lo, hi, null, {}, 0, `binarySearch(${target}): the array is sorted, so looking at the middle element tells us which half the target must be in. The other half can be thrown away`);
  add(lo, hi, null, {}, 1, `the window is the whole array: ${plural(n, 'element')}`);
  while (lo <= hi) {
    const mid = midOf(lo, hi);
    const probes = probe();
    add(lo, hi, mid, { [mid]: 'compare' }, 3, `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. Look at a[${mid}] = ${a[mid]}`);
    if (a[mid] === target) {
      add(lo, hi, mid, { [mid]: 'found' }, 4, `${a[mid]} equals ${target}: found ${target} at index ${mid} after ${plural(probes, 'probe')}. Linear search could have needed up to ${n}`);
      return { steps, final: state };
    }
    if (a[mid] < target) {
      const dropped = mid - lo + 1;
      lo = mid + 1;
      add(lo, hi, null, { [mid]: 'removed' }, 5,
        `${a[mid]} < ${target}: the target can only be to the right (everything left of it is even smaller). Discard ${plural(dropped, 'element')}: lo = ${lo}. ${plural(Math.max(hi - lo + 1, 0), 'element')} left`);
    } else {
      const dropped = hi - mid + 1;
      hi = mid - 1;
      add(lo, hi, null, { [mid]: 'removed' }, 6,
        `${a[mid]} > ${target}: the target can only be to the left (everything right of it is even bigger). Discard ${plural(dropped, 'element')}: hi = ${hi}. ${plural(Math.max(hi - lo + 1, 0), 'element')} left`);
    }
  }
  add(lo, hi, null, {}, 8, `lo (${lo}) passed hi (${hi}): the window is empty, so ${target} is not in the array. Return -1 after ${plural(steps.at(-1).probes, 'probe')}`);
  return { steps, final: state };
}

// --- variant: first index whose value is >= target (lower bound) ---------------------

export function lowerBound(state, numbersText, target) {
  const a = parseNumbers(numbersText, { sorted: true });
  checkNumber(target, 'target');
  const n = a.length;
  const cells = [...a, null]; // one extra empty slot: the answer can be "past the end"
  const { steps, add, probe } = recorder(cells, n);

  let lo = 0;
  let hi = n;
  add(lo, hi, null, {}, 0, `lowerBound(${target}): the first index whose value is at least ${target}. With duplicates it finds the FIRST one, and it works even when ${target} is missing`);
  add(lo, hi, null, {}, 1, `hi starts one past the end (index ${n}), because if every value is smaller than ${target} the answer is ${n}`);
  while (lo < hi) {
    const mid = midOf(lo, hi);
    probe();
    add(lo, hi, mid, { [mid]: 'compare' }, 3, `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. Look at a[${mid}] = ${a[mid]}`);
    if (a[mid] < target) {
      lo = mid + 1;
      add(lo, hi, null, { [mid]: 'removed' }, 4, `${a[mid]} < ${target}: too small, and so is everything to its left. lo = ${lo}`);
    } else {
      hi = mid;
      add(lo, hi, null, { [mid]: 'keep' }, 5, `${a[mid]} ≥ ${target}: mid could be the answer, or the answer could be further left. Keep it as a candidate: hi = ${mid}`);
    }
  }
  const found = lo < n && a[lo] === target;
  add(lo, hi, null, lo < n ? { [lo]: found ? 'found' : 'keep' } : {}, 7,
    `lo = hi = ${lo}: the first index whose value is ≥ ${target} is ${lo}. ${lo === n ? `Every value is smaller, so ${target} would go at the end.` : found ? `a[${lo}] = ${target}, the first occurrence.` : `a[${lo}] = ${a[lo]}, so ${target} is not present, and would be inserted here.`}`);
  return { steps, final: state };
}

// --- variant: search in a rotated sorted array (LeetCode 33) -------------------------

function parseRotated(text) {
  const a = parseNumbers(text);
  const descents = a.filter((v, i) => i > 0 && v < a[i - 1]).length;
  if (new Set(a).size !== a.length) throw new RangeError('the numbers must all be different');
  if (descents > 1 || (descents === 1 && a.at(-1) > a[0])) {
    throw new RangeError('the numbers must be a sorted list that has been rotated, for example 4, 5, 6, 7, 0, 1, 2');
  }
  return a;
}

export function rotated(state, numbersText, target) {
  const a = parseRotated(numbersText);
  checkNumber(target, 'target');
  const n = a.length;
  const { steps, add, probe } = recorder(a, n);

  let lo = 0;
  let hi = n - 1;
  add(lo, hi, null, {}, 0, `searchRotated(${target}): the array was sorted and then rotated, so it is two sorted runs glued together. It is not sorted overall, yet binary search still works`);
  add(lo, hi, null, {}, 1, 'the key fact: whichever way we split, at least one half is still properly sorted, and we can tell which');
  while (lo <= hi) {
    const mid = midOf(lo, hi);
    const probes = probe();
    add(lo, hi, mid, { [mid]: 'compare' }, 3, `mid = ${mid}. Look at a[${mid}] = ${a[mid]}`);
    if (a[mid] === target) {
      add(lo, hi, mid, { [mid]: 'found' }, 4, `${a[mid]} equals ${target}: found ${target} at index ${mid} after ${plural(probes, 'probe')}`);
      return { steps, final: state };
    }
    const leftSorted = a[lo] <= a[mid];
    const sorted = {};
    for (let i = leftSorted ? lo : mid; i <= (leftSorted ? mid : hi); i++) sorted[i] = 'window';
    add(lo, hi, mid, { ...sorted, [mid]: 'compare' }, leftSorted ? 5 : 7,
      leftSorted
        ? `a[lo] = ${a[lo]} ≤ a[mid] = ${a[mid]}: the left half (blue) is sorted, with no break in it`
        : `a[lo] = ${a[lo]} > a[mid] = ${a[mid]}: the break is on the left, so the right half (blue) must be the sorted one`);
    const inSorted = leftSorted ? a[lo] <= target && target < a[mid] : a[mid] < target && target <= a[hi];
    if (leftSorted) {
      if (inSorted) { hi = mid - 1; } else { lo = mid + 1; }
    } else if (inSorted) { lo = mid + 1; } else { hi = mid - 1; }
    const side = leftSorted ? 'left' : 'right';
    add(lo, hi, null, { [mid]: 'removed' }, leftSorted ? 6 : 8,
      inSorted
        ? `${target} is within the range of the sorted ${side} half, so it can only be there. Discard the other half`
        : `${target} is outside the range of the sorted ${side} half, so it must be in the other half. Discard the sorted one`);
  }
  add(lo, hi, null, {}, 11, `the window is empty: ${target} is not in the array. Return -1`);
  return { steps, final: state };
}

// --- binary search on the answer: integer square root (LeetCode 69) -------------------

export function sqrt(state, x) {
  checkNumber(x, 'x', 0, 30);
  const cells = Array.from({ length: x + 1 }, (_, i) => i);
  const { steps, add, probe } = recorder(cells, x + 1);

  let lo = 0;
  let hi = x;
  let ans = 0;
  const keep = () => (ans > 0 || x === 0 ? { [ans]: 'keep' } : {});
  add(lo, hi, null, {}, 0, `mySqrt(${x}): the biggest whole number whose square is at most ${x}. There is no array: the candidates are just the numbers 0 to ${x}, and "mid × mid ≤ ${x}" is true for small numbers and false for big ones`);
  add(lo, hi, null, {}, 1, `the answer is somewhere in 0..${x}. Because the test flips from true to false exactly once, binary search can find the flip`);
  while (lo <= hi) {
    const mid = midOf(lo, hi);
    probe();
    const square = mid * mid;
    add(lo, hi, mid, { ...keep(), [mid]: 'compare' }, 3, `mid = ${mid}: ${mid} × ${mid} = ${square}, ${square <= x ? `which is at most ${x}` : `which is more than ${x}`}`);
    if (square <= x) {
      ans = mid;
      lo = mid + 1;
      add(lo, hi, null, { ...keep(), [mid]: 'keep' }, 4, `${mid} is small enough, so it is a possible answer (remember it). A bigger number might also work: lo = ${lo}`);
    } else {
      hi = mid - 1;
      add(lo, hi, null, { ...keep(), [mid]: 'removed' }, 5, `${mid} is too big, and so is every larger number: hi = ${hi}`);
    }
  }
  add(lo, hi, null, { [ans]: 'found' }, 7, `done: the integer square root of ${x} is ${ans}, because ${ans}² = ${ans * ans} ≤ ${x} < ${(ans + 1) ** 2} = ${ans + 1}². It took ${steps.at(-1).probes} probes, not ${x}`);
  return { steps, final: state };
}
