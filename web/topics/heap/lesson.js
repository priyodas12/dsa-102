export const lesson = {
  title: 'Heap',
  why: 'Sometimes you do not need everything sorted, you only need the smallest (or largest) item right now, again and again: the next task to run, the closest city to visit, the best candidate so far. A heap gives you that item instantly and keeps it available as items come and go, which is how a priority queue works.',
  how: [
    'A heap is a binary tree with two rules: it is complete (every level is full except maybe the last, which fills left to right), and every parent is no larger than its children (min-heap).',
    'Completeness means a heap fits in a plain array with no pointers. For index i: parent = (i − 1) / 2, left child = 2i + 1, right child = 2i + 2.',
    'The smallest value is always the root, array[0], so peek is O(1).',
    'Insert adds the value at the end, then sifts it up: swap with its parent while it is smaller. At most one swap per level, so O(log n).',
    'Extract-min takes the root, moves the last element into its place, then sifts it down: swap with the smaller child while it is larger. Also O(log n).',
    'Heapify turns any array into a heap in O(n) by sifting down each parent from the last one back to the root. That beats n inserts, which cost O(n log n).',
  ],
  operations: {
    insert: { name: 'Insert', time: 'O(log n)', space: 'O(1)', note: 'At most one swap per level, and a complete tree with n nodes has about log₂ n levels.' },
    extract: { name: 'Extract min', time: 'O(log n)', space: 'O(1)', note: 'Same bound as insert: the moved element can fall at most one level per swap.' },
    peek: { name: 'Peek', time: 'O(1)', space: 'O(1)', note: 'The minimum is always the root.' },
    heapify: { name: 'Heapify (build heap)', time: 'O(n)', space: 'O(1)', note: 'Most nodes are near the bottom and sift very little, so the total is linear rather than n log n.' },
    topk: { name: 'Top K largest', time: 'O(n log k)', space: 'O(k)', note: 'Each of the n values costs at most one O(log k) heap operation. Sorting everything would be O(n log n).' },
  },
  tradeoffs: [
    'A heap is partially ordered: the top is the best, but the rest is not sorted. You cannot search it or list it in order without extracting everything.',
    'Use a heap (Java PriorityQueue) for repeated "give me the smallest/largest" requests, and for top-K, merging sorted lists, scheduling and Dijkstra\'s shortest path.',
    'Use a BST (TreeMap) if you also need ordered iteration, range queries or fast arbitrary deletion.',
    'A sorted array gives the minimum in O(1) too, but each insert costs O(n). A heap makes both operations O(log n).',
    'For the k largest values use a min-heap of size k, not a max-heap of everything: the root is the weakest of the best, so it is the one to compare against.',
  ],
  pitfalls: [
    'Heap order is not sorted order. [1, 5, 2, 9, 6] is a valid min-heap even though 5 comes before 2.',
    'When sifting down, swap with the smaller child (in a min-heap). Picking the larger child breaks the heap.',
    'Check that the right child exists before reading it: the last parent may have only a left child.',
    'Off-by-one in the index formulas is the most common bug. Use 0-based (children 2i + 1, 2i + 2) or 1-based (2i, 2i + 1) consistently.',
    'Java\'s PriorityQueue is a min-heap by default. For a max-heap pass Collections.reverseOrder().',
  ],
};
