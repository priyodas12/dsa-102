package binarysearch;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class BinarySearchTest {
    private static final int[] SORTED = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};

    @Test
    void findsEveryElementAndRejectsMissingOnes() {
        for (int i = 0; i < SORTED.length; i++) assertEquals(i, BinarySearch.binarySearch(SORTED, SORTED[i]));
        assertEquals(-1, BinarySearch.binarySearch(SORTED, 1));    // below all
        assertEquals(-1, BinarySearch.binarySearch(SORTED, 100));  // above all
        assertEquals(-1, BinarySearch.binarySearch(SORTED, 24));   // in a gap
        assertEquals(-1, BinarySearch.binarySearch(new int[] {}, 1));
    }

    @Test
    void lowerBoundFindsTheFirstOfSeveralDuplicates() {
        int[] a = {1, 2, 2, 2, 3, 5, 5, 8};
        assertEquals(1, BinarySearch.lowerBound(a, 2));
        assertEquals(5, BinarySearch.lowerBound(a, 5));
        assertEquals(5, BinarySearch.lowerBound(a, 4)); // missing: where it would be inserted
        assertEquals(0, BinarySearch.lowerBound(a, -50));
        assertEquals(8, BinarySearch.lowerBound(a, 99)); // past the end
        assertEquals(0, BinarySearch.lowerBound(new int[] {}, 1));
    }

    @Test
    void searchRotated() {
        int[] a = {4, 5, 6, 7, 0, 1, 2};
        for (int i = 0; i < a.length; i++) assertEquals(i, BinarySearch.searchRotated(a, a[i]));
        assertEquals(-1, BinarySearch.searchRotated(a, 3));
        assertEquals(0, BinarySearch.searchRotated(new int[] {1}, 1));
        assertEquals(1, BinarySearch.searchRotated(new int[] {3, 1}, 1));
        assertEquals(2, BinarySearch.searchRotated(new int[] {1, 2, 3}, 3)); // rotated by zero
    }

    @Test
    void mySqrtMatchesMathSqrt() {
        for (int x = 0; x <= 1000; x++) assertEquals((int) Math.sqrt(x), BinarySearch.mySqrt(x), "x=" + x);
        assertEquals(46340, BinarySearch.mySqrt(Integer.MAX_VALUE)); // (long) cast prevents overflow
    }

    @Test
    void midpointDoesNotOverflowOnHugeRanges() {
        int lo = Integer.MAX_VALUE - 2, hi = Integer.MAX_VALUE;
        assertEquals(Integer.MAX_VALUE - 1, lo + (hi - lo) / 2);
        assertTrue((lo + hi) / 2 < 0); // the naive formula overflows
    }
}
