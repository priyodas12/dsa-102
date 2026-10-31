// Pure step generators for the array topic. No DOM, so they run under node:test.
//
// State:  { data: [value|null, ...] (length = capacity), size }
// Step:   { rows, caption, line, size }  (see core/dom.js renderRows)
// Every operation returns { steps, final } and never mutates its input.

export const programs = {
  access: [
    'int get(int index) {',
    '  if (index < 0 || index >= size) throw new IndexOutOfBoundsException();',
    '  return data[index];',
    '}',
  ],
  search: [
    'int indexOf(int target) {',
    '  for (int i = 0; i < size; i++) {',
    '    if (data[i] == target) return i;',
    '  }',
    '  return -1;',
    '}',
  ],
  insert: [
    'void insert(int index, int value) {',
    '  if (size == data.length) grow();',
    '  for (int i = size; i > index; i--)',
    '    data[i] = data[i - 1];',
    '  data[index] = value;',
    '  size++;',
    '}',
    '',
    'void grow() {',
    '  int[] bigger = new int[data.length * 2];',
    '  for (int i = 0; i < size; i++) bigger[i] = data[i];',
    '  data = bigger;',
    '}',
  ],
  delete: [
    'void delete(int index) {',
    '  for (int i = index; i < size - 1; i++)',
    '    data[i] = data[i + 1];',
    '  data[--size] = 0; // clear the tail slot',
    '}',
  ],
};

export function createState(values, capacity = Math.max(values.length, 1)) {
  if (values.length > capacity) throw new RangeError('more values than capacity');
  const data = Array(capacity).fill(null);
  values.forEach((v, i) => { data[i] = v; });
  return { data, size: values.length };
}

const row = (cells, marks = {}, pointers = {}, label = 'data') => ({
  label,
  cells: cells.slice(),
  marks,
  pointers,
});

function checkIndex(index, limit, what) {
  if (!Number.isInteger(index) || index < 0 || index > limit) {
    throw new RangeError(`${what}: index ${index} out of range 0..${limit}`);
  }
}

export function access(state, index) {
  checkIndex(index, state.size - 1, 'access');
  const { data, size } = state;
  const steps = [
    { rows: [row(data)], size, line: 0, caption: `get(${index}): read the element at index ${index}` },
    {
      rows: [row(data, {}, { i: index })],
      size,
      line: 2,
      caption: `address = start + ${index} × element size, so one jump reaches it. No loop needed: O(1)`,
    },
    {
      rows: [row(data, { [index]: 'found' }, { i: index })],
      size,
      line: 2,
      caption: `returns ${data[index]}`,
    },
  ];
  return { steps, final: state };
}

export function search(state, target) {
  const { data, size } = state;
  const steps = [
    { rows: [row(data)], size, line: 0, caption: `indexOf(${target}): look for ${target}, starting at index 0` },
  ];
  for (let i = 0; i < size; i++) {
    steps.push({
      rows: [row(data, { [i]: 'compare' }, { i })],
      size,
      line: 2,
      caption: `data[${i}] is ${data[i]}. Is it ${target}? ${data[i] === target ? 'Yes' : 'No, move on'}`,
    });
    if (data[i] === target) {
      steps.push({
        rows: [row(data, { [i]: 'found' }, { i })],
        size,
        line: 2,
        caption: `found ${target} at index ${i} after ${i + 1} comparison${i ? 's' : ''}`,
      });
      return { steps, final: state };
    }
  }
  steps.push({
    rows: [row(data)],
    size,
    line: 4,
    caption: `checked all ${size} elements, ${target} is not present: return -1 (worst case, O(n))`,
  });
  return { steps, final: state };
}

export function insert(state, index, value) {
  checkIndex(index, state.size, 'insert');
  let data = state.data.slice();
  let size = state.size;
  const steps = [];
  const push = (rows, line, caption) => steps.push({ rows, line, caption, size });

  push([row(data)], 0, `insert(${index}, ${value}): put ${value} at index ${index}`);

  if (size === data.length) {
    push([row(data)], 1, `size ${size} equals capacity ${data.length}: the array is full, so it must grow`);
    const bigger = Array(data.length * 2).fill(null);
    push([row(data, {}, {}, 'data (old)'), row(bigger, {}, {}, 'bigger (new)')], 9,
      `allocate a new array with double the capacity (${bigger.length}). Arrays cannot resize in place`);
    for (let i = 0; i < size; i++) {
      bigger[i] = data[i];
      push([row(data, { [i]: 'compare' }, { i }, 'data (old)'), row(bigger, { [i]: 'new' }, { i }, 'bigger (new)')], 10,
        `copy data[${i}] = ${data[i]} into bigger[${i}]. Copying n elements costs O(n)`);
    }
    data = bigger;
    push([row(data)], 11, `data now refers to the bigger array; the old one is garbage collected`);
  }

  for (let i = size; i > index; i--) {
    data[i] = data[i - 1];
    push([row(data, { [i - 1]: 'compare', [i]: 'shift' }, { i })], 3,
      `shift right: data[${i}] = data[${i - 1}] (${data[i]}). Work from the end so nothing is overwritten`);
  }
  if (size === index) {
    push([row(data)], 2, `index ${index} is the end, so nothing needs to shift`);
  }

  data[index] = value;
  push([row(data, { [index]: 'new' }, { i: index })], 4, `data[${index}] = ${value}: the gap is free to use`);
  size++;
  push([row(data, { [index]: 'new' })], 5, `size is now ${size}. Insert cost: ${size - 1 - index} shift${size - 1 - index === 1 ? '' : 's'}`);
  return { steps, final: { data, size } };
}

export function remove(state, index) {
  checkIndex(index, state.size - 1, 'delete');
  const data = state.data.slice();
  let size = state.size;
  const steps = [];
  const push = (rows, line, caption) => steps.push({ rows, line, caption, size });

  push([row(data, { [index]: 'removed' }, { i: index })], 0, `delete(${index}): remove ${data[index]} at index ${index}`);
  for (let i = index; i < size - 1; i++) {
    data[i] = data[i + 1];
    push([row(data, { [i]: 'shift', [i + 1]: 'compare' }, { i })], 2,
      `shift left: data[${i}] = data[${i + 1}] (${data[i]}) to close the gap`);
  }
  data[size - 1] = null;
  size--;
  push([row(data)], 3, `clear the last slot and set size to ${size}. Delete cost: ${size - index} shift${size - index === 1 ? '' : 's'}`);
  return { steps, final: { data, size } };
}
