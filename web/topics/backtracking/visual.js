import { mountTopic } from '../../core/topic-view.js';
import { createState, subsets, permutations, parentheses, nQueens, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(),
    idle: () => ({
      search: {
        root: { id: 0, label: '{}', edge: '', children: [
          { id: 1, label: '{}', edge: 'skip 1', children: [] },
          { id: 2, label: '{1}', edge: 'take 1', children: [] },
        ] },
        marks: { 0: 'active' },
      },
      rows: [],
      size: 3,
      meta: 'a tree of choices',
    }),
    idleCaption: 'Backtracking explores a tree of choices: make a choice, explore it, undo it, try the next. Pick a problem and press Run.',
    meta: (step) => step.meta,
    fields: [
      { name: 'numbers', type: 'text', value: '1, 2, 3' },
      { name: 'n', type: 'number', value: 3 },
      { name: 'queens', type: 'number', value: 4 },
    ],
    ops: {
      subsets: { label: 'Subsets', fields: ['numbers'], run: (s, a) => subsets(s, a.numbers), program: 'subsets', info: 'subsets' },
      permutations: { label: 'Permutations', fields: ['numbers'], run: (s, a) => permutations(s, a.numbers), program: 'permutations', info: 'permutations' },
      parentheses: { label: 'Generate parentheses', fields: ['n'], run: (s, a) => parentheses(s, a.n), program: 'parentheses', info: 'parentheses' },
      nQueens: { label: 'N-Queens', fields: ['queens'], run: (s, a) => nQueens(s, a.queens), program: 'nQueens', info: 'nQueens' },
    },
    initialOp: 'subsets',
    programs,
    lesson,
  });
}
