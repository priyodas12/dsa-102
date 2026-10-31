// Lesson text for the array topic, kept as data so the view stays small.
export const lesson = {
  title: 'Array',
  why: 'Programs constantly need an ordered collection they can read by position. An array stores items side by side in one block of memory, like numbered lockers in a row, so the computer can jump straight to any locker.',
  how: [
    'Elements sit next to each other in memory, and every element has the same size.',
    'The address of element i is start + i × elementSize, so reading by index is one calculation: O(1).',
    'The capacity is fixed when the array is created. The size is how many slots are actually in use.',
    'Inserting or deleting in the middle means shifting every element after that point to keep the block gap-free.',
    'When the array is full, a dynamic array (Java ArrayList) allocates one twice as big and copies everything over. This is rare, so appending is amortized O(1).',
  ],
  operations: {
    access: { name: 'Access by index', time: 'O(1)', space: 'O(1)', note: 'One address calculation, regardless of array size.' },
    search: { name: 'Search by value', time: 'O(n)', space: 'O(1)', note: 'Best case O(1) if the target is first. Worst case checks every element.' },
    insert: { name: 'Insert at index', time: 'O(n)', space: 'O(1)', note: 'Worst case at index 0 shifts everything. Appending at the end is O(1) amortized, O(n) on the step that grows the array.' },
    delete: { name: 'Delete at index', time: 'O(n)', space: 'O(1)', note: 'Worst case at index 0 shifts everything. Deleting the last element is O(1).' },
  },
  tradeoffs: [
    'Use an array when you read by index often and rarely insert or delete in the middle.',
    'Prefer a linked list when you insert and delete at known positions all the time and never need index access.',
    'Prefer a hash map when you look things up by value, not by position.',
  ],
  pitfalls: [
    'Off-by-one: valid indices are 0 to size − 1, not 0 to size. Insert is the one operation that accepts index = size.',
    'Shift in the right direction: insert shifts right starting from the end, delete shifts left starting from the gap.',
    'Size is not capacity. Slots past size hold no meaningful data.',
    'Growing by +1 each time makes n appends O(n²). Doubling keeps the total O(n).',
  ],
};
