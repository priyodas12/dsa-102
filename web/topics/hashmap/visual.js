import { mountTopic } from '../../core/topic-view.js';
import { createState, put, get, remove, twoSum, bucketRows, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState([['cat', 3], ['dog', 8], ['bee', 5]], 4),
    idle: (s) => ({ rows: bucketRows(s.buckets), size: s.size }),
    idleCaption: 'A hash map with 4 buckets. "cat" and "bee" hash to the same bucket, a collision, so they share a chain. Pick an operation and press Run.',
    meta: (step) => {
      const buckets = step.rows.filter((r) => r.chain).length;
      return `entries ${step.size} · buckets ${buckets} · load ${(step.size / buckets).toFixed(2)}`;
    },
    fields: [
      { name: 'key', type: 'text', narrow: true, value: 'ant' },
      { name: 'value', type: 'number', value: 7 },
      { name: 'numbers', type: 'text', value: '2, 7, 11, 15' },
      { name: 'target', type: 'number', value: 9 },
    ],
    ops: {
      put: { label: 'Put', fields: ['key', 'value'], run: (s, a) => put(s, a.key, a.value), program: 'put', info: 'put' },
      get: { label: 'Get', fields: ['key'], run: (s, a) => get(s, a.key), program: 'get', info: 'get' },
      remove: { label: 'Remove', fields: ['key'], run: (s, a) => remove(s, a.key), program: 'remove', info: 'remove' },
      twoSum: { label: 'Two Sum', fields: ['numbers', 'target'], run: (s, a) => twoSum(s, a.numbers, a.target), program: 'twoSum', info: 'twoSum' },
    },
    initialOp: 'put',
    programs,
    lesson,
  });
}
