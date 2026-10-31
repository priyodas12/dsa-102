package slidingwindow;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class SlidingWindowTest {
    @Test
    void maxSumOfK() {
        assertEquals(9, SlidingWindow.maxSumOfK(new int[] {2, 1, 5, 1, 3, 2}, 3));
        assertEquals(4, SlidingWindow.maxSumOfK(new int[] {4}, 1));
        assertEquals(6, SlidingWindow.maxSumOfK(new int[] {1, 2, 3}, 3)); // k equals the length
        assertEquals(-7, SlidingWindow.maxSumOfK(new int[] {-5, -2, -9}, 2));
    }

    @Test
    void longestSubstringWithoutRepeats() {
        assertEquals(3, SlidingWindow.lengthOfLongestSubstring("abcabcbb"));
        assertEquals(1, SlidingWindow.lengthOfLongestSubstring("bbbbb"));
        assertEquals(3, SlidingWindow.lengthOfLongestSubstring("pwwkew"));
        assertEquals(3, SlidingWindow.lengthOfLongestSubstring("dvdf")); // the window must jump past the first 'd'
        assertEquals(0, SlidingWindow.lengthOfLongestSubstring(""));
    }

    @Test
    void shortestSubarrayWithSumAtLeastTarget() {
        assertEquals(2, SlidingWindow.minSubArrayLen(7, new int[] {2, 3, 1, 2, 4, 3}));
        assertEquals(1, SlidingWindow.minSubArrayLen(4, new int[] {1, 4, 4}));
        assertEquals(0, SlidingWindow.minSubArrayLen(10, new int[] {1, 1, 1, 1}));
        assertEquals(3, SlidingWindow.minSubArrayLen(6, new int[] {1, 2, 3}));
    }
}
