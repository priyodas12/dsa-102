package heap;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.Test;

class HeapTest {
    @Test
    void extractReturnsValuesInSortedOrder() {
        MinHeap h = new MinHeap(2); // small capacity forces growth
        for (int v : new int[] {9, 4, 7, 1, 8, 2, 6, 3}) h.insert(v);
        int[] out = new int[8];
        for (int i = 0; i < out.length; i++) out[i] = h.extractMin();
        assertArrayEquals(new int[] {1, 2, 3, 4, 6, 7, 8, 9}, out);
    }

    @Test
    void peekDoesNotRemove() {
        MinHeap h = new MinHeap(4);
        h.insert(5);
        h.insert(2);
        assertEquals(2, h.peek());
        assertEquals(2, h.size());
    }

    @Test
    void emptyHeapThrows() {
        MinHeap h = new MinHeap(1);
        assertThrows(NoSuchElementException.class, h::peek);
        assertThrows(NoSuchElementException.class, h::extractMin);
    }

    @Test
    void duplicatesAreKept() {
        MinHeap h = new MinHeap(4);
        h.insert(3);
        h.insert(3);
        assertEquals(3, h.extractMin());
        assertEquals(3, h.extractMin());
    }

    @Test
    void heapifyBuildsAValidHeap() {
        MinHeap h = MinHeap.heapify(new int[] {9, 4, 7, 1, 8, 2, 6});
        int prev = Integer.MIN_VALUE;
        while (h.size() > 0) {
            int v = h.extractMin();
            assertTrue(v >= prev);
            prev = v;
        }
    }

    @Test
    void topK() {
        int[] nums = {3, 9, 4, 7, 1, 8};
        int[] best = TopK.largest(nums, 3);
        Arrays.sort(best);
        assertArrayEquals(new int[] {7, 8, 9}, best);
        assertEquals(7, TopK.kthLargest(nums, 3));
        assertThrows(IllegalArgumentException.class, () -> TopK.largest(nums, 7));
    }
}
