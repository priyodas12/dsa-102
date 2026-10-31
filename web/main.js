import { mount as mountArray } from './topics/array/visual.js';
import { mount as mountLinkedList } from './topics/linkedlist/visual.js';
import { mount as mountHashMap } from './topics/hashmap/visual.js';
import { mount as mountStack } from './topics/stack/visual.js';
import { mount as mountQueue } from './topics/queue/visual.js';
import { mount as mountTree } from './topics/tree/visual.js';
import { mount as mountHeap } from './topics/heap/visual.js';
import { mount as mountGraph } from './topics/graph/visual.js';
import { mount as mountTwoPointers } from './topics/twopointers/visual.js';
import { mount as mountSlidingWindow } from './topics/slidingwindow/visual.js';
import { mount as mountBinarySearch } from './topics/binarysearch/visual.js';
import { mount as mountDp } from './topics/dp/visual.js';
import { mount as mountBacktracking } from './topics/backtracking/visual.js';

const topics = [
  { id: 'array', title: 'Array', mount: mountArray },
  { id: 'linkedlist', title: 'Linked list', mount: mountLinkedList },
  { id: 'hashmap', title: 'Hash map', mount: mountHashMap },
  { id: 'stack', title: 'Stack', mount: mountStack },
  { id: 'queue', title: 'Queue', mount: mountQueue },
  { id: 'tree', title: 'Tree', mount: mountTree },
  { id: 'heap', title: 'Heap', mount: mountHeap },
  { id: 'graph', title: 'Graph', mount: mountGraph },
  { id: 'twopointers', title: 'Two pointers', mount: mountTwoPointers },
  { id: 'slidingwindow', title: 'Sliding window', mount: mountSlidingWindow },
  { id: 'binarysearch', title: 'Binary search', mount: mountBinarySearch },
  { id: 'dp', title: 'Dynamic programming', mount: mountDp },
  { id: 'backtracking', title: 'Backtracking', mount: mountBacktracking },
];

const nav = document.getElementById('topics');
const app = document.getElementById('app');
let dispose = () => {};

for (const t of topics) {
  const a = document.createElement('a');
  a.href = `#${t.id}`;
  a.textContent = t.title;
  nav.append(a);
}

function show() {
  const topic = topics.find((t) => `#${t.id}` === location.hash) ?? topics[0];
  dispose();
  for (const a of nav.children) {
    if (a.hash === `#${topic.id}`) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
  // A fresh container per topic so old event listeners go away with it.
  const root = document.createElement('div');
  app.replaceChildren(root);
  dispose = topic.mount(root);
  document.title = `${topic.title} · DSA-102`;
}

addEventListener('hashchange', show);
show();
