export const lesson = {
  title: 'Sliding window',
  why: 'Many problems ask about a contiguous run of an array or string: the biggest sum of k numbers, the longest stretch without a repeat, the shortest run that reaches a target. Checking every possible run is O(n²) or worse. A sliding window looks at one run at a time, and when it moves it only updates what changed, so the total work is O(n).',
  how: [
    'A window is a contiguous range between two pointers, left and right. It is two pointers where the interesting part is the range between them.',
    'Fixed-size window: the size stays k. To slide right by one, add the element entering on the right and subtract the element leaving on the left. That is 2 operations instead of re-adding all k.',
    'Variable-size window: grow by moving right to include more, and shrink by moving left while a condition is broken (a repeat appears) or already satisfied (the sum is big enough). The window tracks the best length seen.',
    'The window\'s state (a running sum, or a set of characters) is updated incrementally as elements enter and leave, never recomputed from scratch.',
    'Left and right only ever move forward, and each element enters the window once and leaves at most once. That is why the total cost is O(n) even though the shrink step is inside a loop.',
    'The green cell is the element that just entered, the red cell is the one that just left, and the blue cells are the current window.',
  ],
  operations: {
    maxSum: { name: 'Max sum of k numbers (fixed window)', time: 'O(n)', space: 'O(1)', note: 'One addition and one subtraction per slide. Recomputing each window would be O(n × k).' },
    longestUnique: { name: 'Longest substring without repeats', time: 'O(n)', space: 'O(min(n, alphabet))', note: 'Each character is added to the set once and removed at most once. The set never holds more than the alphabet size.' },
    minLen: { name: 'Shortest subarray with sum at least target', time: 'O(n)', space: 'O(1)', note: 'Right moves n times and left moves at most n times, so the nested-looking while loop is still linear overall.' },
  },
  tradeoffs: [
    'Use a sliding window when the question is about a contiguous subarray or substring and asks for a longest, shortest, maximum or count under a condition.',
    'It needs the condition to behave predictably when the window grows or shrinks. Shortest subarray with sum ≥ target works only for positive numbers: with negatives a bigger window can have a smaller sum, and a different approach (prefix sums, a monotonic deque) is needed.',
    'If the elements do not have to be next to each other (a subsequence or any pair), a window does not apply: think hash map, sorting, or dynamic programming.',
    'The window state decides the extra space: a sum is O(1), a set of characters is O(alphabet), a frequency map of words is O(distinct words).',
    'Two pointers and sliding window share the idea of moving indices without going back. In two pointers the indices usually converge; in a window both move forward and keep a range between them.',
  ],
  pitfalls: [
    'Using if instead of while when shrinking. One removal may not be enough: a window can need to shrink several times before it is valid again.',
    'Forgetting to update the window state when moving left. If you drop an element from the range but not from the sum or the set, the answer is wrong.',
    'Length off by one: the number of elements in the window is right − left + 1.',
    'Recording the best answer at the wrong time. In the shortest-subarray problem, record before shrinking; in the longest-substring problem, record after the window is valid.',
    'Building the first fixed window correctly: sum the first k elements once before sliding, and check that k is not larger than the array.',
    'Applying the shrink-while-big-enough pattern to arrays with negative numbers. The shrink step is only safe when removing an element can only decrease the sum.',
  ],
};
