export const lesson = {
  title: 'Two pointers',
  why: 'Many array and string problems look like they need a nested loop that checks every pair: O(n²). But when the data has some structure (it is sorted, symmetric, or you only need to compact it), you can keep two indices and move them in a smart way, so that each step rules out a whole group of candidates at once. The result is a single pass: O(n).',
  how: [
    'This is a technique, not a data structure: you keep two indices (pointers) into the same array or string and move them according to a rule.',
    'Pattern 1, opposite ends: one pointer at the start, one at the end, moving towards each other. Used for pair sums on a sorted array, palindromes, and container problems.',
    'Pattern 2, same direction (slow and fast): both start at the front. Fast scans ahead, slow marks where the next result goes or where the settled part ends. Used for removing duplicates, moving zeroes and compacting in place.',
    'The key idea is a safe discard: each move must prove that the element left behind can never be part of the answer. In the sorted pair sum, if left + right is too small, then left plus any other remaining partner is smaller still, so left is useless.',
    'Because every move discards at least one element and nothing is ever revisited, the pointers cross the array at most once: O(n) time. Only two indices are stored: O(1) extra space.',
    'The faded cells in the animation are the elements already ruled out.',
  ],
  operations: {
    pairSum: { name: 'Pair sum in a sorted array', time: 'O(n)', space: 'O(1)', note: 'Each step moves one pointer, and they can only move n − 1 times in total. Brute force checks all n(n−1)/2 pairs.' },
    palindrome: { name: 'Valid palindrome', time: 'O(n)', space: 'O(1)', note: 'Each character is looked at once. Building a cleaned, reversed copy would also be O(n) time but O(n) extra memory.' },
    dedupe: { name: 'Remove duplicates in place', time: 'O(n)', space: 'O(1)', note: 'Fast visits every element once, and slow only trails behind it. No second array is needed.' },
    water: { name: 'Container with most water', time: 'O(n)', space: 'O(1)', note: 'Moving the shorter wall is the greedy choice that can be proven safe. Brute force would try every pair of walls.' },
  },
  tradeoffs: [
    'Two pointers needs structure. Sorted input, a symmetric shape, or a goal like "compact in place" is the signal to reach for it.',
    'For two sum on an unsorted array, a hash map solves it in O(n) time but O(n) space. Sorting first and then using two pointers costs O(n log n) time but only O(1) extra space. Pick based on what you can afford.',
    'Two pointers is closely related to the sliding window technique: a window is two pointers that mark its left and right edges.',
    'It cannot find the best pair if the discard rule is not provable. If you cannot say why the left-behind element is useless, the technique does not apply.',
  ],
  pitfalls: [
    'Forgetting the precondition: the opposite-ends pair sum only works if the array is sorted. On unsorted input it silently gives wrong answers.',
    'Loop condition: use left < right for pairs (a number cannot pair with itself), not left <= right.',
    'Moving the wrong pointer. If the sum is too small you must make it bigger, which means moving the left pointer, not the right one.',
    'Off-by-one on the result: after removing duplicates, slow is an index, and the new length is slow + 1.',
    'Same-direction problems that overwrite the array: make sure slow never overtakes fast, or you destroy values you have not read yet.',
    'Palindrome checks: skip the characters that do not count with a loop and a continue, and do not forget to compare case-insensitively.',
  ],
};
