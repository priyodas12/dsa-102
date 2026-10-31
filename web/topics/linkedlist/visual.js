import { mountTopic } from '../../core/topic-view.js';
import { createState, prepend, append, insertAt, removeAt, search, reverse, hasCycle, programs, valuesOf } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([3, 7, 9, 5]),
    idle: (s) => ({
      list: {
        nodes: s.items.map((it, i) => ({ id: it.id, value: it.value, next: s.items[i + 1]?.id ?? null })),
        marks: {},
        edgeMarks: {},
        pointers: { head: s.items[0]?.id ?? null },
      },
      size: valuesOf(s).length,
    }),
    idleCaption: 'A singly linked list: each node holds a value and an arrow to the next node. Only head is stored. Pick an operation and press Run.',
    meta: (step) => `nodes ${step.size}`,
    fields: [
      { name: 'value', type: 'number', value: 4 },
      { name: 'index', type: 'number', value: 2 },
      { name: 'tailTo', type: 'number', value: 1 },
    ],
    ops: {
      prepend: { label: 'Insert at head', fields: ['value'], run: (s, a) => prepend(s, a.value), program: 'prepend', info: 'prepend' },
      append: { label: 'Insert at tail', fields: ['value'], run: (s, a) => append(s, a.value), program: 'append', info: 'append' },
      insertAt: { label: 'Insert at index', fields: ['index', 'value'], run: (s, a) => insertAt(s, a.index, a.value), program: 'insertAt', info: 'insertAt' },
      removeAt: { label: 'Remove at index', fields: ['index'], run: (s, a) => removeAt(s, a.index), program: 'removeAt', info: 'removeAt' },
      search: { label: 'Search', fields: ['value'], run: (s, a) => search(s, a.value), program: 'search', info: 'search' },
      reverse: { label: 'Reverse', fields: [], run: (s) => reverse(s), program: 'reverse', info: 'reverse' },
      cycle: { label: 'Detect cycle', fields: ['tailTo'], run: (s, a) => hasCycle(s, a.tailTo), program: 'cycle', info: 'cycle' },
    },
    initialOp: 'insertAt',
    programs,
    lesson,
  });
}
