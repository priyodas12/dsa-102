import { mountTopic } from '../../core/topic-view.js';
import { createState, insert, search, remove, traversal, lca, count, height, programs } from './steps.js';
import { lesson } from './lesson.js';

const traverse = (kind) => ({
  label: { inorder: 'In-order', preorder: 'Pre-order', postorder: 'Post-order', levelorder: 'Level-order' }[kind],
  fields: [],
  run: (s) => traversal(s, kind),
  program: kind,
  info: kind,
});

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([50, 30, 70, 20, 40, 60, 80]),
    idle: (s) => ({ tree: { root: s.root, marks: {} }, rows: [], size: count(s.root) }),
    idleCaption: 'A binary search tree: smaller values on the left, larger on the right. Pick an operation and press Run.',
    meta: (step) => `nodes ${step.size} · height ${height(step.tree.root)}`,
    fields: [
      { name: 'value', type: 'number', value: 45 },
      { name: 'p', type: 'number', value: 20 },
      { name: 'q', type: 'number', value: 40 },
    ],
    ops: {
      insert: { label: 'Insert', fields: ['value'], run: (s, a) => insert(s, a.value), program: 'insert', info: 'insert' },
      search: { label: 'Search', fields: ['value'], run: (s, a) => search(s, a.value), program: 'search', info: 'search' },
      delete: { label: 'Delete', fields: ['value'], run: (s, a) => remove(s, a.value), program: 'delete', info: 'delete' },
      inorder: traverse('inorder'),
      preorder: traverse('preorder'),
      postorder: traverse('postorder'),
      levelorder: traverse('levelorder'),
      lca: { label: 'Lowest common ancestor', fields: ['p', 'q'], run: (s, a) => lca(s, a.p, a.q), program: 'lca', info: 'lca' },
    },
    initialOp: 'insert',
    programs,
    lesson,
  });
}
