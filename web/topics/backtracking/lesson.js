export const lesson = {
  title: 'Backtracking',
  why: 'Some problems ask for every possible arrangement or every way to satisfy some rules: all subsets of a set, every ordering, the placements of queens on a chessboard. There is no formula, so you have to try the possibilities. Backtracking tries them systematically: make a choice, explore what follows from it, and if it leads nowhere (or you have finished) undo the choice and try the next one. It is depth-first search on a tree of decisions.',
  how: [
    'Picture the problem as a decision tree. Each node is a partial solution, and each edge is one choice. A leaf is a complete solution (or a dead end).',
    'The pattern is always choose, explore, un-choose. Add an element to the current path, recurse to decide the rest, then remove that element again so the next choice starts from a clean state. That undo step is the backtrack.',
    'Subsets: for each number, two choices, leave it out or take it. The tree has 2ⁿ leaves. Permutations: at each position, pick any unused number: n! leaves.',
    'Pruning is what makes backtracking practical. If a partial solution can never become valid, stop right there and cut off the whole branch below it. In generate-parentheses, a ")" with nothing to close is never tried. In N-Queens, a square that is attacked is never used.',
    'The tree is built on the fly as the search runs. In the animation, blue nodes are the current path from the root, green are finished, a bright green leaf is a solution, and a red node is a pruned branch.',
    'Recording a result means copying the path (new ArrayList<>(path)), because the same path list keeps changing as the search continues.',
  ],
  operations: {
    subsets: { name: 'Subsets (include or exclude)', time: 'O(2ⁿ × n)', space: 'O(n)', note: '2ⁿ results, and copying each one costs up to n. The recursion depth and the path are only n deep.' },
    permutations: { name: 'Permutations', time: 'O(n! × n)', space: 'O(n)', note: 'n! results. For n = 10 that is already 3.6 million, so backtracking suits small inputs.' },
    parentheses: { name: 'Generate parentheses (pruning)', time: 'O(4ⁿ / √n)', space: 'O(n)', note: 'The number of results is the Catalan number. Pruning means every branch explored leads to at least one valid string, instead of checking all 2²ⁿ strings.' },
    nQueens: { name: 'N-Queens', time: 'O(n!) at worst', space: 'O(n)', note: 'One queen per row removes most of the n^n placements, and rejecting attacked squares early prunes far more. The depth is n.' },
  },
  tradeoffs: [
    'Use backtracking for "find all", "list every", or "is there any arrangement that satisfies these constraints" problems. It is the standard tool for generating combinations, solving puzzles (Sudoku, N-Queens) and constraint search.',
    'It is exponential in the worst case, so it only works for small inputs unless pruning cuts most of the tree. Always ask: what is the earliest point at which I can tell this branch is hopeless?',
    'If you only need the best value or a count, and subproblems repeat, dynamic programming is usually far faster. Backtracking is for when you must actually produce every solution, or the state is too complicated to tabulate.',
    'Backtracking is brute force with a brain: it checks the same possibilities as exhaustive search but never extends a partial solution it already knows is invalid.',
    'Memory is small: only the current path and the recursion stack are kept, O(n), even though the number of results can be huge.',
  ],
  pitfalls: [
    'Forgetting to undo. If you add to the path or mark an element used and never reverse it, the next branch starts with leftover state and gives wrong results.',
    'Adding the path itself to the results instead of a copy. Every entry then points to the same list, which ends up empty.',
    'Pruning too late (checking only at the leaf) turns backtracking into plain brute force. Check validity as early as possible.',
    'Duplicates in the input produce duplicate results. Sort the input and skip equal elements at the same level to avoid them. (The demos here require distinct numbers for that reason.)',
    'Getting the base case wrong: decide exactly when a path is complete, and record it once.',
    'Strings are immutable, so a path built with path + "(" needs no undo. A shared List or array does. Mixing the two styles is a common source of bugs.',
  ],
};
