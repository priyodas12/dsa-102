import { mountTopic } from '../../core/topic-view.js';
import { createState, pairSum, palindrome, dedupe, water, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(),
    idle: (s) => ({
      rows: [{ label: 'array', cells: s.values, marks: {}, pointers: { left: 0, right: s.values.length - 1 }, dim: [] }],
      size: s.values.length,
    }),
    idleCaption: 'Two pointers: left and right start at the ends and move towards each other. Pick a problem and press Run.',
    meta: (step) => `elements ${step.size}`,
    fields: [
      { name: 'sorted', type: 'text', value: '1, 3, 4, 6, 8, 11' },
      { name: 'target', type: 'number', value: 10 },
      { name: 'text', type: 'text', value: "Madam, I'm Adam" },
      { name: 'dupes', type: 'text', value: '1, 1, 2, 2, 2, 3, 4, 4' },
      { name: 'heights', type: 'text', value: '1, 8, 6, 2, 5, 4, 8, 3, 7' },
    ],
    ops: {
      pairSum: { label: 'Pair sum (sorted)', fields: ['sorted', 'target'], run: (s, a) => pairSum(s, a.sorted, a.target), program: 'pairSum', info: 'pairSum' },
      palindrome: { label: 'Valid palindrome', fields: ['text'], run: (s, a) => palindrome(s, a.text), program: 'palindrome', info: 'palindrome' },
      dedupe: { label: 'Remove duplicates', fields: ['dupes'], run: (s, a) => dedupe(s, a.dupes), program: 'dedupe', info: 'dedupe' },
      water: { label: 'Most water', fields: ['heights'], run: (s, a) => water(s, a.heights), program: 'water', info: 'water' },
    },
    initialOp: 'pairSum',
    programs,
    lesson,
  });
}
