// Pure step generators for the sliding window topic. Each operation is one classic problem.
//
// State: { values } is only the array shown before anything runs; no operation changes it.
// Step: { rows, caption, line, size }. The window is the run of cells marked 'window'
// from `left` to `right`; the pointers show its two edges.
// Every operation returns { steps, final }.

export const programs = {
  maxSum: [
    'int maxSumOfK(int[] a, int k) {',
    '  int sum = 0;',
    '  for (int i = 0; i < k; i++) sum += a[i]; // the first window',
    '  int best = sum;',
    '  for (int right = k; right < a.length; right++) {',
    '    sum += a[right] - a[right - k]; // slide: add the new value, drop the old one',
    '    best = Math.max(best, sum);',
    '  }',
    '  return best;',
    '}',
  ],
  longestUnique: [
    'int lengthOfLongestSubstring(String s) {',
    '  Set<Character> window = new HashSet<>();',
    '  int left = 0, best = 0;',
    '  for (int right = 0; right < s.length(); right++) {',
    '    while (window.contains(s.charAt(right))) { // duplicate: shrink from the left',
    '      window.remove(s.charAt(left));',
    '      left++;',
    '    }',
    '    window.add(s.charAt(right));',
    '    best = Math.max(best, right - left + 1);',
    '  }',
    '  return best;',
    '}',
  ],
  minLen: [
    'int minSubArrayLen(int target, int[] a) { // all values positive',
    '  int left = 0, sum = 0, best = Integer.MAX_VALUE;',
    '  for (int right = 0; right < a.length; right++) {',
    '    sum += a[right]; // grow the window on the right',
    '    while (sum >= target) { // big enough: try to shrink from the left',
    '      best = Math.min(best, right - left + 1);',
    '      sum -= a[left++];',
    '    }',
    '  }',
    '  return best == Integer.MAX_VALUE ? 0 : best;',
    '}',
  ],
};

export const createState = (values = [2, 1, 5, 1, 3, 2]) => ({ values });

// --- helpers ---------------------------------------------------------------

export function parseNumbers(text, { max, min = -99 }) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter some numbers, for example 2, 1, 5, 1, 3');
  if (parts.length > max) throw new RangeError(`enter at most ${max} numbers`);
  return parts.map((p) => {
    const v = Number(p);
    if (!Number.isInteger(v) || v < min || v > 999) throw new RangeError(`"${p}" must be a whole number from ${min} to 999`);
    return v;
  });
}

// Cells left..right (inclusive) are the window. Extra marks (entering, leaving) win over 'window'.
const windowMarks = (left, right, extra = {}) => {
  const marks = {};
  for (let i = left; i <= right; i++) marks[i] = 'window';
  return { ...marks, ...extra };
};

const arrayRow = (cells, marks, left, right, label = 'array') => ({
  label,
  cells,
  marks,
  pointers: left > right ? {} : { left, right },
});

// A single number (a running total), so an index under it would only be noise.
const valueRow = (label, value, fresh = false) => ({ label, cells: [value], marks: fresh ? { 0: 'new' } : {}, pointers: {}, noIndex: true });

// --- fixed-size window: maximum sum of k consecutive numbers ---------------------

export function maxSum(state, numbersText, k) {
  const a = parseNumbers(numbersText, { max: 12 });
  const n = a.length;
  if (!Number.isInteger(k) || k < 1 || k > n) throw new RangeError(`k must be a whole number from 1 to ${n}`);
  const steps = [];
  const add = (left, right, extra, rows, line, caption) =>
    steps.push({ rows: [arrayRow(a, windowMarks(left, right, extra), left, right), ...rows], line, caption, size: n });

  add(0, -1, {}, [], 0, `maxSumOfK(k = ${k}): find the ${k} consecutive numbers with the biggest total. A window of size ${k} slides along the array`);
  let sum = 0;
  for (let i = 0; i < k; i++) {
    sum += a[i];
    add(0, i, { [i]: 'new' }, [valueRow('window sum', sum, true)], 2, `build the first window: add ${a[i]}, the sum is now ${sum}`);
  }
  let best = sum;
  let bestAt = 0;
  add(0, k - 1, {}, [valueRow('window sum', sum), valueRow('best sum', best, true)], 3, `the first window sums to ${sum}. That is the best so far`);
  for (let right = k; right < n; right++) {
    const left = right - k + 1;
    const old = sum;
    sum += a[right] - a[right - k];
    const improved = sum > best;
    if (improved) { best = sum; bestAt = left; }
    add(left, right, { [right]: 'new', [right - k]: 'removed' }, [valueRow('window sum', sum, true), valueRow('best sum', best, improved)], 5,
      `slide right: add ${a[right]}, drop ${a[right - k]}. The sum is ${old} + ${a[right]} − ${a[right - k]} = ${sum}${improved ? `. A new best` : `, not better than ${best}`}. That was 2 operations, not ${k}`);
  }
  add(bestAt, bestAt + k - 1, {}, [valueRow('window sum', sum), valueRow('best sum', best)], 8,
    `done: the maximum sum is ${best}, from ${a.slice(bestAt, bestAt + k).join(' + ')}. Recomputing every window from scratch would cost ${k} additions each time, O(n × k). Sliding makes it O(n)`);
  return { steps, final: state };
}

// --- variable window: longest substring without repeating characters (LeetCode 3) --

export function longestUnique(state, text) {
  const chars = [...String(text)];
  if (chars.length === 0 || chars.length > 16) throw new RangeError('enter 1 to 16 characters');
  const cells = chars.map((c) => (c === ' ' ? '␣' : c));
  const n = chars.length;
  const steps = [];
  const set = [];
  let best = 0;
  let bestLeft = 0;
  let improved = false;
  const add = (left, right, extra, line, caption) =>
    steps.push({
      rows: [
        arrayRow(cells, windowMarks(left, right, extra), left, right, 'characters'),
        { label: 'characters in the window (the set)', cells: set.map((c) => (c === ' ' ? '␣' : c)), marks: {}, pointers: {} },
        valueRow('longest so far', best, improved),
      ],
      line,
      caption,
      size: n,
    });

  let left = 0;
  add(0, -1, {}, 0, 'longest substring with no repeated character. The window grows on the right; when a repeat appears it shrinks from the left until the repeat is gone');
  add(0, -1, {}, 1, 'a set remembers which characters are inside the window, so "is it already here?" is one lookup');
  for (let right = 0; right < n; right++) {
    const c = chars[right];
    add(left, right - 1, { [right]: 'compare' }, 4, `right looks at '${cells[right]}'. Is it already in the window?${set.includes(c) ? ' Yes, a repeat' : ' No'}`);
    while (set.includes(c)) {
      const drop = chars[left];
      set.splice(set.indexOf(drop), 1);
      add(left + 1, right - 1, { [left]: 'removed', [right]: 'compare' }, 5, `'${cells[right]}' repeats, so shrink: drop '${drop === ' ' ? '␣' : drop}' from the left end and from the set`);
      left++;
      if (set.includes(c)) add(left, right - 1, { [right]: 'compare' }, 4, `'${cells[right]}' is still in the window: keep shrinking`);
    }
    set.push(c);
    improved = right - left + 1 > best;
    if (improved) { best = right - left + 1; bestLeft = left; }
    add(left, right, { [right]: 'new' }, 8, `no repeat inside the window now, so add '${cells[right]}' to the set. The window length is ${right} − ${left} + 1 = ${right - left + 1}${improved ? '. A new longest' : ''}`);
    improved = false;
  }
  add(bestLeft, bestLeft + best - 1, {}, 11,
    `done: the longest substring without repeats has length ${best}: "${chars.slice(bestLeft, bestLeft + best).join('')}". Each character entered the window once and left at most once, so O(n)`);
  return { steps, final: state };
}

// --- variable window: shortest subarray with sum >= target (LeetCode 209) ------------

export function minLen(state, numbersText, target) {
  const a = parseNumbers(numbersText, { max: 12, min: 1 });
  if (!Number.isInteger(target) || target < 1 || target > 999) throw new RangeError('target must be a whole number from 1 to 999');
  const n = a.length;
  const steps = [];
  let sum = 0;
  let best = Infinity;
  let bestLeft = 0;
  let improved = false;
  const add = (left, right, extra, line, caption) =>
    steps.push({
      rows: [
        arrayRow(a, windowMarks(left, right, extra), left, right),
        valueRow('window sum', sum),
        valueRow('shortest length so far', best === Infinity ? '∞' : best, improved),
      ],
      line,
      caption,
      size: n,
    });

  let left = 0;
  add(0, -1, {}, 0, `minSubArrayLen(target = ${target}): the shortest run of consecutive numbers that adds up to at least ${target}. All numbers are positive, so a bigger window always has a bigger sum`);
  for (let right = 0; right < n; right++) {
    sum += a[right];
    add(left, right, { [right]: 'new' }, 3, `grow: add ${a[right]} on the right. The window sum is ${sum}${sum >= target ? `, which is at least ${target}` : `, still less than ${target}`}`);
    while (sum >= target) {
      improved = right - left + 1 < best;
      if (improved) { best = right - left + 1; bestLeft = left; }
      add(left, right, {}, 5, `${sum} ≥ ${target}: the window is big enough. Its length is ${right - left + 1}${improved ? '. The shortest so far' : `, not shorter than ${best}`}`);
      improved = false;
      sum -= a[left];
      add(left + 1, right, { [left]: 'removed' }, 6, `shrink: drop ${a[left]} from the left. The sum falls to ${sum}${sum >= target ? ', still big enough, so keep shrinking' : `, below ${target} again, so grow on the right`}`);
      left++;
    }
  }
  add(best === Infinity ? 0 : bestLeft, best === Infinity ? -1 : bestLeft + best - 1, {}, 9, best === Infinity
    ? `done: even all the numbers together do not reach ${target}. Return 0`
    : `done: the shortest window has length ${best}: ${a.slice(bestLeft, bestLeft + best).join(' + ')} = ${a.slice(bestLeft, bestLeft + best).reduce((x, y) => x + y, 0)}. Both pointers only ever moved right, so O(n)`);
  return { steps, final: state };
}
