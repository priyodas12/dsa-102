import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, addEdge, removeEdge, bfs, dfs, dijkstra, components, adjacency, edgeKey, programs, VERTICES, DEFAULT_EDGES,
} from './steps.js';

const g = () => createState();
const keys = (edges) => new Set(edges.map((e) => edgeKey(e.a, e.b)));

function checkSteps(steps, program) {
  assert.ok(steps.length > 0);
  for (const s of steps) {
    assert.ok(s.caption.length > 0);
    assert.ok(s.line >= 0 && s.line < program.length, `line ${s.line} out of range`);
    for (const v of Object.keys(s.graph.marks)) assert.ok(VERTICES.includes(v), `bad vertex ${v}`);
    for (const v of Object.keys(s.graph.labels)) assert.ok(VERTICES.includes(v));
    const known = keys(s.graph.edges);
    for (const k of Object.keys(s.graph.edgeMarks)) assert.ok(known.has(k), `edge mark on missing edge ${k}`);
    for (const r of s.rows) {
      for (const idx of Object.keys(r.marks)) assert.ok(Number(idx) < Math.max(r.cells.length, 1), `row mark ${idx} outside row`);
    }
  }
}

const order = (r) => r.steps.at(-1).rows.find((row) => row.label === 'visit order').cells.filter((c) => c !== null);

test('adjacency list stores each edge in both directions, sorted', () => {
  const adj = adjacency(g().edges);
  assert.deepEqual(adj.A.map((e) => e.to), ['B', 'C']);
  assert.deepEqual(adj.C.map((e) => e.to), ['A', 'B', 'D', 'E']);
  assert.deepEqual(adj.G, [{ to: 'H', w: 1 }]);
  assert.equal(VERTICES.reduce((n, v) => n + adj[v].length, 0), DEFAULT_EDGES.length * 2);
});

test('addEdge adds a new edge in either direction and does not mutate', () => {
  const s = g();
  const r = addEdge(s, 'f', 'a', 7);
  assert.equal(r.final.edges.length, s.edges.length + 1);
  assert.deepEqual(r.final.edges.at(-1), { a: 'A', b: 'F', w: 7 });
  assert.equal(s.edges.length, DEFAULT_EDGES.length);
  checkSteps(r.steps, programs.addEdge);
});

test('addEdge on an existing edge updates its weight', () => {
  const r = addEdge(g(), 'B', 'A', 9);
  assert.equal(r.final.edges.length, DEFAULT_EDGES.length);
  assert.equal(r.final.edges.find((e) => e.a === 'A' && e.b === 'B').w, 9);
  assert.match(r.steps[0].caption, /weight changes from 4 to 9/);
  checkSteps(r.steps, programs.addEdge);
});

test('addEdge rejects bad input and enforces the edge limit', () => {
  assert.throws(() => addEdge(g(), 'A', 'A', 1), RangeError);
  assert.throws(() => addEdge(g(), 'A', 'Z', 1), RangeError);
  assert.throws(() => addEdge(g(), 'A', 'B', 0), RangeError);
  assert.throws(() => addEdge(g(), 'A', 'B', 1.5), RangeError);
  const full = createState([...DEFAULT_EDGES, { a: 'A', b: 'E', w: 1 }, { a: 'A', b: 'D', w: 1 }, { a: 'B', b: 'F', w: 1 }, { a: 'C', b: 'F', w: 1 }]);
  assert.equal(full.edges.length, 14);
  assert.throws(() => addEdge(full, 'A', 'H', 1), RangeError);
});

test('removeEdge removes an edge, or reports a missing one', () => {
  const r = removeEdge(g(), 'C', 'A');
  assert.equal(r.final.edges.length, DEFAULT_EDGES.length - 1);
  assert.ok(!keys(r.final.edges).has('A-C'));
  checkSteps(r.steps, programs.removeEdge);
  const none = removeEdge(g(), 'A', 'H');
  assert.match(none.steps[0].caption, /no edge/);
  assert.equal(none.final.edges.length, DEFAULT_EDGES.length);
  checkSteps(none.steps, programs.removeEdge);
});

test('bfs visits in rings and never reaches another component', () => {
  const r = bfs(g(), 'A');
  assert.deepEqual(order(r), ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.match(r.steps.at(-1).caption, /2 vertices are not connected/);
  assert.equal(r.steps.at(-1).graph.labels.F, '3 hops');
  checkSteps(r.steps, programs.bfs);
});

test('bfs hop counts are shortest paths in hops', () => {
  const r = bfs(g(), 'A');
  const labels = r.steps.at(-1).graph.labels;
  assert.deepEqual([labels.A, labels.B, labels.C, labels.D, labels.E, labels.F], ['0 hops', '1 hop', '1 hop', '2 hops', '2 hops', '3 hops']);
});

test('bfs on a line, from the isolated pair, and from lower-case input', () => {
  const line = createState([{ a: 'A', b: 'B', w: 1 }, { a: 'B', b: 'C', w: 1 }]);
  assert.deepEqual(order(bfs(line, 'C')), ['C', 'B', 'A']);
  assert.deepEqual(order(bfs(g(), 'h')), ['H', 'G']);
  assert.deepEqual(order(bfs(createState([]), 'A')), ['A']);
  assert.throws(() => bfs(g(), 'Q'), RangeError);
});

test('bfs and dfs terminate on a cycle', () => {
  const ring = createState(['A-B', 'B-C', 'C-A'].map((k) => ({ a: k[0], b: k[2], w: 1 })));
  assert.deepEqual(order(bfs(ring, 'A')), ['A', 'B', 'C']);
  assert.deepEqual(order(dfs(ring, 'A')), ['A', 'B', 'C']);
});

test('dfs goes deep first and backtracks', () => {
  const branches = createState([['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E']].map(([a, b]) => ({ a, b, w: 1 })));
  const r = dfs(branches, 'A');
  assert.deepEqual(order(r), ['A', 'B', 'D', 'C', 'E']); // BFS would give A B C D E
  assert.deepEqual(order(bfs(branches, 'A')), ['A', 'B', 'C', 'D', 'E']);
  assert.ok(r.steps.some((s) => /backtrack to A/.test(s.caption)));
  checkSteps(r.steps, programs.dfs);
});

test('dfs stack is empty at the end', () => {
  const r = dfs(g(), 'A');
  assert.deepEqual(order(r), ['A', 'B', 'C', 'D', 'E', 'F']);
  assert.equal(r.steps.at(-1).rows[0].cells.filter((c) => c !== null).length, 0);
});

test('dijkstra finds the cheapest path, not the fewest hops', () => {
  const r = dijkstra(g(), 'A', 'F');
  checkSteps(r.steps, programs.dijkstra);
  assert.match(r.steps.at(-1).caption, /A → C → B → D → E → F, total cost 13/);
  const labels = r.steps.at(-1).graph.labels;
  assert.deepEqual([labels.A, labels.B, labels.C, labels.D, labels.E, labels.F], ['d=0', 'd=3', 'd=2', 'd=8', 'd=10', 'd=13']);
  assert.equal(labels.G, undefined);
});

test('dijkstra skips stale queue entries', () => {
  // A-B costs 10 directly but 2 via C: B is queued twice and the first entry goes stale.
  const s = createState([{ a: 'A', b: 'B', w: 10 }, { a: 'A', b: 'C', w: 1 }, { a: 'B', b: 'C', w: 1 }]);
  const r = dijkstra(s, 'A', 'B');
  assert.ok(r.steps.some((st) => /stale/.test(st.caption)));
  assert.match(r.steps.at(-1).caption, /A → C → B, total cost 2/);
  checkSteps(r.steps, programs.dijkstra);
});

test('dijkstra with unreachable, same and missing target', () => {
  assert.match(dijkstra(g(), 'A', 'G').steps.at(-1).caption, /cannot be reached/);
  assert.match(dijkstra(g(), 'A', 'A').steps.at(-1).caption, /cost 0/);
  const none = dijkstra(g(), 'A', '');
  assert.match(none.steps.at(-1).caption, /shortest distances from A/);
  checkSteps(none.steps, programs.dijkstra);
});

test('dijkstra distances agree with Bellman-Ford on random graphs', () => {
  let x = 11;
  const next = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 40; t++) {
    const edges = [];
    for (const a of VERTICES) for (const b of VERTICES) {
      if (a < b && next() < 0.35) edges.push({ a, b, w: 1 + Math.floor(next() * 9) });
    }
    const dist = Object.fromEntries(VERTICES.map((v) => [v, Infinity]));
    dist.A = 0;
    for (let i = 0; i < VERTICES.length; i++) {
      for (const { a, b, w } of edges) {
        if (dist[a] + w < dist[b]) dist[b] = dist[a] + w;
        if (dist[b] + w < dist[a]) dist[a] = dist[b] + w;
      }
    }
    const labels = dijkstra(createState(edges), 'A', '').steps.at(-1).graph.labels;
    for (const v of VERTICES) {
      assert.equal(labels[v], dist[v] === Infinity ? undefined : `d=${dist[v]}`, `vertex ${v}, trial ${t}`);
    }
  }
});

test('components counts groups, including isolated vertices', () => {
  const r = components(g());
  assert.match(r.steps.at(-1).caption, /2 components/);
  checkSteps(r.steps, programs.components);
  const labels = r.steps.at(-1).graph.labels;
  assert.deepEqual(['A', 'F', 'G', 'H'].map((v) => labels[v]), ['#1', '#1', '#2', '#2']);
  assert.match(components(createState([])).steps.at(-1).caption, /8 components/);
  const ring = createState(VERTICES.slice(1).map((b) => ({ a: 'A', b, w: 1 })));
  assert.match(components(ring).steps.at(-1).caption, /1 component\./);
});
