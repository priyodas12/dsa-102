import { mountTopic } from '../../core/topic-view.js';
import { createState, access, search, insert, remove, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([7, 3, 9, 5], 6),
    idle: (s) => ({ rows: [{ label: 'data', cells: s.data, marks: {}, pointers: {} }], size: s.size }),
    idleCaption: 'Pick an operation and press Run. Use Next/Back to step through it.',
    meta: (step) => `size ${step.size} · capacity ${step.rows[0].cells.length}`,
    fields: [
      { name: 'index', type: 'number', value: 2 },
      { name: 'value', type: 'number', value: 4 },
    ],
    ops: {
      access: { label: 'Access', fields: ['index'], run: (s, a) => access(s, a.index), program: 'access', info: 'access' },
      search: { label: 'Search', fields: ['value'], run: (s, a) => search(s, a.value), program: 'search', info: 'search' },
      insert: { label: 'Insert', fields: ['index', 'value'], run: (s, a) => insert(s, a.index, a.value), program: 'insert', info: 'insert' },
      append: { label: 'Append', fields: ['value'], run: (s, a) => insert(s, s.size, a.value), program: 'insert', info: 'insert' },
      delete: { label: 'Delete', fields: ['index'], run: (s, a) => remove(s, a.index), program: 'delete', info: 'delete' },
    },
    initialOp: 'insert',
    programs,
    lesson,
  });
}
