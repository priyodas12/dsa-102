// Pure step generators for the queue topic (circular array, fixed capacity).
//
// State: { data: [value|null, ...] (length = capacity), head, size }
//   head = index of the front element, size = how many are stored.
//   The next free slot ("tail") is (head + size) % capacity, so indices wrap around.
// Overflow and underflow are shown as steps, not thrown, because seeing them is the lesson.
// Every operation returns { steps, final } and never mutates its input.

export const programs = {
  enqueue: [
    'void enqueue(int value) {',
    '  if (size == data.length) throw new IllegalStateException("queue full");',
    '  int tail = (head + size) % data.length;',
    '  data[tail] = value;',
    '  size++;',
    '}',
  ],
  dequeue: [
    'int dequeue() {',
    '  if (size == 0) throw new NoSuchElementException();',
    '  int value = data[head];',
    '  data[head] = 0; // clear the slot',
    '  head = (head + 1) % data.length;',
    '  size--;',
    '  return value;',
    '}',
  ],
  peek: [
    'int peek() {',
    '  if (size == 0) throw new NoSuchElementException();',
    '  return data[head];',
    '}',
  ],
  josephus: [
    'int lastSurvivor(int n, int k) {',
    '  Queue<Integer> q = new ArrayDeque<>();',
    '  for (int i = 1; i <= n; i++) q.add(i);',
    '  while (q.size() > 1) {',
    '    for (int i = 1; i < k; i++) q.add(q.remove()); // pass the potato',
    '    q.remove(); // the k-th person is out',
    '  }',
    '  return q.remove();',
    '}',
  ],
};

export function createState(values, capacity = Math.max(values.length, 1), head = 0) {
  if (values.length > capacity) throw new RangeError('more values than capacity');
  const data = Array(capacity).fill(null);
  values.forEach((v, i) => { data[(head + i) % capacity] = v; });
  return { data, head, size: values.length };
}

const tailOf = ({ data, head, size }) => (head + size) % data.length;

const queueRow = (data, head, size, marks = {}) => ({
  label: 'data (circular)',
  cells: data.slice(),
  marks,
  pointers: { head, tail: (head + size) % data.length },
});

export function enqueue(state, value) {
  const { data, head, size } = state;
  const cap = data.length;
  const steps = [];
  const add = (row, line, caption, n) => steps.push({ rows: [row], line, caption, size: n });

  add(queueRow(data, head, size), 0, `enqueue(${value}): join the back of the line`, size);
  if (size === cap) {
    add(queueRow(data, head, size, { [head]: 'error' }), 1,
      `size ${size} equals capacity ${cap}: the queue is full (tail has caught up with head). Overflow, ${value} is rejected`, size);
    return { steps, final: state };
  }
  add(queueRow(data, head, size), 1, `size ${size} is less than capacity ${cap}, so there is room`, size);
  const tail = tailOf(state);
  const wrapped = head + size >= cap;
  add(queueRow(data, head, size), 2,
    `tail = (head + size) % capacity = (${head} + ${size}) % ${cap} = ${tail}${wrapped ? '. The index wrapped around to the front of the array' : ''}`, size);
  const next = data.slice();
  next[tail] = value;
  add(queueRow(next, head, size, { [tail]: 'new' }), 3, `data[${tail}] = ${value}. No elements moved: O(1)`, size);
  add(queueRow(next, head, size + 1, { [tail]: 'new' }), 4, `size is now ${size + 1}; tail moves on to index ${(head + size + 1) % cap}`, size + 1);
  return { steps, final: { data: next, head, size: size + 1 } };
}

export function dequeue(state) {
  const { data, head, size } = state;
  const cap = data.length;
  const steps = [];
  const add = (row, line, caption, n) => steps.push({ rows: [row], line, caption, size: n });

  add(queueRow(data, head, size), 0, 'dequeue(): serve the person at the front of the line', size);
  if (size === 0) {
    add(queueRow(data, head, size), 1, 'size is 0: the queue is empty. Underflow, there is nothing to dequeue', size);
    return { steps, final: state };
  }
  const value = data[head];
  add(queueRow(data, head, size, { [head]: 'found' }), 2, `read the front element: ${value} (the oldest one: first in, first out)`, size);
  const next = data.slice();
  next[head] = null;
  add(queueRow(next, head, size, { [head]: 'removed' }), 3, `clear data[${head}]`, size);
  const newHead = (head + 1) % cap;
  add(queueRow(next, newHead, size - 1), 4,
    `head = (${head} + 1) % ${cap} = ${newHead}${newHead === 0 ? ' (wrapped back to the start)' : ''}. Nothing shifted, only head moved: O(1)`, size - 1);
  add(queueRow(next, newHead, size - 1), 6, `return ${value}`, size - 1);
  return { steps, final: { data: next, head: newHead, size: size - 1 } };
}

export function peek(state) {
  const { data, head, size } = state;
  const steps = [{ rows: [queueRow(data, head, size)], line: 0, size, caption: 'peek(): look at the front element without removing it' }];
  if (size === 0) {
    steps.push({ rows: [queueRow(data, head, size)], line: 1, size, caption: 'size is 0: the queue is empty, so there is nothing to peek at' });
  } else {
    steps.push({
      rows: [queueRow(data, head, size, { [head]: 'found' })],
      line: 2,
      size,
      caption: `returns ${data[head]}. The queue is unchanged`,
    });
  }
  return { steps, final: state };
}

// Interview problem: Hot potato / Josephus. n people stand in a line; every k-th person
// is out. Who is left? Passing the potato = dequeue from the front and enqueue at the back.
export function josephus(state, people, skip) {
  if (!Number.isInteger(people) || people < 1 || people > 10) throw new RangeError('people must be a whole number from 1 to 10');
  if (!Number.isInteger(skip) || skip < 1 || skip > 10) throw new RangeError('skip must be a whole number from 1 to 10');

  let line = Array.from({ length: people }, (_, i) => i + 1);
  const steps = [];
  const row = (items, marks = {}) => ({
    label: 'queue (front on the left)',
    cells: Array.from({ length: people }, (_, i) => (i < items.length ? items[i] : null)),
    marks,
    pointers: items.length ? { front: 0, back: items.length - 1 } : {},
  });
  const add = (items, marks, lineNo, caption) => steps.push({ rows: [row(items, marks)], line: lineNo, caption, size: items.length });

  add(line, {}, 2, `${people} people join the queue in order. Every ${ordinal(skip)} person to hold the potato is out`);
  while (line.length > 1) {
    for (let count = 1; count < skip; count++) {
      add(line, { 0: 'compare' }, 4, `count ${count}: person ${line[0]} is safe. Dequeue from the front...`);
      line = [...line.slice(1), line[0]];
      add(line, { [line.length - 1]: 'new' }, 4, `...and enqueue at the back. The line has rotated by one`);
    }
    add(line, { 0: 'removed' }, 5, `count ${skip}: person ${line[0]} is out`);
    line = line.slice(1);
  }
  add(line, { 0: 'found' }, 7, `one person is left: person ${line[0]} wins`);
  return { steps, final: state };
}

function ordinal(n) {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th');
  return `${n}${suffix}`;
}
