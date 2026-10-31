import { mountTopic } from '../../core/topic-view.js';
import { createState, fibMemo, coinChange, knapsack, lcs, headerRow, gridRow, programs } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(),
    idle: () => ({
      rows: [headerRow('n', [0, 1, 2, 3, 4, 5, 6, 7]), gridRow('fib(n)', [0, 1, 1, 2, 3, 5, 8, 13])],
      size: 8,
      meta: 'a table of answers to smaller problems',
    }),
    idleCaption: 'Dynamic programming stores the answer to each small problem in a table so it is never computed twice. Pick a problem and press Run.',
    meta: (step) => step.meta,
    fields: [
      { name: 'n', type: 'number', value: 7 },
      { name: 'coins', type: 'text', value: '1, 5, 6' },
      { name: 'amount', type: 'number', value: 10 },
      { name: 'items', type: 'text', value: '1:1, 3:4, 4:5, 5:7' },
      { name: 'cap', type: 'number', value: 7 },
      { name: 'first', type: 'text', narrow: true, value: 'ABCBDA' },
      { name: 'second', type: 'text', narrow: true, value: 'BDCABA' },
    ],
    ops: {
      fibMemo: { label: 'Fibonacci (memoization)', fields: ['n'], run: (s, a) => fibMemo(s, a.n), program: 'fibMemo', info: 'fibMemo' },
      coinChange: { label: 'Coin change', fields: ['coins', 'amount'], run: (s, a) => coinChange(s, a.coins, a.amount), program: 'coinChange', info: 'coinChange' },
      knapsack: { label: '0/1 knapsack', fields: ['items', 'cap'], run: (s, a) => knapsack(s, a.items, a.cap), program: 'knapsack', info: 'knapsack' },
      lcs: { label: 'Longest common subsequence', fields: ['first', 'second'], run: (s, a) => lcs(s, a.first, a.second), program: 'lcs', info: 'lcs' },
    },
    initialOp: 'fibMemo',
    programs,
    lesson,
  });
}
