// Pure step generators for the heap topic: a binary min-heap stored in an array.
//
// State: { items: [...] }, items[0] is the smallest value.
// For index i: parent = floor((i - 1) / 2), left child = 2i + 1, right child = 2i + 2.
// Each step draws the same data twice, as a tree and as the array, and a mark on index i
// applies to both. A node's id in the drawn tree is its array index.
// Step: { tree: { root, marks }, rows: [...], caption, line, size }
// Every operation returns { steps, final } and never mutates its input.

export const MAX_ITEMS = 15;

export const programs = {
  insert: [
    'void insert(int value) {',
    '  data[size] = value; // add at the end: the tree stays complete',
    '  int i = size++;',
    '  while (i > 0 && data[parent(i)] > data[i]) { // sift up',
    '    swap(i, parent(i));',
    '    i = parent(i);',
    '  }',
    '}',
  ],
  extract: [
    'int extractMin() {',
    '  int min = data[0];',
    '  data[0] = data[--size]; // move the last element to the root',
    '  int i = 0;',
    '  while (true) { // sift down',
    '    int smallest = smallestOf(i, left(i), right(i));',
    '    if (smallest == i) break;',
    '    swap(i, smallest);',
    '    i = smallest;',
    '  }',
    '  return min;',
    '}',
  ],
  peek: [
    'int peek() {',
    '  if (size == 0) throw new NoSuchElementException();',
    '  return data[0];',
    '}',
  ],
  heapify: [
    'void heapify(int[] a) {',
    '  for (int i = a.length / 2 - 1; i >= 0; i--) // last parent down to the root',
    '    siftDown(a, i);',
    '}',
    '',
    'void siftDown(int[] a, int i) {',
    '  while (true) {',
    '    int smallest = smallestOf(i, left(i), right(i));',
    '    if (smallest == i) return;',
    '    swap(i, smallest);',
    '    i = smallest;',
    '  }',
    '}',
  ],
  topk: [
    'int[] topK(int[] nums, int k) {',
    '  PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap of the k best',
    '  for (int x : nums) {',
    '    if (heap.size() < k) heap.add(x);',
    '    else if (x > heap.peek()) { heap.poll(); heap.add(x); }',
    '  }',
    '  return heap.stream().mapToInt(Integer::intValue).toArray(); // heap.peek() is the k-th largest',
    '}',
  ],
};

// --- helpers ---------------------------------------------------------------

const parentOf = (i) => (i - 1) >> 1;

export function build(items, i = 0) {
  if (i >= items.length) return null;
  return { id: i, value: items[i], left: build(items, 2 * i + 1), right: build(items, 2 * i + 2) };
}

export function isMinHeap(items) {
  return items.every((v, i) => i === 0 || items[parentOf(i)] <= v);
}

export function arrayRow(items, marks = {}, label = 'array') {
  return { label, cells: items.slice(), marks, pointers: {} };
}

function checkValue(v, what = 'value') {
  if (!Number.isInteger(v) || v < -99 || v > 999) throw new RangeError(`${what} must be a whole number from -99 to 999`);
}

export function parseNumbers(text, max) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter some numbers, for example 5, 3, 8, 1');
  if (parts.length > max) throw new RangeError(`enter at most ${max} numbers`);
  return parts.map((p) => {
    const v = Number(p);
    checkValue(v, `"${p}"`);
    return v;
  });
}

// Records steps from a working array. `emit` snapshots the array as it is at that moment.
function recorder(getItems, extraRows = () => []) {
  const steps = [];
  const emit = (marks, line, caption) => {
    const items = getItems();
    steps.push({
      tree: { root: build(items), marks },
      rows: [...extraRows(), arrayRow(items, marks)],
      line,
      caption,
      size: items.length,
    });
  };
  return { steps, emit };
}

const swap = (a, i, j) => { [a[i], a[j]] = [a[j], a[i]]; };

function siftUp(a, start, emit, L) {
  let i = start;
  while (i > 0) {
    const p = parentOf(i);
    const marks = { [i]: 'active', [p]: 'compare' };
    if (a[p] <= a[i]) {
      emit(marks, L.cmp, `parent ${a[p]} (index ${p}) is not larger than ${a[i]}: the heap property holds, stop`);
      return;
    }
    emit(marks, L.cmp, `${a[i]} is smaller than its parent ${a[p]} (index ${p}): out of order`);
    const [child, parent] = [a[i], a[p]];
    swap(a, i, p);
    emit({ [i]: 'shift', [p]: 'shift' }, L.swap, `swap: ${child} moves up to index ${p}, ${parent} moves down to index ${i}`);
    i = p;
  }
  emit({ [i]: 'active' }, L.cmp, `${a[i]} reached the root: nothing above it, stop`);
}

function siftDown(a, start, n, emit, L) {
  let i = start;
  for (;;) {
    const kids = [2 * i + 1, 2 * i + 2].filter((k) => k < n);
    if (kids.length === 0) {
      emit({ [i]: 'active' }, L.stop, `${a[i]} has no children, so it stays here`);
      return;
    }
    let smallest = i;
    for (const k of kids) if (a[k] < a[smallest]) smallest = k;
    const marks = { [i]: 'active', ...Object.fromEntries(kids.map((k) => [k, 'compare'])) };
    const kidText = kids.map((k) => `${a[k]} (index ${k})`).join(' and ');
    if (smallest === i) {
      emit(marks, L.stop, `${a[i]} is not larger than its ${kids.length === 1 ? 'child' : 'children'} ${kidText}: the heap property holds, stop`);
      return;
    }
    emit(marks, L.cmp, `the smallest child is ${a[smallest]} (index ${smallest}), smaller than ${a[i]}: they must swap`);
    const [parent, child] = [a[i], a[smallest]];
    swap(a, i, smallest);
    emit({ [i]: 'shift', [smallest]: 'shift' }, L.swap, `swap: ${child} moves up to index ${i}, ${parent} moves down to index ${smallest}`);
    i = smallest;
  }
}

export function createState(values = []) {
  let state = { items: [] };
  for (const v of values) state = insert(state, v).final;
  return state;
}

// --- operations ------------------------------------------------------------

export function insert(state, value) {
  checkValue(value);
  if (state.items.length >= MAX_ITEMS) throw new RangeError(`this demo heap holds at most ${MAX_ITEMS} values`);
  const a = state.items.slice();
  const { steps, emit } = recorder(() => a);

  emit({}, 0, `insert(${value}): add it at the end of the array, then move it up until it is in order`);
  a.push(value);
  emit({ [a.length - 1]: 'new' }, 1, `put ${value} in the first free slot (index ${a.length - 1}). The tree stays complete, but the order may now be broken`);
  siftUp(a, a.length - 1, emit, { cmp: 3, swap: 4 });
  return { steps, final: { items: a } };
}

export function extractMin(state) {
  const a = state.items.slice();
  const { steps, emit } = recorder(() => a);

  emit({}, 0, 'extractMin(): the smallest value is always at the root, so removing it is easy. Closing the gap is the work');
  if (a.length === 0) {
    emit({}, 0, 'the heap is empty: there is nothing to extract');
    return { steps, final: state };
  }
  const min = a[0];
  emit({ 0: 'found' }, 1, `the minimum is ${min}, at the root`);
  const last = a.pop();
  if (a.length === 0) {
    emit({}, 10, `${min} was the only value. The heap is now empty`);
    return { steps, final: { items: [] } };
  }
  a[0] = last;
  emit({ 0: 'new' }, 2, `move the last element, ${last}, to the root so the array has no gap. It is probably too big for the top, so sift it down`);
  siftDown(a, 0, a.length, emit, { cmp: 5, swap: 7, stop: 6 });
  emit({}, 10, `return ${min}. The new minimum is ${a[0]}`);
  return { steps, final: { items: a } };
}

export function peek(state) {
  const { items } = state;
  const { steps, emit } = recorder(() => items);
  emit({}, 0, 'peek(): read the smallest value without removing it');
  if (items.length === 0) emit({}, 1, 'the heap is empty: nothing to peek at');
  else emit({ 0: 'found' }, 2, `returns ${items[0]}, the root. Reading it is O(1)`);
  return { steps, final: state };
}

// Build a heap from an arbitrary array in O(n) by sifting down every parent, last one first.
export function heapify(state, numbers) {
  const a = parseNumbers(numbers, MAX_ITEMS);
  const { steps, emit } = recorder(() => a);

  emit({}, 0, isMinHeap(a)
    ? 'this array is already a valid min-heap, but we will run the algorithm anyway'
    : 'an arbitrary array drawn as a tree. Order is broken, so fix it from the bottom up');
  if (a.length > 1) {
    const lastParent = (a.length >> 1) - 1;
    emit({ [lastParent]: 'active' }, 1, `leaves are already tiny heaps. Start at the last parent, index ${lastParent}, and work back to the root`);
    for (let i = lastParent; i >= 0; i--) {
      emit({ [i]: 'active' }, 2, `sift down index ${i} (${a[i]}): make the subtree under it a valid heap`);
      siftDown(a, i, a.length, emit, { cmp: 7, swap: 9, stop: 8 });
    }
  }
  emit({}, 3, `done: every parent is no larger than its children. Total work is O(n), not O(n log n)`);
  return { steps, final: { items: a } };
}

// Interview problem: the k largest values using a min-heap of size k (LeetCode 215 / 703).
export function topK(state, numbers, k) {
  const nums = parseNumbers(numbers, 12);
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new RangeError(`k must be a whole number from 1 to ${nums.length}`);

  const heap = [];
  let at = null;
  const inputRow = () => ({ label: 'input', cells: nums, marks: at === null ? {} : { [at]: 'active' }, pointers: at === null ? {} : { x: at } });
  const { steps, emit } = recorder(() => heap, () => [inputRow()]);

  emit({}, 0, `topK(k = ${k}): keep a min-heap of the ${k} largest values seen so far. Its root is the weakest of them, the first to be replaced`);
  for (let i = 0; i < nums.length; i++) {
    at = i;
    const x = nums[i];
    if (heap.length < k) {
      heap.push(x);
      emit({ [heap.length - 1]: 'new' }, 3, `heap has ${heap.length - 1} of ${k} values, so there is room: add ${x}`);
      siftUp(heap, heap.length - 1, emit, { cmp: 3, swap: 3 });
    } else if (x > heap[0]) {
      emit({ 0: 'compare' }, 4, `${x} is larger than the smallest kept value ${heap[0]}: that one is no longer in the top ${k}. Replace it`);
      heap[0] = x;
      emit({ 0: 'new' }, 4, `put ${x} at the root, then sift it down`);
      siftDown(heap, 0, heap.length, emit, { cmp: 4, swap: 4, stop: 4 });
    } else {
      emit({ 0: 'compare' }, 4, `${x} is not larger than the smallest kept value ${heap[0]}, so it can never be in the top ${k}: skip it`);
    }
  }
  at = null;
  const sorted = heap.slice().sort((p, q) => q - p);
  emit({ 0: 'found' }, 6, `done: the ${k} largest are ${sorted.join(', ')}. The root, ${heap[0]}, is the ${k}${ordinalSuffix(k)} largest overall`);
  return { steps, final: state };
}

function ordinalSuffix(n) {
  const v = n % 100;
  return v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
}
