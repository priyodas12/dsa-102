# DSA-102

## Goal

An animated, interactive learning project for data structures and algorithms, with reference implementations in **Java**.

- Teach core structures from the ground up: array, linked list, queue, stack, hash map, heap, tree, graph
- Explain every building block properly before it is used by something bigger
- Walk through classic interview questions step by step with animation
- Make the learner able to predict what happens next, not just watch

## Tech decisions

- **Visualizer:** plain JavaScript (ES modules) + SVG/Canvas, served as static files. No framework, no build step, so the code stays easy to read while learning.
- **Reference code:** Java 17+, one small class per concept, no external libraries beyond JUnit.
- **Runtime:** Node.js only for a dev server and tests (`npm start`, `npm test`).
- If a different choice is made later, update this section first.

## Suggested layout

```
dsa-102/
├── CLAUDE.md
├── web/                  # animation app (static)
│   ├── index.html
│   ├── core/             # shared animation engine (stepper, renderer, timeline)
│   └── topics/<topic>/   # one folder per topic: visual.js, steps.js, lesson.md
├── java/                 # reference implementations + JUnit tests
│   └── src/<topic>/
└── docs/                 # concept notes, glossary
```

## Content roadmap (build in this order; each depends on the previous)

1. **Foundations:** Big-O, memory model, recursion
2. **Linear:** array, dynamic array, linked list (singly/doubly), stack, queue, deque
3. **Hashing:** hash function, collisions, hash map, set
4. **Trees:** binary tree, BST, traversals (DFS/BFS), balanced trees (AVL intro), trie
5. **Heap:** binary heap, heapify, priority queue, heap sort
6. **Graph:** representations, BFS, DFS, topological sort, shortest path (Dijkstra), union-find
7. **Techniques:** two pointers, sliding window, binary search, backtracking, basic DP
8. **Interview problems:** grouped by the structure they exercise (see below)

## Lesson standard (every topic must have)

1. **Why it exists:** the problem it solves, with a real-world analogy
2. **How it works:** memory layout / invariants, shown visually
3. **Operations:** each operation animated step by step with complexity (best/avg/worst, time and space)
4. **Trade-offs:** when to use it vs. alternatives
5. **Java implementation:** minimal, commented, tested
6. **Common pitfalls:** off-by-one, null handling, resizing, etc.
7. **Practice:** 3–5 interview questions linked to the topic

## Animation requirements

- Controls: play, pause, step forward, step back, speed slider, reset
- Each step shows: highlighted elements, a one-line plain-English caption, and the matching line of code
- Show state alongside the picture (pointers, indices, size/capacity, stack/queue contents, visited set)
- Animations are driven by a recorded list of steps (pure data), so stepping backward is trivial and the algorithm logic stays separate from rendering
- User input: let the learner enter their own values and see the animation re-run
- Accessible: keyboard controls, sufficient color contrast, don't rely on color alone, respect `prefers-reduced-motion`

## Interview questions

- Each problem: statement, example, brute force → optimized approach, animation of both, complexity, and the key insight in one sentence
- Tag each with its pattern (e.g. "two pointers", "monotonic stack") so the learner sees reuse across problems
- Examples to include early: two sum, valid parentheses, reverse linked list, LRU cache, level-order traversal, top-K elements, number of islands, course schedule

## Conventions

- Keep one concept per file; prefer small, readable code over clever code
- Name things after the concept (`LinkedList`, `MinHeap`), not abstractions
- Comments explain *why*, not *what*
- Every Java class has JUnit tests covering edge cases (empty, single element, duplicates, capacity growth)
- Keep step generators pure and deterministic so they can be unit-tested without a browser
- Don't add dependencies without a clear reason

## Working with Claude

- Build incrementally: engine first, then one topic end-to-end (array), then replicate the pattern
- Before adding a new topic, check that its prerequisites in the roadmap exist
- Run the app and test a change in the browser before calling it done; say so if you couldn't
- Ask before making structural changes (layout, language, tooling)
