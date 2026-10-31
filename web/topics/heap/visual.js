import { mountTopic } from '../../core/topic-view.js';
import { createState, insert, extractMin, peek, heapify, topK, build, arrayRow, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([10, 20, 15, 30, 40, 25, 18]),
    idle: (s) => ({ tree: { root: build(s.items), marks: {} }, rows: [arrayRow(s.items)], size: s.items.length }),
    idleCaption: 'A min-heap: every parent is no larger than its children, so the smallest value is the root. Pick an operation and press Run.',
    meta: (step) => `size ${step.size}`,
    fields: [
      { name: 'value', type: 'number', value: 5 },
      { name: 'numbers', type: 'text', value: '9, 4, 7, 1, 8, 2, 6' },
      { name: 'k', type: 'number', value: 3 },
    ],
    ops: {
      insert: { label: 'Insert', fields: ['value'], run: (s, a) => insert(s, a.value), program: 'insert', info: 'insert' },
      extract: { label: 'Extract min', fields: [], run: (s) => extractMin(s), program: 'extract', info: 'extract' },
      peek: { label: 'Peek', fields: [], run: (s) => peek(s), program: 'peek', info: 'peek' },
      heapify: { label: 'Heapify an array', fields: ['numbers'], run: (s, a) => heapify(s, a.numbers), program: 'heapify', info: 'heapify' },
      topk: { label: 'Top K largest', fields: ['numbers', 'k'], run: (s, a) => topK(s, a.numbers, a.k), program: 'topk', info: 'topk' },
    },
    initialOp: 'insert',
    programs,
    lesson,
  });
}
