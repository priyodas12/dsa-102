// Pure step generators for the two pointers topic. Each operation is one classic interview problem.
//
// State: { values } is only the array shown before anything runs; no operation changes it.
// Step: { rows, caption, line, size }. A row can carry `dim`: indices drawn faded because the
// pointers have already ruled them out. Every operation returns { steps, final }.

export const programs = {
  pairSum: [
    'int[] twoSumSorted(int[] a, int target) {',
    '  int left = 0, right = a.length - 1;',
    '  while (left < right) {',
    '    int sum = a[left] + a[right];',
    '    if (sum == target) return new int[] {left, right};',
    '    if (sum < target) left++;  // too small: only a bigger left value can help',
    '    else right--;              // too big: only a smaller right value can help',
    '  }',
    '  return null;',
    '}',
  ],
  palindrome: [
    'boolean isPalindrome(String s) {',
    '  int left = 0, right = s.length() - 1;',
    '  while (left < right) {',
    '    if (!Character.isLetterOrDigit(s.charAt(left))) { left++; continue; }',
    '    if (!Character.isLetterOrDigit(s.charAt(right))) { right--; continue; }',
    '    if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;',
    '    left++; right--;',
    '  }',
    '  return true;',
    '}',
  ],
  dedupe: [
    'int removeDuplicates(int[] a) {',
    '  int slow = 0; // a[0..slow] holds the unique values found so far',
    '  for (int fast = 1; fast < a.length; fast++) {',
    '    if (a[fast] != a[slow]) {',
    '      slow++;',
    '      a[slow] = a[fast];',
    '    }',
    '  }',
    '  return slow + 1; // the new length',
    '}',
  ],
  water: [
    'int maxArea(int[] h) {',
    '  int left = 0, right = h.length - 1, best = 0;',
    '  while (left < right) {',
    '    int area = Math.min(h[left], h[right]) * (right - left);',
    '    best = Math.max(best, area);',
    '    if (h[left] < h[right]) left++; else right--; // move the shorter wall',
    '  }',
    '  return best;',
    '}',
  ],
};

export const createState = (values = [1, 3, 4, 6, 8, 11]) => ({ values });

// --- helpers ---------------------------------------------------------------

function checkNumber(v, what, lo = -99, hi = 999) {
  if (!Number.isInteger(v) || v < lo || v > hi) throw new RangeError(`${what} must be a whole number from ${lo} to ${hi}`);
}

export function parseNumbers(text, { max, min = -99, sorted = false, what = 'numbers' }) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError(`enter some ${what}, for example 1, 3, 4, 6`);
  if (parts.length > max) throw new RangeError(`enter at most ${max} ${what}`);
  const values = parts.map((p) => {
    const v = Number(p);
    checkNumber(v, `"${p}"`, min);
    return v;
  });
  if (sorted && values.some((v, i) => i > 0 && v < values[i - 1])) {
    throw new RangeError('the numbers must be in sorted (non-decreasing) order for this problem');
  }
  return values;
}

const outside = (n, left, right) => Array.from({ length: n }, (_, i) => i).filter((i) => i < left || i > right);

const row = (cells, marks, pointers, dim = [], label = 'array') => ({ label, cells, marks, pointers, dim });

// --- opposite ends: Two Sum on a sorted array (LeetCode 167) ----------------

export function pairSum(state, numbersText, target) {
  const a = parseNumbers(numbersText, { max: 12, sorted: true });
  checkNumber(target, 'target', -999, 2000);
  const n = a.length;
  const steps = [];
  const add = (left, right, marks, line, caption) =>
    steps.push({ rows: [row(a, marks, { left, right }, outside(n, left, right))], line, caption, size: n });

  let left = 0;
  let right = n - 1;
  add(left, right, {}, 0, `twoSumSorted(target = ${target}): find two numbers that add up to ${target}. The array is sorted, so we can start with the biggest possible range and shrink it`);
  add(left, right, {}, 1, 'one pointer at each end: the smallest value and the largest value');
  while (left < right) {
    const sum = a[left] + a[right];
    add(left, right, { [left]: 'compare', [right]: 'compare' }, 3, `${a[left]} + ${a[right]} = ${sum}`);
    if (sum === target) {
      add(left, right, { [left]: 'found', [right]: 'found' }, 4, `${sum} equals ${target}: found at indices [${left}, ${right}]. We never looked at most of the pairs, so this is O(n) instead of O(n²)`);
      return { steps, final: state };
    }
    if (sum < target) {
      const dropped = a[left];
      left++;
      add(left, right, { [left - 1]: 'removed' }, 5,
        `${sum} is less than ${target}: too small. ${dropped} paired with the biggest remaining value (${a[right]}) is still too small, and every other partner is smaller, so ${dropped} can never work. Discard it: left moves right`);
    } else {
      const dropped = a[right];
      right--;
      add(left, right, { [right + 1]: 'removed' }, 6,
        `${sum} is more than ${target}: too big. ${dropped} paired with the smallest remaining value (${a[left]}) is already too big, and every other partner is bigger, so ${dropped} can never work. Discard it: right moves left`);
    }
  }
  add(left, right, {}, 8, `the pointers met without finding a pair that adds up to ${target}. Return null`);
  return { steps, final: state };
}

// --- opposite ends: Valid Palindrome (LeetCode 125) -----------------------------

export function palindrome(state, text) {
  const chars = [...String(text)];
  if (chars.length === 0 || chars.length > 16) throw new RangeError('enter 1 to 16 characters');
  const cells = chars.map((c) => (c === ' ' ? '␣' : c));
  const isAlnum = (c) => /^[A-Za-z0-9]$/.test(c);
  const n = chars.length;
  const steps = [];
  const add = (left, right, marks, line, caption) =>
    steps.push({ rows: [row(cells, marks, { left, right }, outside(n, left, right), 'characters')], line, caption, size: n });

  let left = 0;
  let right = n - 1;
  add(left, right, {}, 0, 'isPalindrome: does the text read the same forwards and backwards, ignoring case, spaces and punctuation?');
  add(left, right, {}, 1, 'compare the outermost characters, then move both pointers towards the middle');
  while (left < right) {
    if (!isAlnum(chars[left])) {
      add(left, right, { [left]: 'removed' }, 3, `'${cells[left]}' is not a letter or digit: skip it. left moves right`);
      left++;
      continue;
    }
    if (!isAlnum(chars[right])) {
      add(left, right, { [right]: 'removed' }, 4, `'${cells[right]}' is not a letter or digit: skip it. right moves left`);
      right--;
      continue;
    }
    const same = chars[left].toLowerCase() === chars[right].toLowerCase();
    if (!same) {
      add(left, right, { [left]: 'error', [right]: 'error' }, 5, `'${chars[left]}' and '${chars[right]}' are different (ignoring case): not a palindrome. One mismatch is enough, so stop here`);
      return { steps, final: state };
    }
    add(left, right, { [left]: 'found', [right]: 'found' }, 5, `'${chars[left]}' and '${chars[right]}' match (ignoring case). Move both pointers inwards`);
    left++;
    right--;
  }
  add(left, right, {}, 8, 'the pointers met in the middle and every pair matched: it is a palindrome');
  return { steps, final: state };
}

// --- same direction (slow and fast): remove duplicates in place (LeetCode 26) --

export function dedupe(state, numbersText) {
  const a = parseNumbers(numbersText, { max: 12, sorted: true });
  const n = a.length;
  const steps = [];
  const keep = (slow) => Object.fromEntries(Array.from({ length: slow + 1 }, (_, i) => [i, 'keep']));
  const add = (slow, fast, marks, line, caption) =>
    steps.push({
      rows: [row(a.slice(), { ...keep(slow), ...marks }, fast === null ? { slow } : { slow, fast }, [])],
      line,
      caption,
      size: n,
    });

  add(0, null, {}, 0, 'removeDuplicates: the array is sorted, so equal values sit together. Overwrite it in place so the unique values come first. No second array');
  let slow = 0;
  add(slow, null, {}, 1, 'slow marks the end of the unique part: everything up to slow is already settled. The first value is always unique');
  for (let fast = 1; fast < n; fast++) {
    add(slow, fast, { [slow]: 'compare', [fast]: 'compare' }, 3, `fast looks at ${a[fast]}. Is it different from the last unique value, ${a[slow]}?`);
    if (a[fast] === a[slow]) {
      add(slow, fast, { [fast]: 'removed' }, 3, `${a[fast]} equals ${a[slow]}: a duplicate. Skip it, only fast moves on`);
      continue;
    }
    slow++;
    add(slow, fast, {}, 4, `${a[fast]} is new: slow moves forward one slot to make room for it`);
    a[slow] = a[fast];
    add(slow, fast, { [slow]: 'new' }, 5, `a[slow] = a[fast]: copy ${a[fast]} into slot ${slow}`);
  }
  const unique = a.slice(0, slow + 1);
  steps.push({
    rows: [row(a.slice(), keep(slow), { slow }, Array.from({ length: n - slow - 1 }, (_, i) => slow + 1 + i))],
    line: 8,
    caption: `fast reached the end: the new length is ${slow + 1}, the unique values are ${unique.join(', ')}. The faded cells are leftovers that are ignored`,
    size: n,
  });
  return { steps, final: state };
}

// --- opposite ends: Container With Most Water (LeetCode 11) ----------------------

export function water(state, heightsText) {
  const h = parseNumbers(heightsText, { max: 12, min: 1, what: 'heights' });
  const n = h.length;
  const steps = [];
  let best = 0;
  let improved = false;
  const add = (left, right, marks, line, caption) =>
    steps.push({
      rows: [
        row(h, marks, { left, right }, outside(n, left, right), 'heights'),
        { label: 'best area so far', cells: [best], marks: improved ? { 0: 'new' } : {}, pointers: {}, noIndex: true },
      ],
      line,
      caption,
      size: n,
    });

  let left = 0;
  let right = n - 1;
  add(left, right, {}, 0, 'maxArea: each number is the height of a wall. Pick two walls to hold the most water between them. The water level is set by the shorter wall');
  add(left, right, {}, 1, 'start with the widest container: the first and the last wall');
  while (left < right) {
    const width = right - left;
    const height = Math.min(h[left], h[right]);
    const area = width * height;
    improved = area > best;
    if (improved) best = area;
    add(left, right, { [left]: 'compare', [right]: 'compare' }, 4,
      `width ${right} − ${left} = ${width}, height min(${h[left]}, ${h[right]}) = ${height}: area ${width} × ${height} = ${area}${improved ? `. A new best` : `. Not better than ${best}`}`);
    improved = false;
    if (h[left] < h[right]) {
      add(left, right, { [left]: 'removed' }, 5,
        `${h[left]} is the shorter wall. Any container using it and a closer partner is narrower and still no taller than ${h[left]}, so it cannot beat this one. Discard it: left moves right`);
      left++;
    } else {
      add(left, right, { [right]: 'removed' }, 5,
        `${h[right]} is the shorter (or equal) wall. Any container using it and a closer partner is narrower and still no taller than ${h[right]}, so it cannot beat this one. Discard it: right moves left`);
      right--;
    }
  }
  add(left, right, {}, 7, `the pointers met: the maximum area is ${best}. One pass over the array, O(n), where checking every pair would be O(n²)`);
  return { steps, final: state };
}
