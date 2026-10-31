// Pure step generators for the stack topic (array-backed, fixed capacity).
//
// State: { items: [...bottom to top], capacity }
// Overflow and underflow are shown as steps, not thrown, because seeing them is the lesson.
// Every operation returns { steps, final } and never mutates its input.

export const programs = {
  push: [
    'void push(int value) {',
    '  if (top == data.length - 1) throw new StackOverflowError();',
    '  top++;',
    '  data[top] = value;',
    '}',
  ],
  pop: [
    'int pop() {',
    '  if (top == -1) throw new EmptyStackException();',
    '  int value = data[top];',
    '  data[top--] = 0; // clear the slot',
    '  return value;',
    '}',
  ],
  peek: [
    'int peek() {',
    '  if (top == -1) throw new EmptyStackException();',
    '  return data[top];',
    '}',
  ],
  brackets: [
    'boolean isBalanced(String s) {',
    '  Deque<Character> stack = new ArrayDeque<>();',
    '  for (char c : s.toCharArray()) {',
    '    if ("([{".indexOf(c) >= 0) stack.push(c);',
    '    else if (")]}".indexOf(c) >= 0) {',
    '      if (stack.isEmpty() || !matches(stack.pop(), c)) return false;',
    '    }',
    '  }',
    '  return stack.isEmpty();',
    '}',
  ],
};

export function createState(items, capacity = Math.max(items.length, 1)) {
  if (items.length > capacity) throw new RangeError('more items than capacity');
  return { items: items.slice(), capacity };
}

// Bottom of the stack is index 0. `top` is -1 when the stack is empty.
const stackRow = (items, capacity, marks = {}, pointers, label = 'stack') => ({
  label,
  vertical: true,
  cells: Array.from({ length: capacity }, (_, i) => (i < items.length ? items[i] : null)),
  marks,
  pointers: pointers ?? (items.length ? { top: items.length - 1 } : {}),
});

const top = (items) => items.length - 1;

export function push(state, value) {
  const { items, capacity } = state;
  const steps = [];
  const add = (rows, line, caption, size = items.length) => steps.push({ rows, line, caption, size });

  add([stackRow(items, capacity)], 0, `push(${value}): place ${value} on top of the stack`);
  if (items.length === capacity) {
    add([stackRow(items, capacity, { [top(items)]: 'error' })], 1,
      `top is ${top(items)}, the last slot: the stack is full. Overflow, so ${value} is rejected`);
    return { steps, final: state };
  }
  add([stackRow(items, capacity)], 1, `top is ${top(items)}, there is room, so no overflow`);
  add([stackRow(items, capacity, {}, { top: items.length })], 2,
    `top++ moves the top pointer up to index ${items.length}`);
  const next = [...items, value];
  add([stackRow(next, capacity, { [top(next)]: 'new' })], 3, `data[${top(next)}] = ${value}. Push is O(1): no shifting`, next.length);
  return { steps, final: { items: next, capacity } };
}

export function pop(state) {
  const { items, capacity } = state;
  const steps = [];
  const add = (rows, line, caption, size = items.length) => steps.push({ rows, line, caption, size });

  add([stackRow(items, capacity)], 0, 'pop(): remove and return the element on top');
  if (items.length === 0) {
    add([stackRow(items, capacity)], 1, 'top is -1: the stack is empty. Underflow, there is nothing to pop');
    return { steps, final: state };
  }
  const value = items[top(items)];
  add([stackRow(items, capacity, { [top(items)]: 'found' })], 2, `read the top element: ${value}`);
  const rest = items.slice(0, -1);
  add([stackRow(rest, capacity)], 3,
    `clear the slot and move top down to ${top(rest)}. Nothing below ${value} moved: O(1)`, rest.length);
  add([stackRow(rest, capacity)], 4, `return ${value}. Last in, first out: it was the most recent push`, rest.length);
  return { steps, final: { items: rest, capacity } };
}

export function peek(state) {
  const { items, capacity } = state;
  const steps = [{ rows: [stackRow(items, capacity)], line: 0, size: items.length, caption: 'peek(): look at the top element without removing it' }];
  if (items.length === 0) {
    steps.push({ rows: [stackRow(items, capacity)], line: 1, size: 0, caption: 'top is -1: the stack is empty, so there is nothing to peek at' });
  } else {
    steps.push({
      rows: [stackRow(items, capacity, { [top(items)]: 'found' })],
      line: 2,
      size: items.length,
      caption: `returns ${items[top(items)]}. The stack is unchanged`,
    });
  }
  return { steps, final: state };
}

// Interview problem: are the brackets in `text` balanced? (LeetCode 20)
const PAIRS = { ')': '(', ']': '[', '}': '{' };
const OPENERS = new Set(Object.values(PAIRS));

export function brackets(state, text) {
  const chars = [...text].filter((c) => OPENERS.has(c) || c in PAIRS).slice(0, 12);
  if (chars.length === 0) throw new RangeError('enter some brackets, for example {[()]}');

  const capacity = chars.length;
  const steps = [];
  let stack = [];
  const inputRow = (i, mark) => ({
    label: 'input',
    cells: chars,
    marks: i === null ? {} : { [i]: mark },
    pointers: i === null ? {} : { i },
  });
  const add = (i, mark, stackMarks, line, caption, items = stack) =>
    steps.push({ rows: [inputRow(i, mark), stackRow(items, capacity, stackMarks)], line, caption, size: items.length });

  add(null, null, {}, 0, `isBalanced("${chars.join('')}"): every closer must match the most recent unclosed opener`);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (OPENERS.has(c)) {
      stack = [...stack, c];
      add(i, 'active', { [top(stack)]: 'new' }, 3, `'${c}' opens a bracket: push it and wait for its partner`);
      continue;
    }
    const need = PAIRS[c];
    if (stack.length === 0) {
      add(i, 'error', {}, 5, `'${c}' closes a bracket but the stack is empty: nothing to match. Not balanced`);
      return { steps, final: state };
    }
    add(i, 'active', { [top(stack)]: 'compare' }, 5, `'${c}' needs '${need}'. The top of the stack is '${stack[top(stack)]}'`);
    if (stack[top(stack)] !== need) {
      add(i, 'error', { [top(stack)]: 'error' }, 5, `'${stack[top(stack)]}' does not match '${c}': not balanced`);
      return { steps, final: state };
    }
    stack = stack.slice(0, -1);
    add(i, 'active', {}, 5, `match: pop '${need}'. The pair is closed`);
  }
  if (stack.length === 0) {
    add(null, null, {}, 8, 'input finished and the stack is empty: every opener was closed. Balanced');
  } else {
    add(null, null, { [top(stack)]: 'error' }, 8, `input finished but ${stack.length} opener${stack.length === 1 ? '' : 's'} never closed. Not balanced`);
  }
  return { steps, final: state };
}
