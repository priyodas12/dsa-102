package twopointers;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class TwoPointersTest {
    @Test
    void twoSumSorted() {
        assertArrayEquals(new int[] {2, 3}, TwoPointers.twoSumSorted(new int[] {1, 3, 4, 6, 8, 11}, 10));
        assertArrayEquals(new int[] {0, 1}, TwoPointers.twoSumSorted(new int[] {3, 3}, 6));
        assertArrayEquals(new int[] {1, 2}, TwoPointers.twoSumSorted(new int[] {-4, -1, 2, 9}, 1));
        assertNull(TwoPointers.twoSumSorted(new int[] {5}, 10)); // one element can't pair with itself
        assertNull(TwoPointers.twoSumSorted(new int[] {1, 2, 3}, 100));
        assertNull(TwoPointers.twoSumSorted(new int[] {}, 1));
    }

    @Test
    void palindrome() {
        assertTrue(TwoPointers.isPalindrome("Madam, I'm Adam"));
        assertTrue(TwoPointers.isPalindrome("A man, a plan, a canal: Panama"));
        assertTrue(TwoPointers.isPalindrome(""));
        assertTrue(TwoPointers.isPalindrome("!!!"));
        assertFalse(TwoPointers.isPalindrome("abca"));
        assertFalse(TwoPointers.isPalindrome("race a car"));
    }

    @Test
    void removeDuplicates() {
        int[] a = {1, 1, 2, 2, 2, 3, 4, 4};
        int length = TwoPointers.removeDuplicates(a);
        assertEquals(4, length);
        assertArrayEquals(new int[] {1, 2, 3, 4}, java.util.Arrays.copyOf(a, length));
        assertEquals(0, TwoPointers.removeDuplicates(new int[] {}));
        assertEquals(1, TwoPointers.removeDuplicates(new int[] {7, 7, 7}));
    }

    @Test
    void maxArea() {
        assertEquals(49, TwoPointers.maxArea(new int[] {1, 8, 6, 2, 5, 4, 8, 3, 7}));
        assertEquals(1, TwoPointers.maxArea(new int[] {1, 1}));
        assertEquals(0, TwoPointers.maxArea(new int[] {9}));
    }
}
