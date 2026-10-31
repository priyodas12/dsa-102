export const lesson = {
  title: 'Dynamic programming',
  why: 'Some problems can be split into smaller versions of themselves, but the smaller versions repeat: computing fib(5) by plain recursion works out fib(2) three separate times, and the waste explodes as n grows. Dynamic programming (DP) solves each small version once, writes the answer in a table, and builds bigger answers from the table. It turns exponential work into polynomial work.',
  how: [
    'Two properties make DP work. Overlapping subproblems: the same small problem is needed many times. Optimal substructure: the best answer to the whole problem is built from the best answers to its parts.',
    'Define the state: what does one table cell mean? For coin change, dp[a] is the fewest coins that make amount a. For the knapsack, dp[i][c] is the best value using the first i items with capacity c. Getting this definition right is most of the work.',
    'Write the recurrence: how is a cell computed from earlier cells? For coin change, dp[a] = 1 + the smaller of dp[a − coin] over all coins. Then fill in the base cases, the cells you know without calculating.',
    'Top-down (memoization) keeps the natural recursion and adds a memo: before computing, check whether the answer is already stored. Only the subproblems actually needed are solved.',
    'Bottom-up (tabulation) fills the table in order, smallest subproblems first, with plain loops and no recursion. Every cell is solved, but there is no call-stack overhead and the order is explicit.',
    'In the animation, empty dashed cells are not solved yet, blue cells are the earlier answers being read, green is the cell just filled in, and the green path at the end shows which choices built the answer.',
  ],
  operations: {
    fibMemo: { name: 'Fibonacci with memoization (top-down)', time: 'O(n)', space: 'O(n)', note: 'Each value is computed once, instead of about 1.6ⁿ calls for plain recursion. The memo and the recursion stack each take O(n).' },
    coinChange: { name: 'Coin change (bottom-up, 1D)', time: 'O(amount × coins)', space: 'O(amount)', note: 'One cell per amount, and each cell tries every coin.' },
    knapsack: { name: '0/1 knapsack (bottom-up, 2D)', time: 'O(items × capacity)', space: 'O(items × capacity)', note: 'One cell per (item, capacity) pair, each computed in O(1). The table can be shrunk to a single row because each row only reads the row above.' },
    lcs: { name: 'Longest common subsequence (2D)', time: 'O(m × n)', space: 'O(m × n)', note: 'One cell per pair of prefixes. Without the table, trying every subsequence of one string would be O(2ᵐ).' },
  },
  tradeoffs: [
    'Use DP when the problem asks for a best value, a count, or a yes/no over choices, and the same subproblems keep reappearing. Signs: "minimum number of", "number of ways to", "longest", "can we reach".',
    'Greedy is simpler and faster when it works, but it often does not. With coins 1, 5 and 6 and amount 10, greedy takes 6 + 1 + 1 + 1 + 1 = 5 coins; DP finds 5 + 5 = 2 coins.',
    'Top-down is quicker to write from a recursive idea and skips unneeded subproblems. Bottom-up avoids deep recursion (no StackOverflowError) and makes it easy to cut the memory by keeping only the last row.',
    'If the subproblems do not overlap (merge sort, binary search), plain divide and conquer is enough: a table would add nothing.',
    'DP trades memory for time. Its tables can be large, so check the size: a table of 10⁴ × 10⁴ is too big.',
  ],
  pitfalls: [
    'A vague state definition. Write one sentence saying exactly what a cell means before writing any code.',
    'Wrong fill order. Every cell a formula reads must already be filled, which is why the loops run from small to large.',
    'Forgetting the base cases, or filling them with 0 when "impossible" needs ∞ (as in coin change). Using a huge sentinel and adding 1 to it can overflow.',
    'Off-by-one between the table and the input: dp[i] often means "the first i items", so item i is at index i − 1.',
    'Knapsack: each item can be used once. If you allowed unlimited use you would be solving a different problem (unbounded knapsack) with a different loop.',
    'Assuming greedy works. Always test the idea on a small counterexample first.',
    'Memoization with mutable or large keys. Memoize on a small, hashable state, and make sure the answer depends only on that state.',
  ],
};
