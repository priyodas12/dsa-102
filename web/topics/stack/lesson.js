export const lesson = {
  title: 'Stack',
  why: 'Many problems need to undo the most recent thing first: the back button, undo in an editor, nested function calls. A stack is a pile of plates: you only add or remove at the top, so the last item in is the first item out (LIFO).',
  how: [
    'A stack allows only three things: push (add on top), pop (remove from top) and peek (look at the top).',
    'Backed by an array, a single number called top tracks the last used slot. Push does top++ and writes. Pop reads and does top--.',
    'No element ever moves, so push, pop and peek are all O(1).',
    'A fixed-capacity stack can overflow (push when full). Any stack can underflow (pop or peek when empty).',
    'The call stack that runs your program is a stack too, which is why runaway recursion ends in a StackOverflowError.',
  ],
  operations: {
    push: { name: 'Push', time: 'O(1)', space: 'O(1)', note: 'Write to the next free slot. A growable stack is amortized O(1), the same as appending to an array.' },
    pop: { name: 'Pop', time: 'O(1)', space: 'O(1)', note: 'Read the top and move the pointer down. Nothing is shifted.' },
    peek: { name: 'Peek', time: 'O(1)', space: 'O(1)', note: 'Read the top without changing anything.' },
    brackets: { name: 'Balanced brackets', time: 'O(n)', space: 'O(n)', note: 'One pass over the input. The stack holds at most n openers, for example "((((".' },
  },
  tradeoffs: [
    'Use a stack when the most recent item must be handled first: undo, parsing, backtracking, depth-first search.',
    'You cannot reach the middle of a stack without popping what is above it. Use an array or list if you need random access.',
    'In Java prefer ArrayDeque over the legacy Stack class, which is synchronized and slower.',
  ],
  pitfalls: [
    'Always check for empty before pop or peek, and for full before push on a fixed-capacity stack.',
    'top is an index, not a count: an empty stack has top = −1 and size = top + 1.',
    'Balanced brackets: remember the final check that the stack is empty, or "(((" would pass.',
    'Balanced brackets: check for an empty stack before popping, or ")" alone would crash.',
  ],
};
