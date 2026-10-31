package dp;

import java.util.Arrays;

/** Classic dynamic programming problems. Each mirrors a problem in web/topics/dp/steps.js. */
public final class DynamicProgramming {
    private DynamicProgramming() {}

    private static final int INF = Integer.MAX_VALUE / 2; // large, but dp[x] + 1 cannot overflow

    /** Top-down: plain recursion plus a memo. O(n) time and space. Plain recursion would be about 1.6^n calls. */
    public static long fib(int n) {
        return fib(n, new long[n + 1]);
    }

    private static long fib(int n, long[] memo) {
        if (n <= 1) return n; // base cases
        if (memo[n] != 0) return memo[n]; // already solved: reuse it
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
        return memo[n];
    }

    /** Bottom-up, LeetCode 322: the fewest coins that make amount, or -1. O(amount * coins). */
    public static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1]; // dp[a] = fewest coins that make amount a
        Arrays.fill(dp, INF);
        dp[0] = 0; // zero coins make amount 0
        for (int a = 1; a <= amount; a++) {
            for (int coin : coins) {
                if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
            }
        }
        return dp[amount] >= INF ? -1 : dp[amount];
    }

    /** 0/1 knapsack: the best total value that fits in cap, each item used at most once. O(items * cap). */
    public static int knapsack(int[] w, int[] v, int cap) {
        int[][] dp = new int[w.length + 1][cap + 1]; // dp[i][c] = best value using the first i items with capacity c
        for (int i = 1; i <= w.length; i++) {
            for (int c = 0; c <= cap; c++) {
                dp[i][c] = dp[i - 1][c]; // option 1: skip item i
                if (w[i - 1] <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w[i - 1]] + v[i - 1]); // option 2: take it
            }
        }
        return dp[w.length][cap];
    }

    /** LeetCode 1143: length of the longest common subsequence of a and b. O(m * n). */
    public static int lcs(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1]; // dp[i][j] = LCS of the first i chars of a and the first j of b
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1; // match: extend the diagonal
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);                     // no match: skip one character
            }
        }
        return dp[a.length()][b.length()];
    }
}
