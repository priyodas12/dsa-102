import { mountTopic } from '../../core/topic-view.js';
import { createState, addEdge, removeEdge, bfs, dfs, dijkstra, components, adjacency, adjacencyRows, programs, DEFAULT_EDGES } from './steps.js';
import { lesson } from './lesson.js';

export function mount(root) {
  return mountTopic(root, {
    defaultState: () => createState(DEFAULT_EDGES),
    idle: (s) => ({
      graph: { vertices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], edges: s.edges, marks: {}, edgeMarks: {}, labels: {}, showWeights: true },
      rows: adjacencyRows(adjacency(s.edges)),
      size: s.edges.length,
    }),
    idleCaption: 'A weighted, undirected graph and its adjacency list. G and H are connected to each other but not to the rest. Pick an operation and press Run.',
    meta: (step) => `vertices 8 · edges ${step.size}`,
    fields: [
      { name: 'a', type: 'text', narrow: true, value: 'A' },
      { name: 'b', type: 'text', narrow: true, value: 'F' },
      { name: 'weight', type: 'number', value: 7 },
      { name: 'start', type: 'text', narrow: true, value: 'A' },
      { name: 'target', type: 'text', narrow: true, value: 'F' },
    ],
    ops: {
      bfs: { label: 'Breadth-first search', fields: ['start'], run: (s, x) => bfs(s, x.start), program: 'bfs', info: 'bfs' },
      dfs: { label: 'Depth-first search', fields: ['start'], run: (s, x) => dfs(s, x.start), program: 'dfs', info: 'dfs' },
      dijkstra: { label: 'Shortest path (Dijkstra)', fields: ['start', 'target'], run: (s, x) => dijkstra(s, x.start, x.target), program: 'dijkstra', info: 'dijkstra' },
      components: { label: 'Connected components', fields: [], run: (s) => components(s), program: 'components', info: 'components' },
      addEdge: { label: 'Add edge', fields: ['a', 'b', 'weight'], run: (s, x) => addEdge(s, x.a, x.b, x.weight), program: 'addEdge', info: 'addEdge' },
      removeEdge: { label: 'Remove edge', fields: ['a', 'b'], run: (s, x) => removeEdge(s, x.a, x.b), program: 'removeEdge', info: 'removeEdge' },
    },
    initialOp: 'bfs',
    programs,
    lesson,
  });
}
