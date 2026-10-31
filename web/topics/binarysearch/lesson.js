export const lesson = {
  title: 'Binary search',
  why: 'Finding something by checking items one at a time takes up to n steps. But if the data is sorted, one look at the middle tells you which half the answer must be in, so you can throw the other half away. Do that again and again and you need only about log₂ n looks: 20 for a million items, 30 for a billion. It is the guessing game "higher or lower?", played well.',
  how: [
    'Keep a window [lo, hi] of positions where the answer could still be. At the start it is the whole array.',
    'Look at the middle, mid. Compare it with the target. That one comparison rules out the whole half on one side of mid.',
    'Move lo up or hi down to shrink the window to the half that can still hold the answer. Repeat until the answer is found or the window is empty.',
    'Each probe halves the window, so n elements need at most about log₂ n probes: O(log n) time and O(1) extra space. The faded cells in the animation are the ones already ruled out.',
    'It only works on data with an order that lets one comparison rule out a half. A sorted array is the common case.',
    'The idea is wider than arrays. Lower bound finds the first position that satisfies a condition, even with duplicates. A rotated array is still "sorted in pieces". And you can search the answers to a question instead of an array: any yes/no test that flips from false to true exactly once can be binary searched.',
  ],
  operations: {
    search: { name: 'Find a target in a sorted array', time: 'O(log n)', space: 'O(1)', note: 'At most ⌊log₂ n⌋ + 1 probes. Linear search needs up to n.' },
    lowerBound: { name: 'Lower bound (first index ≥ target)', time: 'O(log n)', space: 'O(1)', note: 'Returns the insertion point, so it also answers "how many values are smaller than target?". hi starts at n because the answer can be past the end.' },
    rotated: { name: 'Search a rotated sorted array', time: 'O(log n)', space: 'O(1)', note: 'One half is always sorted. Test whether the target lies inside that half, and keep that half or discard it. With duplicate values this can degrade to O(n), so the problem requires distinct values.' },
    sqrt: { name: 'Integer square root (search on the answer)', time: 'O(log x)', space: 'O(1)', note: 'The candidates are the numbers 0 to x, not an array. Squaring is monotonic, so "mid × mid ≤ x" is true up to the answer and false after it.' },
  },
  tradeoffs: [
    'Binary search needs sorted data. If the data is not sorted, sorting first costs O(n log n), which only pays off if you will search many times. For one search, a plain linear scan is faster.',
    'A hash map finds an exact key in O(1) on average, which is faster, but it has no order. Binary search also answers "the first value ≥ x", ranges, and nearest neighbours, which a hash map cannot.',
    'If the data changes often, keeping an array sorted is expensive (O(n) per insert). A balanced search tree (Java TreeMap) gives O(log n) search and insert.',
    'Binary search on the answer turns "find the smallest value that works" optimisation problems into yes/no checks. If you can write a function check(x) that is monotonic, you can binary search x.',
    'Java ships it: Arrays.binarySearch and Collections.binarySearch. Note that with duplicates they may return any matching index, not necessarily the first.',
  ],
  pitfalls: [
    'Computing mid as (lo + hi) / 2 can overflow int for huge arrays. Use lo + (hi − lo) / 2.',
    'Mixing loop styles. With hi = a.length − 1 use while (lo <= hi) and hi = mid − 1. With hi = a.length use while (lo < hi) and hi = mid. Mixing them gives off-by-one errors or an infinite loop.',
    'Infinite loops: if lo = mid (instead of mid + 1) and mid rounds down to lo, the window never shrinks.',
    'Running it on unsorted data gives wrong answers without any error.',
    'With duplicates, plain binary search returns some matching index, not the first or last. Use lower bound for the first.',
    'Rotated arrays: decide which half is sorted before deciding where the target is. Compare a[lo] with a[mid] using ≤, so a window of size one counts as sorted.',
  ],
};
