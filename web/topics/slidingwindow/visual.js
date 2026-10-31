import { mountTopic } from '../../core/topic-view.js';
import { createState, maxSum, longestUnique, minLen, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(),
    idle: (s) => ({
      rows: [{ label: 'array', cells: s.values, marks: { 0: 'window', 1: 'window', 2: 'window' }, pointers: { left: 0, right: 2 } }],
      size: s.values.length,
    }),
    idleCaption: 'A window is a contiguous range between two pointers. It slides along the array, updating its total as elements enter and leave. Pick a problem and press Run.',
    meta: (step) => `elements ${step.size}`,
    fields: [
      { name: 'numbers', type: 'text', value: '2, 1, 5, 1, 3, 2, 8, 4' },
      { name: 'k', type: 'number', value: 3 },
      { name: 'text', type: 'text', value: 'abcabcbb' },
      { name: 'positives', type: 'text', value: '2, 3, 1, 2, 4, 3' },
      { name: 'target', type: 'number', value: 7 },
    ],
    ops: {
      maxSum: { label: 'Max sum of k (fixed window)', fields: ['numbers', 'k'], run: (s, a) => maxSum(s, a.numbers, a.k), program: 'maxSum', info: 'maxSum' },
      longestUnique: { label: 'Longest substring, no repeats', fields: ['text'], run: (s, a) => longestUnique(s, a.text), program: 'longestUnique', info: 'longestUnique' },
      minLen: { label: 'Shortest subarray, sum ≥ target', fields: ['positives', 'target'], run: (s, a) => minLen(s, a.positives, a.target), program: 'minLen', info: 'minLen' },
    },
    initialOp: 'maxSum',
    programs,
    lesson,
  });
}
