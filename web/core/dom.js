// Small helpers shared by all topic views.
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Render one animation step as rows of cells.
// step.rows: [{ label, cells: [value|null], marks: {index: kind}, pointers: {name: index} }]
// Marks are also written as text so meaning never depends on color alone.
const MARK_TEXT = {
  compare: 'compare',
  shift: 'written',
  new: 'new',
  found: 'found',
  removed: 'remove',
  active: 'here',
  error: 'problem',
  visit: 'visit',
  visited: 'seen',
  queued: 'queued',
  path: 'on path',
  tree: 'used',
  keep: 'kept',
  window: 'window',
};

export function renderRows(stage, step) {
  stage.replaceChildren();
  if (step.tree) stage.append(renderTree(step.tree));
  if (step.graph) stage.append(renderGraph(step.graph));
  if (step.list) stage.append(renderList(step.list));
  if (step.search) stage.append(renderSearchTree(step.search));
  for (const row of step.rows ?? []) {
    const wrap = el('div', `row${row.highlight ? ' hl' : ''}`);
    wrap.append(el('div', 'row-label', row.label));
    const cells = el('div', `cells${row.vertical ? ' vertical' : ''}${row.compact ? ' compact' : ''}${row.chain ? ' chain' : ''}${row.grid ? ' grid' : ''}${row.tags ? ' tags' : ''}${row.header ? ' header' : ''}`);
    row.cells.forEach((value, i) => {
      const mark = row.marks[i];
      const cell = el('div', `cell${value === null ? ' empty' : ''}${mark ? ` mark-${mark}` : ''}${row.dim?.includes(i) ? ' dim' : ''}`);
      cell.append(el('div', 'value', value === null ? '' : String(value)));
      cell.append(el('div', 'index', row.noIndex ? '' : (row.indexLabels?.[i] ?? String(i))));
      cell.append(el('div', 'tag', mark ? MARK_TEXT[mark] : ''));
      const pointers = Object.entries(row.pointers).filter(([, at]) => at === i).map(([name]) => name);
      cell.append(el('div', 'pointer', pointers.length ? `▲ ${pointers.join(', ')}` : ''));
      cells.append(cell);
    });
    if (row.emptyText && row.cells.length === 0) cells.append(el('span', 'row-empty', row.emptyText));
    wrap.append(cells);
    stage.append(wrap);
  }
}

export function renderCode(container, lines, activeLine) {
  container.replaceChildren();
  lines.forEach((text, i) => {
    const line = el('div', `code-line${i === activeLine ? ' active' : ''}`);
    line.append(el('span', 'ln', String(i + 1)));
    line.append(el('span', 'src', text || ' '));
    container.append(line);
  });
}

// Draw a binary tree as SVG. step.tree: { root, marks: { nodeId: kind } }, node: { id, value, left, right }.
// x comes from the in-order position, y from the depth, so a left child is always left of its parent.
const SVG_NS = 'http://www.w3.org/2000/svg';
const GAP_X = 56;
const GAP_Y = 76;
const RADIUS = 20;

function svg(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderTree({ root, marks }) {
  const positions = new Map();
  let column = 0;
  let maxDepth = 0;
  (function place(n, depth) {
    if (!n) return;
    place(n.left, depth + 1);
    positions.set(n.id, { n, x: GAP_X / 2 + column++ * GAP_X, y: RADIUS + 6 + depth * GAP_Y });
    maxDepth = Math.max(maxDepth, depth);
    place(n.right, depth + 1);
  })(root, 0);

  const width = Math.max(column, 1) * GAP_X;
  const height = (maxDepth + 1) * GAP_Y + 8;
  const canvas = svg('svg', { width, height, viewBox: `0 0 ${width} ${height}`, class: 'tree', role: 'img',
    'aria-label': root ? 'Binary search tree' : 'Empty tree' });
  if (!root) {
    canvas.append(svg('text', { x: 10, y: 30, class: 'ttag' }, '(empty tree)'));
    return canvas;
  }
  for (const { n, x, y } of positions.values()) {
    for (const child of [n.left, n.right]) {
      if (!child) continue;
      const c = positions.get(child.id);
      canvas.append(svg('line', { x1: x, y1: y, x2: c.x, y2: c.y, class: 'tedge' }));
    }
  }
  for (const { n, x, y } of positions.values()) {
    const mark = marks[n.id];
    const g = svg('g', { class: `tnode${mark ? ` mark-${mark}` : ''}` });
    g.append(svg('circle', { cx: x, cy: y, r: RADIUS }));
    g.append(svg('text', { x, y, class: 'tval' }, String(n.value)));
    if (mark) g.append(svg('text', { x, y: y + RADIUS + 13, class: 'ttag' }, MARK_TEXT[mark]));
    canvas.append(g);
  }
  return canvas;
}

// Draw a graph as SVG. graph: { vertices, edges: [{a, b, w}], marks, edgeMarks, labels, showWeights }.
// Vertices sit evenly on a circle, starting at the top and going clockwise.
const GRAPH_W = 380;
const GRAPH_H = 340;
const GRAPH_R = 125;

export function renderGraph({ vertices, edges, marks, edgeMarks, labels, showWeights }) {
  const canvas = svg('svg', { width: GRAPH_W, height: GRAPH_H, viewBox: `0 0 ${GRAPH_W} ${GRAPH_H}`, class: 'graph', role: 'img',
    'aria-label': `Graph with ${vertices.length} vertices and ${edges.length} edges` });
  const at = new Map(vertices.map((v, i) => {
    const angle = (2 * Math.PI * i) / vertices.length - Math.PI / 2;
    return [v, { x: GRAPH_W / 2 + GRAPH_R * Math.cos(angle), y: GRAPH_H / 2 + GRAPH_R * Math.sin(angle) }];
  }));

  for (const { a, b } of edges) {
    const p = at.get(a);
    const q = at.get(b);
    const mark = edgeMarks[a < b ? `${a}-${b}` : `${b}-${a}`];
    canvas.append(svg('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: `gedge${mark ? ` mark-${mark}` : ''}` }));
  }
  if (showWeights) {
    for (const { a, b, w } of edges) {
      const p = at.get(a);
      const q = at.get(b);
      canvas.append(svg('text', { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2, class: 'gweight' }, String(w)));
    }
  }
  for (const v of vertices) {
    const { x, y } = at.get(v);
    const mark = marks[v];
    const g = svg('g', { class: `tnode${mark ? ` mark-${mark}` : ''}` });
    g.append(svg('circle', { cx: x, cy: y, r: RADIUS }));
    g.append(svg('text', { x, y, class: 'tval' }, v));
    if (mark) g.append(svg('text', { x, y: y + RADIUS + 13, class: 'ttag' }, MARK_TEXT[mark]));
    if (labels[v]) g.append(svg('text', { x: x + RADIUS + 4, y: y - 2, class: 'glabel' }, labels[v]));
    canvas.append(g);
  }
  return canvas;
}

// Draw a singly linked list as SVG. list: { nodes: [{id, value, next, lifted}], marks, edgeMarks, pointers }.
// Boxes are drawn left to right in `nodes` order, and every arrow follows that node's own `next`,
// so an arrow can point backwards (reverse, cycle) or skip over a node (delete).
// Lifted nodes hang below the row: they exist but are not linked in at this moment.
const LIST_GAP = 100;
const BOX_W = 64;
const BOX_H = 36;
const ROW_Y = 90;
const LIFT_Y = 200;

export function renderList({ nodes, marks, edgeMarks, pointers }) {
  const n = nodes.length;
  const width = (n + 1) * LIST_GAP + 40;
  const canvas = svg('svg', { width, height: 290, viewBox: `0 0 ${width} 290`, class: 'llist', role: 'img',
    'aria-label': `Linked list with ${nodes.filter((x) => !x.lifted).length} nodes` });
  const defs = svg('defs');
  const marker = svg('marker', { id: 'arrowhead', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
  marker.append(svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'context-stroke' }));
  defs.append(marker);
  canvas.append(defs);

  const index = new Map(nodes.map((nd, i) => [nd.id, i]));
  const x = (i) => 20 + i * LIST_GAP;
  const top = (i) => (nodes[i]?.lifted ? LIFT_Y : ROW_Y);
  const mid = (i) => top(i) + BOX_H / 2;

  // Null terminator slot at the end of the row.
  canvas.append(svg('rect', { x: x(n), y: ROW_Y, width: 44, height: BOX_H, rx: 6, class: 'lnull' }));
  canvas.append(svg('text', { x: x(n) + 22, y: ROW_Y + BOX_H / 2, class: 'ttag lnulltext' }, 'null'));

  const straight = (i, j) => {
    if (j === i + 1) return true;
    if (j < i) return false;
    for (let k = i + 1; k < j; k++) if (!nodes[k].lifted) return false;
    return true;
  };

  nodes.forEach((nd, i) => {
    const mark = edgeMarks[nd.id];
    const cls = `ledge${mark ? ` mark-${mark}` : ''}`;
    const sx = x(i) + BOX_W - 10;
    let j = nd.next === null ? null : index.get(nd.next);
    if (j === null && i === n - 1) j = n; // the last box points at the null slot
    if (j === null) {
      canvas.append(svg('path', { d: `M${sx},${mid(i)} h22`, class: cls }));
      canvas.append(svg('text', { x: sx + 32, y: mid(i), class: 'ttag lnulltext' }, '∅'));
      return;
    }
    if (straight(i, j)) {
      const ex = x(j) - 3;
      canvas.append(svg('path', { d: `M${sx},${mid(i)} L${ex},${j === n ? ROW_Y + BOX_H / 2 : mid(j)}`, class: cls, 'marker-end': 'url(#arrowhead)' }));
      return;
    }
    // Backwards or skipping: an arc above the row.
    const tx = x(j) + (j < i ? BOX_W / 2 : 10);
    const depth = Math.min(80, 25 + 12 * Math.abs(j - i));
    const y0 = top(i);
    const y1 = top(j);
    canvas.append(svg('path', { d: `M${sx},${y0} Q${(sx + tx) / 2},${Math.min(y0, y1) - depth * 2} ${tx},${y1 - 3}`, class: cls, fill: 'none', 'marker-end': 'url(#arrowhead)' }));
  });

  const labelsAt = new Map();
  for (const [name, id] of Object.entries(pointers)) {
    const i = id === null ? n : index.get(id);
    if (i === undefined) continue;
    labelsAt.set(i, [...(labelsAt.get(i) ?? []), name]);
  }
  nodes.forEach((nd, i) => {
    const mark = marks[nd.id];
    const g = svg('g', { class: `lnode${mark ? ` mark-${mark}` : ''}` });
    const y = top(i);
    g.append(svg('rect', { x: x(i), y, width: BOX_W, height: BOX_H, rx: 6 }));
    g.append(svg('line', { x1: x(i) + BOX_W - 20, y1: y, x2: x(i) + BOX_W - 20, y2: y + BOX_H, class: 'lsplit' }));
    g.append(svg('circle', { cx: x(i) + BOX_W - 10, cy: y + BOX_H / 2, r: 3, class: 'ldot' }));
    g.append(svg('text', { x: x(i) + (BOX_W - 20) / 2, y: y + BOX_H / 2, class: 'tval' }, String(nd.value)));
    if (mark) g.append(svg('text', { x: x(i) + BOX_W / 2, y: y + BOX_H + 14, class: 'ttag' }, MARK_TEXT[mark]));
    canvas.append(g);
  });
  for (const [i, names] of labelsAt) {
    const y = i === n ? ROW_Y : top(i);
    canvas.append(svg('text', { x: x(i) + (i === n ? 22 : BOX_W / 2), y: y + BOX_H + 28, class: 'lptr' }, `▲ ${names.join(', ')}`));
  }
  return canvas;
}

// Draw a decision tree with any number of children per node. node: { id, label, edge, children }.
// Leaves are spaced evenly; a parent sits above the middle of its children. The `edge` text names the
// choice that leads to each child.
const SEARCH_GAP_X = 74;
const SEARCH_GAP_Y = 78;
const SEARCH_W = 64;
const SEARCH_H = 28;

export function renderSearchTree({ root, marks }) {
  const pos = new Map();
  let leaf = 0;
  let maxDepth = 0;
  (function place(n, depth) {
    maxDepth = Math.max(maxDepth, depth);
    n.children.forEach((c) => place(c, depth + 1));
    const x = n.children.length
      ? (pos.get(n.children[0].id).x + pos.get(n.children.at(-1).id).x) / 2
      : SEARCH_GAP_X / 2 + leaf++ * SEARCH_GAP_X;
    pos.set(n.id, { n, x, y: SEARCH_H / 2 + 8 + depth * SEARCH_GAP_Y });
  })(root, 0);

  const width = Math.max(leaf, 1) * SEARCH_GAP_X;
  const height = (maxDepth + 1) * SEARCH_GAP_Y + 20;
  const canvas = svg('svg', { width, height, viewBox: `0 0 ${width} ${height}`, class: 'stree', role: 'img',
    'aria-label': 'Decision tree of the choices explored so far' });
  for (const { n, x, y } of pos.values()) {
    for (const child of n.children) {
      const c = pos.get(child.id);
      canvas.append(svg('line', { x1: x, y1: y + SEARCH_H / 2, x2: c.x, y2: c.y - SEARCH_H / 2, class: 'tedge' }));
      if (child.edge) {
        canvas.append(svg('text', { x: (x + c.x) / 2 + (c.x < x ? -4 : c.x > x ? 4 : -4), y: (y + c.y) / 2, class: 'sedge', 'text-anchor': c.x > x ? 'start' : 'end' }, child.edge));
      }
    }
  }
  for (const { n, x, y } of pos.values()) {
    const mark = marks[n.id];
    const g = svg('g', { class: `snode${mark ? ` mark-${mark}` : ''}` });
    g.append(svg('rect', { x: x - SEARCH_W / 2, y: y - SEARCH_H / 2, width: SEARCH_W, height: SEARCH_H, rx: 6 }));
    g.append(svg('text', { x, y, class: 'sval' }, n.label || '∅'));
    if (mark === 'removed') g.append(svg('text', { x, y: y + SEARCH_H / 2 + 12, class: 'ttag' }, 'pruned'));
    else if (mark === 'found') g.append(svg('text', { x, y: y + SEARCH_H / 2 + 12, class: 'ttag' }, 'result'));
    else if (mark === 'active') g.append(svg('text', { x, y: y + SEARCH_H / 2 + 12, class: 'ttag' }, 'here'));
    canvas.append(g);
  }
  return canvas;
}
