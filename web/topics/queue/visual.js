import { mountTopic } from '../../core/topic-view.js';
import { createState, enqueue, dequeue, peek, josephus, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    // Starts mid-array so the first enqueues wrap around to the front.
    defaultState: () => createState([4, 8, 2], 6, 3),
    idle: (s) => ({
      rows: [{
        label: 'data (circular)',
        cells: s.data,
        marks: {},
        pointers: { head: s.head, tail: (s.head + s.size) % s.data.length },
      }],
      size: s.size,
    }),
    idleCaption: 'The queue starts in the middle of the array so you can watch it wrap around. Pick an operation and press Run.',
    meta: (step) => {
      const head = step.rows[0].pointers.head;
      return head === undefined ? `size ${step.size}` : `size ${step.size} · head ${head}`;
    },
    fields: [
      { name: 'value', type: 'number', value: 5 },
      { name: 'people', type: 'number', value: 5 },
      { name: 'skip', type: 'number', value: 3 },
    ],
    ops: {
      enqueue: { label: 'Enqueue', fields: ['value'], run: (s, a) => enqueue(s, a.value), program: 'enqueue', info: 'enqueue' },
      dequeue: { label: 'Dequeue', fields: [], run: (s) => dequeue(s), program: 'dequeue', info: 'dequeue' },
      peek: { label: 'Peek', fields: [], run: (s) => peek(s), program: 'peek', info: 'peek' },
      josephus: { label: 'Hot potato', fields: ['people', 'skip'], run: (s, a) => josephus(s, a.people, a.skip), program: 'josephus', info: 'josephus' },
    },
    initialOp: 'enqueue',
    programs,
    lesson,
  });
}
