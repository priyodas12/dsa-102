import { mountTopic } from '../../core/topic-view.js';
import { createState, search, lowerBound, rotated, sqrt, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(),
    idle: (s) => ({
      rows: [{ label: 'array', cells: s.values, marks: {}, pointers: { lo: 0, hi: s.values.length - 1 }, dim: [] }],
      size: s.values.length,
      probes: 0,
    }),
    idleCaption: 'A sorted array. Binary search looks at the middle and discards half each time. Pick a problem and press Run.',
    meta: (step) => `elements ${step.size} · probes ${step.probes}`,
    fields: [
      { name: 'sorted', type: 'text', value: '2, 5, 8, 12, 16, 23, 38, 56, 72, 91' },
      { name: 'target', type: 'number', value: 23 },
      { name: 'dupes', type: 'text', value: '1, 2, 2, 2, 3, 5, 5, 8' },
      { name: 'key', type: 'number', value: 2 },
      { name: 'rotated', type: 'text', value: '4, 5, 6, 7, 0, 1, 2' },
      { name: 'find', type: 'number', value: 0 },
      { name: 'x', type: 'number', value: 20 },
    ],
    ops: {
      search: { label: 'Find a target', fields: ['sorted', 'target'], run: (s, a) => search(s, a.sorted, a.target), program: 'search', info: 'search' },
      lowerBound: { label: 'Lower bound (first ≥)', fields: ['dupes', 'key'], run: (s, a) => lowerBound(s, a.dupes, a.key), program: 'lowerBound', info: 'lowerBound' },
      rotated: { label: 'Rotated array', fields: ['rotated', 'find'], run: (s, a) => rotated(s, a.rotated, a.find), program: 'rotated', info: 'rotated' },
      sqrt: { label: 'Square root (on the answer)', fields: ['x'], run: (s, a) => sqrt(s, a.x), program: 'sqrt', info: 'sqrt' },
    },
    initialOp: 'search',
    programs,
    lesson,
  });
}
