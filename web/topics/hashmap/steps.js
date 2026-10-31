// Pure step generators for the hash map topic: separate chaining, doubling when the load gets high.
//
// State: { capacity, buckets: [[{ key, value }, ...], ...], size, keyType: 'string' | 'int' }
// Keys are 1 to 4 letters or digits so the hash arithmetic stays small enough to read. A string key
// uses Java's String.hashCode (h = h * 31 + char); an int key hashes to itself (Integer.hashCode).
// New entries join the END of their bucket's chain. The table doubles when size > 0.75 × capacity.
// Step: { rows, caption, line, size }. Bucket rows have `chain: true` (see core/dom.js).
// Every operation returns { steps, final } and never mutates its input.

export const MAX_ENTRIES = 10;
export const LOAD_FACTOR = 0.75;

export const programs = {
  put: [
    'void put(String key, int value) {',
    '  int hash = key.hashCode();',
    '  int index = Math.floorMod(hash, buckets.length);',
    '  for (Entry e : buckets[index]) {',
    '    if (e.key.equals(key)) { e.value = value; return; } // key exists: update',
    '  }',
    '  buckets[index].add(new Entry(key, value)); // new key: join the chain',
    '  if (++size > buckets.length * 0.75) resize(); // too full: double and rehash',
    '}',
    '',
    'void resize() {',
    '  List<Entry>[] old = buckets;',
    '  buckets = new List[old.length * 2];',
    '  for (List<Entry> chain : old)',
    '    for (Entry e : chain) buckets[indexFor(e.key)].add(e); // every entry gets a new index',
    '}',
  ],
  get: [
    'Integer get(String key) {',
    '  int index = Math.floorMod(key.hashCode(), buckets.length);',
    '  for (Entry e : buckets[index]) {',
    '    if (e.key.equals(key)) return e.value;',
    '  }',
    '  return null; // not in its bucket, so not in the map',
    '}',
  ],
  remove: [
    'void remove(String key) {',
    '  int index = Math.floorMod(key.hashCode(), buckets.length);',
    '  if (buckets[index].removeIf(e -> e.key.equals(key))) size--;',
    '}',
  ],
  twoSum: [
    'int[] twoSum(int[] nums, int target) {',
    '  Map<Integer, Integer> seen = new HashMap<>(); // value -> index',
    '  for (int i = 0; i < nums.length; i++) {',
    '    int need = target - nums[i];',
    '    if (seen.containsKey(need)) return new int[] {seen.get(need), i};',
    '    seen.put(nums[i], i);',
    '  }',
    '  return null;',
    '}',
  ],
};

// --- hashing ---------------------------------------------------------------

export function hashOf(key, keyType) {
  if (keyType === 'int') return Number(key);
  let h = 0;
  for (const ch of key) h = Math.imul(h, 31) + ch.charCodeAt(0) | 0;
  return h;
}

export const indexFor = (hash, capacity) => ((hash % capacity) + capacity) % capacity;

function hashCaption(key, keyType, h) {
  if (keyType === 'int') return `hash(${key}): an Integer hashes to the number itself, ${h}`;
  const parts = [];
  let acc = 0;
  [...key].forEach((ch, i) => {
    const code = ch.charCodeAt(0);
    parts.push(i === 0 ? `${ch}=${code}` : `${acc}×31+${code}=${acc * 31 + code}`);
    acc = acc * 31 + code;
  });
  return `hash("${key}"): ${parts.join(', then ')}. The hash is ${h}`;
}

function checkKey(key) {
  if (!/^[A-Za-z0-9]{1,4}$/.test(key)) throw new RangeError('key must be 1 to 4 letters or digits');
  return key;
}

function checkValue(v, what = 'value') {
  if (!Number.isInteger(v) || v < -99 || v > 999) throw new RangeError(`${what} must be a whole number from -99 to 999`);
}

export function parseNumbers(text, max) {
  const parts = String(text).split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) throw new RangeError('enter some numbers, for example 2, 7, 11, 15');
  if (parts.length > max) throw new RangeError(`enter at most ${max} numbers`);
  return parts.map((p) => {
    const v = Number(p);
    checkValue(v, `"${p}"`);
    return v;
  });
}

const label = (e) => `${e.key}:${e.value}`;

// One row per bucket. marks: { bucketIndex: { positionInChain: kind } }.
export function bucketRows(buckets, highlight = null, marks = {}) {
  return buckets.map((chain, i) => ({
    label: `[${i}]`,
    chain: true,
    emptyText: 'empty',
    highlight: i === highlight,
    cells: chain.map(label),
    marks: marks[i] ?? {},
    pointers: {},
  }));
}

// --- the simulation ----------------------------------------------------------

// Works on a copy of `state`, recording steps. `prefix` adds rows above the table (used by twoSum).
function simulate(state, { prefix = () => [], silent = false } = {}) {
  const keyType = state.keyType;
  let capacity = state.capacity;
  let buckets = state.buckets.map((chain) => chain.map((e) => ({ ...e })));
  let size = state.size;
  const steps = [];

  const emit = (line, caption, { table = buckets, hl = null, marks = {}, extra = [] } = {}) => {
    if (silent) return;
    steps.push({ rows: [...prefix(), ...extra, ...bucketRows(table, hl, marks)], line, caption, size });
  };
  const snapshot = () => ({ capacity, buckets: buckets.map((c) => c.map((e) => ({ ...e }))), size, keyType });

  // Hash the key and pick its bucket (two steps, so the learner sees both parts).
  function locate(key, L) {
    const h = hashOf(key, keyType);
    emit(L.hash, hashCaption(key, keyType, h));
    const idx = indexFor(h, capacity);
    emit(L.index, `index = ${h} mod ${capacity} = ${idx}. Only bucket ${idx} can hold "${key}", so no other bucket is ever searched`, { hl: idx });
    return idx;
  }

  function resize(L) {
    const newCapacity = capacity * 2;
    const next = Array.from({ length: newCapacity }, () => []);
    const pending = buckets.flat().map((e) => ({ ...e }));
    const pendingRow = () => (pending.length
      ? [{ label: 'old entries, still to move', cells: pending.map(label), marks: {}, pointers: {} }]
      : []);
    emit(L.alloc, `resize: allocate ${newCapacity} empty buckets. Every entry has to be moved, because index = hash mod ${newCapacity} is different from mod ${capacity}`,
      { table: next, extra: pendingRow() });
    while (pending.length) {
      const e = pending.shift();
      const h = hashOf(e.key, keyType);
      const to = indexFor(h, newCapacity);
      const from = indexFor(h, capacity);
      next[to].push(e);
      emit(L.rehash, `${e.key}: ${h} mod ${newCapacity} = ${to} (it was in bucket ${from}). Rehashing moves it${next[to].length > 1 ? ', and it still shares a bucket' : to === from ? ' to the same index' : ''}`,
        { table: next, hl: to, marks: { [to]: { [next[to].length - 1]: 'new' } }, extra: pendingRow() });
    }
    buckets = next;
    capacity = newCapacity;
    emit(L.done, `resize finished: ${capacity} buckets, ${size} entries, so chains are short again`);
  }

  // `brief` skips the explanation steps (used by twoSum, where the map is only a tool).
  function put(key, value, L, { brief = false } = {}) {
    const idx = brief ? indexFor(hashOf(key, keyType), capacity) : locate(key, L);
    const chain = buckets[idx];
    for (let p = 0; p < chain.length; p++) {
      const same = chain[p].key === key;
      if (!brief) {
        emit(L.scan, `compare "${key}" with "${chain[p].key}": ${same ? 'same key' : 'different key (a collision), keep looking along the chain'}`,
          { hl: idx, marks: { [idx]: { [p]: 'compare' } } });
      }
      if (same) {
        chain[p].value = value;
        emit(L.update, `the key already exists, so its value changes to ${value}. The size stays ${size}`, { hl: idx, marks: { [idx]: { [p]: 'new' } } });
        return;
      }
    }
    chain.push({ key, value });
    size++;
    emit(L.add, chain.length > 1
      ? `bucket ${idx} already held ${chain.length - 1} entr${chain.length === 2 ? 'y' : 'ies'}: a collision. The new entry joins the end of the chain`
      : `bucket ${idx} was empty: add "${key}" there`,
    { hl: idx, marks: { [idx]: { [chain.length - 1]: 'new' } } });
    const limit = capacity * LOAD_FACTOR;
    if (size > limit) {
      emit(L.check, `size ${size} is more than ${LOAD_FACTOR} × ${capacity} = ${limit}: the table is getting crowded and chains will grow, so double it`);
      resize(L);
    } else {
      emit(L.check, `size ${size} is within the limit of ${limit} (load factor ${(size / capacity).toFixed(2)}): no resize needed`);
    }
  }

  // Returns the entry if found. `brief` collapses hashing, indexing and scanning into one step.
  function get(key, L, { brief = false } = {}) {
    if (brief) {
      const idx = indexFor(hashOf(key, keyType), capacity);
      const chain = buckets[idx];
      const p = chain.findIndex((e) => e.key === key);
      const marks = p >= 0 ? { [p]: 'found' } : Object.fromEntries(chain.map((_, i) => [i, 'compare']));
      emit(L.scan, `look up ${key}: bucket ${idx} ${chain.length ? `holds ${chain.map(label).join(', ')}` : 'is empty'}, so ${p >= 0 ? 'it is there' : 'it is not in the map'}`,
        { hl: idx, marks: { [idx]: marks } });
      return p >= 0 ? chain[p] : null;
    }
    const idx = locate(key, L);
    const chain = buckets[idx];
    for (let p = 0; p < chain.length; p++) {
      if (chain[p].key === key) {
        emit(L.found, `compare "${key}" with "${chain[p].key}": same key. Found, the value is ${chain[p].value}`, { hl: idx, marks: { [idx]: { [p]: 'found' } } });
        return chain[p];
      }
      emit(L.scan, `compare "${key}" with "${chain[p].key}": different key (a collision), keep looking along the chain`, { hl: idx, marks: { [idx]: { [p]: 'compare' } } });
    }
    emit(L.notFound, chain.length
      ? `reached the end of the chain: "${key}" is not in the map. Only bucket ${idx} was searched`
      : `bucket ${idx} is empty, so "${key}" is not in the map. One step and no searching`, { hl: idx });
    return null;
  }

  function remove(key, L) {
    const idx = locate(key, L);
    const chain = buckets[idx];
    for (let p = 0; p < chain.length; p++) {
      if (chain[p].key === key) {
        emit(L.scan, `compare "${key}" with "${chain[p].key}": same key. This is the entry to remove`, { hl: idx, marks: { [idx]: { [p]: 'removed' } } });
        chain.splice(p, 1);
        size--;
        emit(L.scan, `removed. The size is now ${size}. Only bucket ${idx} was touched`, { hl: idx });
        return true;
      }
      emit(L.scan, `compare "${key}" with "${chain[p].key}": different key, keep looking along the chain`, { hl: idx, marks: { [idx]: { [p]: 'compare' } } });
    }
    emit(L.scan, chain.length ? `end of the chain: "${key}" is not in the map, so there is nothing to remove` : `bucket ${idx} is empty: "${key}" is not in the map, so there is nothing to remove`, { hl: idx });
    return false;
  }

  return { steps, put, get, remove, emit, snapshot };
}

export function createState(pairs = [], capacity = 4, keyType = 'string') {
  const sim = simulate({ capacity, buckets: Array.from({ length: capacity }, () => []), size: 0, keyType }, { silent: true });
  const L = { hash: 0, index: 0, scan: 0, update: 0, add: 0, check: 0, alloc: 0, rehash: 0, done: 0 };
  for (const [key, value] of pairs) sim.put(key, value, L);
  return sim.snapshot();
}

export const entriesOf = (state) => state.buckets.flat().map((e) => [e.key, e.value]);

// --- operations ------------------------------------------------------------

export function put(state, keyText, value) {
  const key = checkKey(String(keyText).trim());
  checkValue(value);
  const exists = state.buckets.some((chain) => chain.some((e) => e.key === key));
  if (!exists && state.size >= MAX_ENTRIES) throw new RangeError(`this demo map holds at most ${MAX_ENTRIES} entries`);
  const sim = simulate(state);
  sim.emit(0, `put("${key}", ${value}): store ${value} under the key "${key}"`);
  sim.put(key, value, { hash: 1, index: 2, scan: 4, update: 4, add: 6, check: 7, alloc: 12, rehash: 14, done: 15 });
  return { steps: sim.steps, final: sim.snapshot() };
}

export function get(state, keyText) {
  const key = checkKey(String(keyText).trim());
  const sim = simulate(state);
  sim.emit(0, `get("${key}"): find the value stored under "${key}"`);
  sim.get(key, { hash: 1, index: 1, scan: 3, found: 3, notFound: 5 });
  return { steps: sim.steps, final: state };
}

export function remove(state, keyText) {
  const key = checkKey(String(keyText).trim());
  const sim = simulate(state);
  sim.emit(0, `remove("${key}"): delete the entry stored under "${key}"`);
  sim.remove(key, { hash: 1, index: 1, scan: 2 });
  return { steps: sim.steps, final: sim.snapshot() };
}

// Interview problem: Two Sum (LeetCode 1). For each number, ask the map whether its partner was seen.
export function twoSum(state, numbersText, target) {
  const nums = parseNumbers(numbersText, 8);
  if (!Number.isInteger(target) || target < -999 || target > 2000) throw new RangeError('target must be a whole number from -999 to 2000');

  let at = null;
  let found = null;
  const inputRow = () => ({
    label: 'nums',
    cells: nums,
    marks: found ? { [found[0]]: 'found', [found[1]]: 'found' } : at === null ? {} : { [at]: 'active' },
    pointers: at === null || found ? {} : { i: at },
  });
  const sim = simulate({ capacity: 4, buckets: Array.from({ length: 4 }, () => []), size: 0, keyType: 'int' }, { prefix: () => [inputRow()] });
  const all = (line) => ({ hash: line, index: line, scan: line, found: line, notFound: line, update: line, add: line, check: line, alloc: line, rehash: line, done: line });

  sim.emit(0, `twoSum(target = ${target}): find two numbers that add up to ${target}. The map remembers each number seen so far and where, so "have I seen my partner?" is one lookup`);
  for (let i = 0; i < nums.length; i++) {
    at = i;
    const x = nums[i];
    const need = target - x;
    sim.emit(3, `at index ${i}: ${x}. Its partner must be ${target} − ${x} = ${need}`);
    const hit = sim.get(String(need), all(4), { brief: true });
    if (hit) {
      found = [hit.value, i];
      sim.emit(4, `found! ${need} was seen at index ${hit.value}, and ${x} is at index ${i}: ${need} + ${x} = ${target}. Answer: [${hit.value}, ${i}]. One pass, no nested loop: O(n)`);
      return { steps: sim.steps, final: state };
    }
    sim.emit(5, `${need} has not been seen, so remember ${x} (at index ${i}) for later numbers to find`);
    sim.put(String(x), i, all(5), { brief: true });
  }
  at = null;
  sim.emit(7, `reached the end: no two numbers add up to ${target}. Return null`);
  return { steps: sim.steps, final: state };
}
