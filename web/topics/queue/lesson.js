export const lesson = {
  title: 'Queue',
  why: 'Work often has to be handled in the order it arrived: a line at a ticket counter, print jobs, requests waiting for a server. A queue is that line: you join at the back and are served from the front, so the first item in is the first item out (FIFO).',
  how: [
    'A queue allows enqueue (join at the back), dequeue (leave from the front) and peek (look at the front).',
    'Backed by an array, dequeuing by shifting everyone left would cost O(n). Instead, a head index marks the front and just moves forward.',
    'To reuse freed slots at the start, indices wrap around with the modulo operator: next = (index + 1) % capacity. This is a circular buffer.',
    'The next free slot (tail) is (head + size) % capacity. Tracking size is what tells a full queue from an empty one, since head equals tail in both cases.',
    'Enqueue, dequeue and peek are all O(1). A fixed-capacity queue can overflow when full and underflow when empty.',
  ],
  operations: {
    enqueue: { name: 'Enqueue', time: 'O(1)', space: 'O(1)', note: 'Write at tail and increase size. Nothing moves.' },
    dequeue: { name: 'Dequeue', time: 'O(1)', space: 'O(1)', note: 'Read at head and move head forward. Nothing shifts, which is the point of the circular buffer.' },
    peek: { name: 'Peek', time: 'O(1)', space: 'O(1)', note: 'Read the front without changing anything.' },
    josephus: { name: 'Hot potato (Josephus)', time: 'O(n × k)', space: 'O(n)', note: 'Each pass moves one person from front to back, and there are about n × k passes in total.' },
  },
  tradeoffs: [
    'Use a queue when order of arrival decides order of service: scheduling, buffering, breadth-first search.',
    'Stack is last in, first out; queue is first in, first out. Same operations, opposite order.',
    'A plain array with remove(0) makes dequeue O(n). In Java use ArrayDeque, not LinkedList or ArrayList, for a general queue.',
    'When the most important item should leave first, not the oldest, you want a priority queue (a heap), not a plain queue.',
  ],
  pitfalls: [
    'Forgetting the modulo: head++ without % capacity walks off the end of the array.',
    'Empty and full both have head equal to tail. Keep a size counter (or leave one slot unused) to tell them apart.',
    'Check for empty before dequeue or peek, and for full before enqueue on a fixed-capacity queue.',
    'Hot potato: the person who is "out" is removed, not re-added, so the line shrinks by one per round.',
  ],
};
