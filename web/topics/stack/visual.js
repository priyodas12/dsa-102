import { mountTopic } from '../../core/topic-view.js';
import { createState, push, pop, peek, brackets, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([4, 8, 2], 6),
    idle: (s) => ({
      rows: [{
        label: 'stack',
        vertical: true,
        cells: Array.from({ length: s.capacity }, (_, i) => s.items[i] ?? null),
        marks: {},
        pointers: s.items.length ? { top: s.items.length - 1 } : {},
      }],
      size: s.items.length,
    }),
    idleCaption: 'Pick an operation and press Run. Use Next/Back to step through it.',
    meta: (step) => `size ${step.size}`,
    fields: [
      { name: 'value', type: 'number', value: 5 },
      { name: 'brackets', type: 'text', value: '{[()]}' },
    ],
    ops: {
      push: { label: 'Push', fields: ['value'], run: (s, a) => push(s, a.value), program: 'push', info: 'push' },
      pop: { label: 'Pop', fields: [], run: (s) => pop(s), program: 'pop', info: 'pop' },
      peek: { label: 'Peek', fields: [], run: (s) => peek(s), program: 'peek', info: 'peek' },
      brackets: { label: 'Balanced brackets', fields: ['brackets'], run: (s, a) => brackets(s, a.brackets), program: 'brackets', info: 'brackets' },
    },
    initialOp: 'push',
    programs,
    lesson,
  });
}
