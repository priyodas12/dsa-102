// Pure step generators for the graph topic: an undirected, weighted graph on vertices A to H,
// stored as an adjacency list (each edge is kept in both endpoints' lists).
//
// State: { edges: [{ a, b, w }] } with a < b, so each edge is stored once and is unique.
// Step: { graph: { vertices, edges, marks, edgeMarks, labels, showWeights }, rows, caption, line, size }
//   marks: { vertex: kind }, edgeMarks: { 'A-B': kind }, labels: { vertex: text shown beside it }.
// Every operation returns { steps, final } and never mutates its input.

export const VERTICES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const MAX_EDGES = 14;

export const programs = {
  addEdge: [
    'void addEdge(char a, char b, int weight) {',
    '  graph.get(a).add(new Edge(b, weight));',
    '  graph.get(b).add(new Edge(a, weight)); // undirected: store both directions',
    '}',
  ],
  removeEdge: [
    'void removeEdge(char a, char b) {',
    '  graph.get(a).removeIf(e -> e.to == b);',
    '  graph.get(b).removeIf(e -> e.to == a);',
    '}',
  ],
  bfs: [
    'void bfs(Map<Character, List<Edge>> graph, char start) {',
    '  Set<Character> seen = new HashSet<>();',
    '  Queue<Character> queue = new ArrayDeque<>();',
    '  seen.add(start); queue.add(start);',
    '  while (!queue.isEmpty()) {',
    '    char v = queue.remove();',
    '    visit(v);',
    '    for (Edge e : graph.get(v)) {',
    '      if (seen.add(e.to)) queue.add(e.to); // mark when queued, not when removed',
    '    }',
    '  }',
    '}',
  ],
  dfs: [
    'void dfs(Map<Character, List<Edge>> graph, char v, Set<Character> seen) {',
    '  seen.add(v);',
    '  visit(v);',
    '  for (Edge e : graph.get(v)) {',
    '    if (!seen.contains(e.to)) dfs(graph, e.to, seen);',
    '  }',
    '} // returning = backtracking',
  ],
  dijkstra: [
    'int[] dijkstra(Map<Character, List<Edge>> graph, char source) {',
    '  Map<Character, Integer> dist = new HashMap<>(Map.of(source, 0));',
    '  PriorityQueue<int[]> pq = new PriorityQueue<>((x, y) -> x[1] - y[1]);',
    '  pq.add(new int[] {source, 0});',
    '  while (!pq.isEmpty()) {',
    '    int[] top = pq.remove(); // the closest vertex not yet finished',
    '    if (top[1] > dist.get(top[0])) continue; // stale entry: a shorter path was found',
    '    for (Edge e : graph.get(top[0])) {',
    '      int d = top[1] + e.weight;',
    '      if (d < dist.getOrDefault(e.to, INF)) { dist.put(e.to, d); pq.add(new int[] {e.to, d}); }',
    '    }',
    '  }',
    '  return dist;',
    '}',
  ],
  components: [
    'int countComponents(Map<Character, List<Edge>> graph) {',
    '  Set<Character> seen = new HashSet<>();',
    '  int count = 0;',
    '  for (char v : graph.keySet()) {',
    '    if (seen.contains(v)) continue;',
    '    count++; // an unexplored vertex means a new component',
    '    dfs(graph, v, seen); // marks the whole component',
    '  }',
    '  return count;',
    '}',
  ],
};

// --- helpers ---------------------------------------------------------------

export const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function adjacency(edges) {
  const adj = Object.fromEntries(VERTICES.map((v) => [v, []]));
  for (const { a, b, w } of edges) {
    adj[a].push({ to: b, w });
    adj[b].push({ to: a, w });
  }
  for (const v of VERTICES) adj[v].sort((x, y) => (x.to < y.to ? -1 : 1));
  return adj;
}

const pad = (items) => Array.from({ length: VERTICES.length }, (_, i) => (i < items.length ? items[i] : null));

// Adjacency list as rows. `marks` maps a vertex to { neighbor: kind } for cells to highlight.
export function adjacencyRows(adj, marks = {}) {
  return VERTICES.map((v) => ({
    label: `${v} →`,
    compact: true,
    cells: adj[v].map((e) => `${e.to}(${e.w})`),
    marks: Object.fromEntries(
      adj[v].map((e, i) => [i, marks[v]?.[e.to]]).filter(([, kind]) => kind),
    ),
    pointers: {},
  }));
}

function parseVertex(text, what) {
  const v = String(text).trim().toUpperCase();
  if (!VERTICES.includes(v)) throw new RangeError(`${what} must be one of A to H`);
  return v;
}

function parseWeight(w) {
  if (!Number.isInteger(w) || w < 1 || w > 99) throw new RangeError('weight must be a whole number from 1 to 99');
  return w;
}

const view = (edges, { marks = {}, edgeMarks = {}, labels = {}, showWeights = false } = {}) => ({
  vertices: VERTICES,
  edges,
  marks,
  edgeMarks,
  labels,
  showWeights,
});

const step = (edges, opts, rows, line, caption) => ({
  graph: view(edges, opts),
  rows,
  line,
  caption,
  size: edges.length,
});

export const DEFAULT_EDGES = [
  ['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 1], ['B', 'D', 5], ['C', 'D', 8],
  ['C', 'E', 10], ['D', 'E', 2], ['D', 'F', 6], ['E', 'F', 3], ['G', 'H', 1],
].map(([a, b, w]) => ({ a, b, w }));

export function createState(edges = DEFAULT_EDGES) {
  return { edges: edges.map((e) => ({ ...e })) };
}

// --- representation: add and remove an edge --------------------------------

export function addEdge(state, aText, bText, weight) {
  const a = parseVertex(aText, 'a');
  const b = parseVertex(bText, 'b');
  const w = parseWeight(weight);
  if (a === b) throw new RangeError('an edge needs two different vertices');
  const key = edgeKey(a, b);
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const existing = state.edges.find((e) => e.a === lo && e.b === hi);
  if (!existing && state.edges.length >= MAX_EDGES) throw new RangeError(`this demo graph holds at most ${MAX_EDGES} edges`);

  const before = state.edges;
  const after = existing
    ? before.map((e) => (e === existing ? { ...e, w } : e))
    : [...before, { a: lo, b: hi, w }];
  const adjBefore = adjacency(before);
  const adjAfter = adjacency(after);
  const mark = (v, other) => ({ [v]: { [other]: 'new' } });
  const steps = [];

  steps.push(step(before, { marks: { [a]: 'active', [b]: 'active' }, showWeights: true }, adjacencyRows(adjBefore), 0,
    `addEdge(${a}, ${b}, ${w}): ${existing ? `the edge exists already, so its weight changes from ${existing.w} to ${w}` : `connect ${a} and ${b} with weight ${w}`}`));
  const half = { ...adjBefore, [a]: adjAfter[a] };
  steps.push(step(after, { marks: { [a]: 'active', [b]: 'active' }, edgeMarks: { [key]: 'new' }, showWeights: true }, adjacencyRows(half, mark(a, b)), 1,
    `${existing ? 'update' : 'add'} ${b}(${w}) ${existing ? 'in' : 'to'} the list of ${a}. Adding to a list is O(1)`));
  steps.push(step(after, { marks: { [a]: 'active', [b]: 'active' }, edgeMarks: { [key]: 'new' }, showWeights: true }, adjacencyRows(adjAfter, { ...mark(a, b), ...mark(b, a) }), 2,
    `the graph is undirected, so ${b} must also know about ${a}: the edge is stored twice`));
  return { steps, final: { edges: after } };
}

export function removeEdge(state, aText, bText) {
  const a = parseVertex(aText, 'a');
  const b = parseVertex(bText, 'b');
  const key = edgeKey(a, b);
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const existing = state.edges.find((e) => e.a === lo && e.b === hi);
  const before = state.edges;
  const adjBefore = adjacency(before);
  const steps = [];

  if (!existing) {
    steps.push(step(before, { showWeights: true }, adjacencyRows(adjBefore), 0, `removeEdge(${a}, ${b}): there is no edge between ${a} and ${b}, so nothing changes`));
    return { steps, final: state };
  }
  const after = before.filter((e) => e !== existing);
  const adjAfter = adjacency(after);
  const mark = (v, other) => ({ [v]: { [other]: 'removed' } });

  steps.push(step(before, { marks: { [a]: 'active', [b]: 'active' }, edgeMarks: { [key]: 'removed' }, showWeights: true },
    adjacencyRows(adjBefore, { ...mark(a, b), ...mark(b, a) }), 0, `removeEdge(${a}, ${b}): the edge appears in two lists and must leave both`));
  steps.push(step(before, { marks: { [a]: 'active', [b]: 'active' }, edgeMarks: { [key]: 'removed' }, showWeights: true },
    adjacencyRows({ ...adjBefore, [a]: adjAfter[a] }, mark(b, a)), 1, `remove ${b} from the list of ${a}. Scanning the list costs O(degree of ${a})`));
  steps.push(step(after, { marks: { [a]: 'active', [b]: 'active' }, showWeights: true }, adjacencyRows(adjAfter), 2,
    `remove ${a} from the list of ${b}. The edge is gone`));
  return { steps, final: { edges: after } };
}

// --- breadth-first search --------------------------------------------------

export function bfs(state, startText) {
  const start = parseVertex(startText, 'start');
  const { edges } = state;
  const adj = adjacency(edges);
  const seen = new Set([start]);
  const queue = [start];
  const order = [];
  const hops = { [start]: 0 };
  const treeEdges = {};
  const steps = [];

  const add = (marks, edgeMarks, line, caption) => {
    const shown = {
      ...Object.fromEntries(order.map((v) => [v, 'visited'])),
      ...Object.fromEntries(queue.map((v) => [v, 'queued'])),
      ...marks,
    };
    steps.push(step(edges, {
      marks: shown,
      edgeMarks: { ...treeEdges, ...edgeMarks },
      labels: Object.fromEntries(Object.entries(hops).map(([v, h]) => [v, `${h} hop${h === 1 ? '' : 's'}`])),
    }, [
      {
        label: 'queue (front on the left)',
        cells: pad(queue),
        marks: {},
        pointers: queue.length ? { front: 0, back: queue.length - 1 } : {},
      },
      { label: 'visit order', cells: pad(order), marks: order.length ? { [order.length - 1]: 'visit' } : {}, pointers: {} },
    ], line, caption));
  };

  add({}, {}, 0, `bfs from ${start}: visit vertices in rings, nearest first. A queue gives that order`);
  add({ [start]: 'queued' }, {}, 3, `mark ${start} as seen and put it in the queue`);
  while (queue.length) {
    const v = queue.shift();
    add({ [v]: 'active' }, {}, 5, `dequeue ${v}, the oldest waiting vertex`);
    order.push(v);
    add({ [v]: 'visit' }, {}, 6, `visit ${v}`);
    for (const { to } of adj[v]) {
      const key = edgeKey(v, to);
      if (seen.has(to)) {
        add({ [v]: 'active' }, { [key]: 'compare' }, 8, `${to} was already seen, so skip it. This check is what stops the search from circling forever`);
        continue;
      }
      seen.add(to);
      queue.push(to);
      hops[to] = hops[v] + 1;
      treeEdges[key] = 'tree';
      add({ [v]: 'active' }, {}, 8, `${to} is new: mark it seen and enqueue it. It is ${hops[to]} hop${hops[to] === 1 ? '' : 's'} from ${start}`);
    }
  }
  const missing = VERTICES.length - order.length;
  add({}, {}, 11, `done: ${order.join(', ')}. ${missing ? `${missing} vertices are not connected to ${start}, so BFS never reached them` : 'every vertex was reached'}`);
  return { steps, final: state };
}

// --- depth-first search ----------------------------------------------------

export function dfs(state, startText) {
  const start = parseVertex(startText, 'start');
  const { edges } = state;
  const adj = adjacency(edges);
  const seen = new Set();
  const order = [];
  const stack = [];
  const treeEdges = {};
  const steps = [];

  const add = (marks, edgeMarks, line, caption) => {
    const shown = {
      ...Object.fromEntries(order.map((v) => [v, 'visited'])),
      ...Object.fromEntries(stack.map((v) => [v, 'path'])),
      ...(stack.length ? { [stack.at(-1)]: 'active' } : {}),
      ...marks,
    };
    steps.push(step(edges, { marks: shown, edgeMarks: { ...treeEdges, ...edgeMarks } }, [
      { label: 'call stack (top on the right)', cells: pad(stack), marks: {}, pointers: stack.length ? { top: stack.length - 1 } : {} },
      { label: 'visit order', cells: pad(order), marks: order.length ? { [order.length - 1]: 'visit' } : {}, pointers: {} },
    ], line, caption));
  };

  add({}, {}, 0, `dfs from ${start}: go as deep as possible, then backtrack. The call stack remembers the way back`);
  (function visit(v, from) {
    seen.add(v);
    stack.push(v);
    add({}, {}, 1, `enter ${v}: mark it seen${from ? ` (reached from ${from})` : ''}`);
    order.push(v);
    add({ [v]: 'visit' }, {}, 2, `visit ${v}`);
    for (const { to } of adj[v]) {
      const key = edgeKey(v, to);
      if (seen.has(to)) {
        add({}, { [key]: 'compare' }, 4, `${to} was already seen, so skip it`);
        continue;
      }
      treeEdges[key] = 'tree';
      add({}, {}, 4, `${to} is unseen: go deeper into it before looking at the other neighbors of ${v}`);
      visit(to, v);
    }
    stack.pop();
    add({}, {}, 6, stack.length
      ? `${v} has no unseen neighbors left: return and backtrack to ${stack.at(-1)}`
      : `${v} has no unseen neighbors left and nothing is below it on the stack: the search is finished`);
  })(start, null);
  add({}, {}, 6, `done: ${order.join(', ')}`);
  return { steps, final: state };
}

// --- shortest path: Dijkstra -----------------------------------------------

export function dijkstra(state, startText, targetText) {
  const start = parseVertex(startText, 'start');
  const target = String(targetText).trim() === '' ? null : parseVertex(targetText, 'target');
  const { edges } = state;
  const adj = adjacency(edges);
  const dist = { [start]: 0 };
  const prev = {};
  const settled = new Set();
  let pq = [{ v: start, d: 0 }];
  const steps = [];
  const sortPq = () => { pq.sort((x, y) => x.d - y.d || (x.v < y.v ? -1 : 1)); };

  const add = (marks, edgeMarks, line, caption, extra = {}) => {
    const tree = Object.fromEntries(Object.entries(prev).map(([v, p]) => [edgeKey(p, v), 'tree']));
    steps.push(step(edges, {
      marks: { ...Object.fromEntries([...settled].map((v) => [v, 'visited'])), ...marks },
      edgeMarks: { ...tree, ...edgeMarks, ...extra.edgeMarks },
      labels: Object.fromEntries(Object.entries(dist).map(([v, d]) => [v, `d=${d}`])),
      showWeights: true,
    }, [
      { label: 'priority queue (closest first)', cells: pad(pq.map((x) => `${x.v}:${x.d}`)), marks: {}, pointers: {} },
      {
        label: 'shortest known distance',
        cells: VERTICES.map((v) => (v in dist ? dist[v] : '∞')),
        indexLabels: VERTICES,
        marks: Object.fromEntries(VERTICES.map((v, i) => [i, settled.has(v) ? 'visited' : null]).filter(([, k]) => k)),
        pointers: {},
      },
    ], line, caption));
  };

  add({ [start]: 'active' }, {}, 0, `dijkstra from ${start}: always finish the closest unfinished vertex. Its distance can never improve, because every weight is positive`);
  add({ [start]: 'active' }, {}, 3, `distance to ${start} is 0; every other vertex is unreachable so far (∞). Put ${start} in the priority queue`);
  while (pq.length) {
    const { v, d } = pq.shift();
    if (d > dist[v]) {
      add({ [v]: 'removed' }, {}, 6, `${v}:${d} is stale: a shorter route to ${v} (${dist[v]}) was found after it was queued. Skip it`);
      continue;
    }
    settled.add(v);
    add({ [v]: 'active' }, {}, 5, `take the closest vertex: ${v} at distance ${d}. Its distance is now final`);
    for (const { to, w } of adj[v]) {
      if (settled.has(to)) continue;
      const nd = d + w;
      const old = dist[to];
      const key = edgeKey(v, to);
      if (old === undefined || nd < old) {
        dist[to] = nd;
        prev[to] = v;
        pq.push({ v: to, d: nd });
        sortPq();
        add({ [v]: 'active', [to]: 'compare' }, { [key]: 'compare' }, 9,
          `${v} → ${to}: ${d} + ${w} = ${nd}, ${old === undefined ? 'the first route found to ' + to : `shorter than ${old}`}. Update it and queue ${to}:${nd}`);
      } else {
        add({ [v]: 'active', [to]: 'compare' }, { [key]: 'compare' }, 9,
          `${v} → ${to}: ${d} + ${w} = ${nd}, not shorter than the ${old} we already have. Keep ${old}`);
      }
    }
  }

  let finish = `done: shortest distances from ${start}: ${VERTICES.filter((v) => v in dist).map((v) => `${v}=${dist[v]}`).join(', ')}`;
  const marks = {};
  const edgeMarks = {};
  if (target) {
    if (target in dist) {
      const path = [target];
      while (path[0] !== start) path.unshift(prev[path[0]]);
      path.forEach((v) => { marks[v] = 'found'; });
      path.slice(1).forEach((v, i) => { edgeMarks[edgeKey(path[i], v)] = 'found'; });
      finish = `shortest path ${start} to ${target}: ${path.join(' → ')}, total cost ${dist[target]}`;
    } else {
      finish = `${target} cannot be reached from ${start}: there is no path`;
    }
  }
  add(marks, edgeMarks, 12, finish);
  return { steps, final: state };
}

// --- interview problem: number of connected components (LeetCode 323) ------

export function components(state) {
  const { edges } = state;
  const adj = adjacency(edges);
  const seen = new Set();
  const order = [];
  const label = {};
  let count = 0;
  const steps = [];

  const add = (marks, line, caption) => {
    steps.push(step(edges, {
      marks: { ...Object.fromEntries(order.map((v) => [v, 'visited'])), ...marks },
      labels: Object.fromEntries(Object.entries(label).map(([v, n]) => [v, `#${n}`])),
    }, [{ label: 'visit order', cells: pad(order), marks: order.length ? { [order.length - 1]: 'visit' } : {}, pointers: {} }], line, caption));
  };

  add({}, 0, 'countComponents: a component is a group of vertices that can reach each other. Start a search from every vertex not yet seen');
  for (const v of VERTICES) {
    if (seen.has(v)) {
      add({ [v]: 'visited' }, 4, `${v} was already reached by an earlier search (component #${label[v]}), skip it`);
      continue;
    }
    count++;
    add({ [v]: 'active' }, 5, `${v} has not been reached by anything so far: it belongs to a new component. count = ${count}`);
    (function flood(u) {
      seen.add(u);
      label[u] = count;
      order.push(u);
      add({ [u]: 'visit' }, 6, `dfs reaches ${u}: it joins component #${count}`);
      for (const { to } of adj[u]) if (!seen.has(to)) flood(to);
    })(v);
  }
  add({}, 8, `done: ${count} component${count === 1 ? '' : 's'}. A vertex with no edges counts as a component of its own`);
  return { steps, final: state };
}
