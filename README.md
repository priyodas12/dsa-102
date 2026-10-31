# DSA-102

Learn data structures and algorithms through step-by-step animation. A small browser app plays each
operation one step at a time, with a plain-English caption and the matching line of Java code, backed by
reference implementations in Java.

## What's inside

**13 animated topics**, each with its own operations you can run on your own input:

| Topic | Operations |
|---|---|
| Array | access, search, insert, append, delete |
| Linked list | insert at head / tail / index, remove at index, search, reverse, detect cycle |
| Hash map | put, get, remove, Two Sum |
| Stack | push, pop, peek, balanced brackets |
| Queue (circular) | enqueue, dequeue, peek, hot potato |
| Tree (BST) | insert, search, delete, lowest common ancestor |
| Heap | insert, extract min, peek, heapify an array, top K largest |
| Graph | BFS, DFS, shortest path (Dijkstra), connected components, add / remove edge |
| Two pointers | pair sum (sorted), valid palindrome, remove duplicates, most water |
| Sliding window | max sum of k, longest substring without repeats, shortest subarray with sum ≥ target |
| Binary search | find a target, lower bound, rotated array, square root (search on the answer) |
| Dynamic programming | Fibonacci (memoization), coin change, 0/1 knapsack, longest common subsequence |
| Backtracking | subsets, permutations, generate parentheses, N-Queens |

**Every topic page has:**

- Player controls: play/pause, step back, step forward, restart, a speed slider (0.25×–4×) and a step scrubber
- A caption for each step, a status line (step count plus topic state), and the active Java line highlighted
- Time and space complexity for the selected operation
- Lesson notes: why it exists, how it works, trade-offs, common pitfalls
- Keyboard shortcuts: `←` / `→` step, `Space` play/pause
- Accessibility: highlighted cells and nodes are also labelled in text ("compare", "found", "visited"…),
  so meaning never depends on color alone; dark mode and `prefers-reduced-motion` are respected

**How it's built:** each algorithm is a pure function that records a list of steps (plain data). A generic
`Player` replays that list, so stepping backward is trivial and the step generators are unit-tested
without a browser.

## Tech stack

- **Visualizer:** plain JavaScript (ES modules), HTML, CSS and SVG. No framework, no build step.
- **Dev server and tests:** Node.js built-ins only (`node:http`, `node:test`). No npm dependencies.
- **Reference code:** Java, with JUnit 5 (Jupiter) tests.

## Project structure

```
dsa-102/
├── server.js            # tiny static file server for web/ (no dependencies)
├── package.json         # npm start / npm test
├── web/
│   ├── index.html       # page shell
│   ├── main.js          # topic list and hash-based routing (#array, #graph, ...)
│   ├── style.css
│   ├── core/
│   │   ├── player.js    # plays a recorded list of steps; knows nothing about topics
│   │   ├── topic-view.js# generic topic page: controls, stage, transport, code, lesson
│   │   └── dom.js       # renderers: cell rows, binary tree, graph, linked list, decision tree (SVG)
│   └── topics/<topic>/
│       ├── steps.js     # pure step generators + the Java code shown on screen
│       ├── steps.test.js
│       ├── visual.js    # topic config passed to mountTopic()
│       └── lesson.js    # lesson text as data
└── java/
    ├── src/<topic>/     # reference implementations (DynamicArray, SinglyLinkedList, ChainedHashMap,
    │                    #   ArrayStack, ArrayQueue, BinarySearchTree, MinHeap, Graph, TwoPointers, ...)
    └── test/<topic>/    # JUnit 5 tests
```

## Prerequisites

- Node.js with the built-in test runner (`node --test`); developed on Node 24
- Java and JUnit 5 to compile and run the reference code (optional for the web app)

## Setup

Nothing needs installing. There are no npm dependencies.

```bash
git clone <repo-url> dsa-102
cd dsa-102
```

## Usage

Start the app:

```bash
npm start
```

Then open <http://localhost:3000>. Choose a topic at the top, pick an operation, enter your own values and
press **Run**.

Use a different port:

```bash
PORT=8080 npm start
```

Run the JavaScript tests (the player plus every topic's step generator):

```bash
npm test
```

Java tests: TODO. The repo has no Maven or Gradle build yet, so compile `java/src` and `java/test` with
JUnit 5 on the classpath using your IDE or the JUnit console launcher.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the dev server listens on |

## Notes

- The server only serves files inside `web/` and rejects path traversal.
- Backtracking has animations and on-screen Java code but no class under `java/src` yet.
- `index.js` is a leftover placeholder and is not used by the app.
- Project goals, the content roadmap and the lesson standard are in `CLAUDE.md`.
