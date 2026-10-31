// Pure step generators for the linked list topic: a singly linked list with only a head pointer.
//
// State: { items: [{ id, value }, ...] in list order, nextId }. Ids are stable, so a node keeps its
// identity while the list changes around it.
// Step: { list: { nodes, marks, edgeMarks, pointers }, caption, line, size }
//   nodes: [{ id, value, next: id|null, lifted? }] in left-to-right drawing order. The order is
//   not always the list order (reverse flips the arrows without moving the boxes), and `lifted`
//   draws a node below the row while it is not linked in yet (or no longer is).
//   pointers: { name: id|null }, edgeMarks: { id: kind } marks the arrow leaving that node.
// Every operation returns { steps, final } and never mutates its input.

export const MAX_NODES = 10;

export const programs = {
  prepend: [
    'void addFirst(int value) {',
    '  Node node = new Node(value);',
    '  node.next = head; // the new node points at the old first node',
    '  head = node;      // head now points at the new node',
    '  size++;',
    '}',
  ],
  append: [
    'void addLast(int value) {',
    '  Node node = new Node(value);',
    '  if (head == null) { head = node; return; }',
    '  Node curr = head;',
    '  while (curr.next != null) curr = curr.next; // walk to the last node',
    '  curr.next = node;',
    '}',
  ],
  insertAt: [
    'void add(int index, int value) {',
    '  if (index == 0) { addFirst(value); return; }',
    '  Node prev = head;',
    '  for (int i = 0; i < index - 1; i++) prev = prev.next; // stop just before the position',
    '  Node node = new Node(value);',
    '  node.next = prev.next; // link the new node to what follows first...',
    '  prev.next = node;      // ...then link the previous node to it',
    '  size++;',
    '}',
  ],
  removeAt: [
    'void removeAt(int index) {',
    '  if (index == 0) { head = head.next; size--; return; }',
    '  Node prev = head;',
    '  for (int i = 0; i < index - 1; i++) prev = prev.next;',
    '  Node target = prev.next;',
    '  prev.next = target.next; // skip over the target',
    '  size--; // target is unreachable now: the garbage collector frees it',
    '}',
  ],
  search: [
    'int indexOf(int target) {',
    '  Node curr = head;',
    '  int i = 0;',
    '  while (curr != null) {',
    '    if (curr.value == target) return i;',
    '    curr = curr.next;',
    '    i++;',
    '  }',
    '  return -1;',
    '}',
  ],
  reverse: [
    'Node reverse(Node head) {',
    '  Node prev = null;',
    '  Node curr = head;',
    '  while (curr != null) {',
    '    Node next = curr.next; // remember the rest before cutting the link',
    '    curr.next = prev;      // flip the arrow',
    '    prev = curr;           // move both pointers one step forward',
    '    curr = next;',
    '  }',
    '  return prev; // prev is the new head',
    '}',
  ],
  cycle: [
    'boolean hasCycle(Node head) {',
    '  Node slow = head, fast = head;',
    '  while (fast != null && fast.next != null) {',
    '    slow = slow.next;       // one step',
    '    fast = fast.next.next;  // two steps',
    '    if (slow == fast) return true; // the fast pointer lapped the slow one',
    '  }',
    '  return false; // fast reached the end: the list has an end, so no cycle',
    '}',
  ],
};

// --- helpers ---------------------------------------------------------------

const chain = (items) => items.map((it, i) => ({ id: it.id, value: it.value, next: items[i + 1]?.id ?? null }));
const patch = (nodes, id, change) => nodes.map((n) => (n.id === id ? { ...n, ...change } : n));
const headOf = (items) => items[0]?.id ?? null;

function checkValue(v) {
  if (!Number.isInteger(v) || v < -99 || v > 999) throw new RangeError('value must be a whole number from -99 to 999');
}

function checkIndex(index, max, what) {
  if (!Number.isInteger(index) || index < 0 || index > max) throw new RangeError(`${what}: index ${index} is out of range 0 to ${max}`);
}

function recorder() {
  const steps = [];
  const emit = (nodes, { marks = {}, edgeMarks = {}, pointers = {} }, line, caption) => {
    steps.push({
      list: { nodes, marks, edgeMarks, pointers },
      line,
      caption,
      size: nodes.filter((n) => !n.lifted).length,
    });
  };
  return { steps, emit };
}

export function createState(values = []) {
  return { items: values.map((value, i) => ({ id: i + 1, value })), nextId: values.length + 1 };
}

export const valuesOf = (state) => state.items.map((it) => it.value);

// --- insert ----------------------------------------------------------------

// The three-step head insertion shared by prepend() and insertAt(0, ...).
function insertHead(items, node, emit, L) {
  const old = headOf(items);
  const drawn = [{ id: node.id, value: node.value, next: null, lifted: true }, ...chain(items)];
  emit(drawn, { marks: { [node.id]: 'new' }, pointers: { head: old } }, L.create,
    `create a node holding ${node.value}. It is not connected to anything yet`);
  emit(patch(drawn, node.id, { next: old }), { marks: { [node.id]: 'new' }, edgeMarks: { [node.id]: 'new' }, pointers: { head: old } }, L.link,
    old === null ? 'node.next = head: the list is empty, so head is null and the new node points to null' : 'node.next = head: the new node points at the old first node. Link the new node first so the old list is never lost');
  const after = [node, ...items];
  emit(chain(after), { marks: { [node.id]: 'new' }, pointers: { head: node.id } }, L.head,
    'head = node: the list now starts at the new node. Nothing else moved, so this is O(1)');
  return after;
}

export function prepend(state, value) {
  checkValue(value);
  if (state.items.length >= MAX_NODES) throw new RangeError(`this demo list holds at most ${MAX_NODES} nodes`);
  const { steps, emit } = recorder();
  const node = { id: state.nextId, value };
  emit(chain(state.items), { pointers: { head: headOf(state.items) } }, 0, `addFirst(${value}): put ${value} at the front of the list`);
  const items = insertHead(state.items, node, emit, { create: 1, link: 2, head: 3 });
  return { steps, final: { items, nextId: state.nextId + 1 } };
}

export function append(state, value) {
  checkValue(value);
  if (state.items.length >= MAX_NODES) throw new RangeError(`this demo list holds at most ${MAX_NODES} nodes`);
  const { items } = state;
  const { steps, emit } = recorder();
  const node = { id: state.nextId, value };
  const base = chain(items);
  const lifted = [...base, { id: node.id, value, next: null, lifted: true }];
  const final = { items: [...items, node], nextId: state.nextId + 1 };

  emit(base, { pointers: { head: headOf(items) } }, 0, `addLast(${value}): put ${value} at the end of the list`);
  emit(lifted, { marks: { [node.id]: 'new' }, pointers: { head: headOf(items) } }, 1, `create a node holding ${value}, not connected yet`);
  if (items.length === 0) {
    emit(chain(final.items), { marks: { [node.id]: 'new' }, pointers: { head: node.id } }, 2, 'the list is empty, so the new node simply becomes head');
    return { steps, final };
  }
  const head = headOf(items);
  emit(lifted, { marks: { [head]: 'active' }, pointers: { head, curr: head } }, 3, 'we only know the head, so start there. There is no shortcut to the last node');
  for (let i = 0; i < items.length - 1; i++) {
    emit(lifted, { marks: { [items[i].id]: 'compare' }, pointers: { head, curr: items[i].id } }, 4,
      `curr.next is not null (it is ${items[i + 1].value}), so move curr forward`);
    emit(lifted, { marks: { [items[i + 1].id]: 'active' }, pointers: { head, curr: items[i + 1].id } }, 4, `curr is now ${items[i + 1].value}`);
  }
  const last = items.at(-1).id;
  emit(lifted, { marks: { [last]: 'found' }, pointers: { head, curr: last } }, 4,
    `curr.next is null: this is the last node. Walking here took ${items.length - 1} step${items.length === 2 ? '' : 's'}, so appending is O(n)`);
  emit(chain(final.items), { marks: { [node.id]: 'new' }, edgeMarks: { [last]: 'new' }, pointers: { head, curr: last } }, 5, `curr.next = node: the last node now points at the new one`);
  return { steps, final };
}

export function insertAt(state, index, value) {
  checkValue(value);
  checkIndex(index, state.items.length, 'insert');
  if (state.items.length >= MAX_NODES) throw new RangeError(`this demo list holds at most ${MAX_NODES} nodes`);
  const { items } = state;
  const { steps, emit } = recorder();
  const node = { id: state.nextId, value };
  const nextId = state.nextId + 1;

  emit(chain(items), { pointers: { head: headOf(items) } }, 0, `add(${index}, ${value}): insert ${value} so it ends up at index ${index}`);
  if (index === 0) {
    emit(chain(items), { pointers: { head: headOf(items) } }, 1, 'index 0 is the special case: there is no node before it, so we change head instead');
    return { steps, final: { items: insertHead(items, node, emit, { create: 1, link: 1, head: 1 }), nextId } };
  }

  const head = headOf(items);
  emit(chain(items), { marks: { [head]: 'active' }, pointers: { head, prev: head } }, 2, 'prev starts at the head');
  for (let i = 0; i < index - 1; i++) {
    emit(chain(items), { marks: { [items[i + 1].id]: 'active' }, pointers: { head, prev: items[i + 1].id } }, 3,
      `step ${i + 1} of ${index - 1}: move prev forward to ${items[i + 1].value}`);
  }
  const prev = items[index - 1];
  const after = items[index] ?? null;
  // The new node is drawn between prev and its successor, lifted until it is linked in.
  const withLinks = (extra) => {
    let nodes = chain(items).slice(0, index).concat([{ id: node.id, value, next: null, lifted: true }], chain(items).slice(index));
    for (const [id, change] of extra) nodes = patch(nodes, id, change);
    return nodes;
  };

  emit(withLinks([]), { marks: { [prev.id]: 'active' }, pointers: { head, prev: prev.id } }, 3,
    `prev stops at ${prev.value}, the node just before index ${index}. We need it because a singly linked list cannot go backwards`);
  emit(withLinks([]), { marks: { [node.id]: 'new', [prev.id]: 'active' }, pointers: { head, prev: prev.id } }, 4, `create a node holding ${value}, not connected yet`);
  emit(withLinks([[node.id, { next: after?.id ?? null }]]), { marks: { [node.id]: 'new', [prev.id]: 'active' }, edgeMarks: { [node.id]: 'new' }, pointers: { head, prev: prev.id } }, 5,
    `node.next = prev.next: the new node points at ${after ? after.value : 'null'}, the node that will follow it. The old links are still all intact`);
  const final = [...items.slice(0, index), node, ...items.slice(index)];
  emit(chain(final), { marks: { [node.id]: 'new' }, edgeMarks: { [prev.id]: 'new' }, pointers: { head, prev: prev.id } }, 6,
    `prev.next = node: now ${prev.value} points at the new node. Doing these two links in the other order would lose the rest of the list`);
  return { steps, final: { items: final, nextId } };
}

// --- remove ----------------------------------------------------------------

export function removeAt(state, index) {
  const { items } = state;
  if (items.length === 0) throw new RangeError('the list is empty, there is nothing to remove');
  checkIndex(index, items.length - 1, 'remove');
  const { steps, emit } = recorder();
  const head = headOf(items);
  const final = { items: items.filter((_, i) => i !== index), nextId: state.nextId };

  emit(chain(items), { pointers: { head } }, 0, `removeAt(${index}): unlink the node at index ${index}`);
  if (index === 0) {
    const second = items[1]?.id ?? null;
    emit(chain(items), { marks: { [head]: 'removed' }, pointers: { head } }, 1, `index 0 is the special case: the first node (${items[0].value}) is the one to remove`);
    emit(patch(chain(items), head, { lifted: true }), { marks: { [head]: 'removed' }, pointers: { head: second } }, 1,
      `head = head.next: head moves on to ${second === null ? 'null (the list becomes empty)' : items[1].value}. The old first node is unreachable`);
    emit(chain(final.items), { pointers: { head: second } }, 1, 'the old first node is gone, freed by the garbage collector. O(1)');
    return { steps, final };
  }

  emit(chain(items), { marks: { [head]: 'active' }, pointers: { head, prev: head } }, 2, 'prev starts at the head');
  for (let i = 0; i < index - 1; i++) {
    emit(chain(items), { marks: { [items[i + 1].id]: 'active' }, pointers: { head, prev: items[i + 1].id } }, 3,
      `step ${i + 1} of ${index - 1}: move prev forward to ${items[i + 1].value}`);
  }
  const prev = items[index - 1];
  const target = items[index];
  const after = items[index + 1] ?? null;
  emit(chain(items), { marks: { [prev.id]: 'active', [target.id]: 'removed' }, pointers: { head, prev: prev.id, target: target.id } }, 4,
    `target = prev.next: ${target.value} is the node to remove, and prev (${prev.value}) is the one before it`);
  const skipped = patch(patch(chain(items), prev.id, { next: after?.id ?? null }), target.id, { lifted: true });
  emit(skipped, { marks: { [prev.id]: 'active', [target.id]: 'removed' }, edgeMarks: { [prev.id]: 'new' }, pointers: { head, prev: prev.id, target: target.id } }, 5,
    `prev.next = target.next: ${prev.value} now points past ${target.value} to ${after ? after.value : 'null'}. The removed node is skipped`);
  emit(chain(final.items), { pointers: { head, prev: prev.id } }, 6, `nothing refers to ${target.value} any more, so it is gone. Reaching the spot took ${index - 1} steps, so removal is O(n); the unlinking itself is O(1)`);
  return { steps, final };
}

// --- search ----------------------------------------------------------------

export function search(state, target) {
  checkValue(target);
  const { items } = state;
  const { steps, emit } = recorder();
  const nodes = chain(items);
  const head = headOf(items);

  emit(nodes, { pointers: { head } }, 0, `indexOf(${target}): follow the arrows from the head, looking for ${target}`);
  if (items.length === 0) {
    emit(nodes, { pointers: { head, curr: null } }, 3, 'the list is empty: curr is null straight away, so the answer is -1');
    return { steps, final: state };
  }
  emit(nodes, { marks: { [head]: 'active' }, pointers: { head, curr: head } }, 1, 'curr starts at the head');
  for (let i = 0; i < items.length; i++) {
    const { id, value } = items[i];
    if (value === target) {
      emit(nodes, { marks: { [id]: 'found' }, pointers: { head, curr: id } }, 4, `curr.value is ${value}, which is ${target}: found at index ${i} after ${i + 1} node${i ? 's' : ''}`);
      return { steps, final: state };
    }
    emit(nodes, { marks: { [id]: 'compare' }, pointers: { head, curr: id } }, 4, `curr.value is ${value}, not ${target}. Move on`);
    if (i + 1 < items.length) emit(nodes, { marks: { [items[i + 1].id]: 'active' }, pointers: { head, curr: items[i + 1].id } }, 5, 'curr = curr.next');
  }
  emit(nodes, { pointers: { head, curr: null } }, 3, `curr = curr.next is null: the end of the list. ${target} is not present, return -1 (worst case, all ${items.length} nodes checked: O(n))`);
  return { steps, final: state };
}

// --- interview problem: reverse a linked list (LeetCode 206) ---------------

export function reverse(state) {
  const { items } = state;
  const { steps, emit } = recorder();
  let nodes = chain(items);
  const head = headOf(items);

  emit(nodes, { pointers: { head } }, 0, 'reverse: flip every arrow so the list runs the other way, without creating any new nodes');
  if (items.length === 0) {
    emit(nodes, { pointers: { head: null } }, 9, 'the list is empty: there is nothing to reverse');
    return { steps, final: state };
  }
  emit(nodes, { pointers: { head, prev: null } }, 1, 'prev = null: the new last node will point at nothing');
  emit(nodes, { marks: { [head]: 'active' }, pointers: { head, prev: null, curr: head } }, 2, 'curr = head: start with the first node');

  let prev = null;
  for (let i = 0; i < items.length; i++) {
    const curr = items[i].id;
    const next = items[i + 1]?.id ?? null;
    const label = (id) => (id === null ? 'null' : items.find((it) => it.id === id).value);
    emit(nodes, { marks: { [curr]: 'active' }, pointers: { head, prev, curr, next } }, 4,
      `next = curr.next (${label(next)}): save the rest of the list before cutting the link, or it would be lost`);
    nodes = patch(nodes, curr, { next: prev });
    emit(nodes, { marks: { [curr]: 'active' }, edgeMarks: { [curr]: 'new' }, pointers: { head, prev, curr, next } }, 5,
      `curr.next = prev: the arrow of ${label(curr)} now points ${prev === null ? 'to null' : `back to ${label(prev)}`}`);
    prev = curr;
    emit(nodes, { marks: { [prev]: 'visited' }, pointers: { head, prev, curr: next } }, 7,
      `prev = curr, curr = next: both pointers move one node forward${next === null ? '. curr is null, so we are done' : ''}`);
  }
  const reversed = items.slice().reverse();
  emit(nodes, { pointers: { head, prev, curr: null } }, 9, `the loop ends when curr is null. prev (${items.at(-1).value}) is the first node of the reversed list`);
  emit(chain(reversed), { pointers: { head: prev } }, 9, `head = prev: redrawn in the new order, ${reversed.map((it) => it.value).join(' → ')}. Reversing took one pass and no extra memory: O(n) time, O(1) space`);
  return { steps, final: { items: reversed, nextId: state.nextId } };
}

// --- interview problem: detect a cycle with slow and fast pointers (LeetCode 141) ---

export function hasCycle(state, tailTo) {
  const { items } = state;
  if (!Number.isInteger(tailTo) || tailTo < -1 || tailTo >= Math.max(items.length, 1)) {
    throw new RangeError(`tailTo must be -1 (no cycle) or a node index from 0 to ${Math.max(items.length - 1, 0)}`);
  }
  const { steps, emit } = recorder();
  let nodes = chain(items);
  if (items.length === 0) {
    emit(nodes, { pointers: { head: null } }, 0, 'the list is empty: it has no cycle');
    return { steps, final: state };
  }
  const last = items.at(-1).id;
  const head = headOf(items);
  const edgeMarks = {};
  if (tailTo >= 0) {
    nodes = patch(nodes, last, { next: items[tailTo].id });
    edgeMarks[last] = 'compare';
  }
  const idOf = (i) => items[i].id;
  const nextIndex = (i) => {
    const id = nodes[i].next;
    return id === null ? null : items.findIndex((it) => it.id === id);
  };

  emit(nodes, { edgeMarks, pointers: { head } }, 0, tailTo >= 0
    ? `the last node (${items.at(-1).value}) points back to index ${tailTo}, so this list loops forever. Following next would never reach null. Can we detect that without a seen set?`
    : 'this list ends in null. Floyd\'s two-pointer method should find no cycle');
  let slow = 0;
  let fast = 0;
  emit(nodes, { edgeMarks, marks: { [head]: 'active' }, pointers: { head, slow: head, fast: head } }, 1, 'slow and fast both start at the head');
  for (;;) {
    const f1 = nextIndex(fast);
    if (f1 === null || nextIndex(f1) === null) {
      emit(nodes, { edgeMarks, marks: { [idOf(fast)]: 'compare' }, pointers: { head, slow: idOf(slow), fast: idOf(fast) } }, 2,
        `fast has hit the end of the list (it cannot take two more steps): the list has an end, so there is no cycle. Return false`);
      break;
    }
    slow = nextIndex(slow);
    fast = nextIndex(f1);
    emit(nodes, { edgeMarks, marks: { [idOf(slow)]: 'active', [idOf(fast)]: 'active' }, pointers: { head, slow: idOf(slow), fast: idOf(fast) } }, 4,
      `slow moves 1 step (to ${items[slow].value}), fast moves 2 steps (to ${items[fast].value})`);
    if (slow === fast) {
      emit(nodes, { edgeMarks, marks: { [idOf(slow)]: 'found' }, pointers: { head, slow: idOf(slow), fast: idOf(fast) } }, 5,
        `slow and fast are on the same node (${items[slow].value}): the fast pointer lapped the slow one, which only happens inside a cycle. Return true`);
      break;
    }
  }
  return { steps, final: state };
}
