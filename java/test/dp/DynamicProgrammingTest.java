package dp;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class DynamicProgrammingTest {
    @Test
    void fibMatchesIteration() {
        long a = 0, b = 1;
        for (int n = 0; n <= 90; n++) {
            assertEquals(a, DynamicProgramming.fib(n), "n=" + n);
            long next = a + b;
            a = b;
            b = next;
        }
    }

    @Test
    void coinChangeBeatsGreedy() {
        assertEquals(2, DynamicProgramming.coinChange(new int[] {1, 5, 6}, 10)); // greedy would use 5 coins
        assertEquals(3, DynamicProgramming.coinChange(new int[] {1, 2, 5}, 11));
        assertEquals(-1, DynamicProgramming.coinChange(new int[] {2}, 3));
        assertEquals(0, DynamicProgramming.coinChange(new int[] {5}, 0));
        assertEquals(2, DynamicProgramming.coinChange(new int[] {7, 7}, 14));
    }

    @Test
    void knapsack() {
        assertEquals(9, DynamicProgramming.knapsack(new int[] {1, 3, 4, 5}, new int[] {1, 4, 5, 7}, 7));
        assertEquals(0, DynamicProgramming.knapsack(new int[] {5, 6}, new int[] {10, 20}, 4));
        assertEquals(5, DynamicProgramming.knapsack(new int[] {1, 2}, new int[] {2, 3}, 10));
    }

    @Test
    void longestCommonSubsequence() {
        assertEquals(4, DynamicProgramming.lcs("ABCBDA", "BDCABA"));
        assertEquals(3, DynamicProgramming.lcs("ABC", "ABC"));
        assertEquals(0, DynamicProgramming.lcs("ABC", "XYZ"));
        assertEquals(2, DynamicProgramming.lcs("AXB", "AB"));
        assertEquals(0, DynamicProgramming.lcs("", "AB"));
    }
}
