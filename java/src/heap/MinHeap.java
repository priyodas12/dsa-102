package heap;

import java.util.NoSuchElementException;

/** A growable binary min-heap of ints in an array. Mirrors web/topics/heap/steps.js. */
public class MinHeap {
    private int[] data;
    private int size;

    public MinHeap(int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
        data = new int[capacity];
    }

    /** O(n): sift down every parent, from the last one back to the root. */
    public static MinHeap heapify(int[] values) {
        MinHeap heap = new MinHeap(Math.max(values.length, 1));
        System.arraycopy(values, 0, heap.data, 0, values.length);
        heap.size = values.length;
        for (int i = heap.size / 2 - 1; i >= 0; i--) heap.siftDown(i);
        return heap;
    }

    public int size() {
        return size;
    }

    /** O(1): the smallest value is always the root. */
    public int peek() {
        if (size == 0) throw new NoSuchElementException();
        return data[0];
    }

    /** O(log n): add at the end, then sift up. */
    public void insert(int value) {
        if (size == data.length) data = java.util.Arrays.copyOf(data, size * 2);
        data[size] = value; // the tree stays complete
        int i = size++;
        while (i > 0 && data[parent(i)] > data[i]) {
            swap(i, parent(i));
            i = parent(i);
        }
    }

    /** O(log n): take the root, move the last element up to it, then sift down. */
    public int extractMin() {
        if (size == 0) throw new NoSuchElementException();
        int min = data[0];
        data[0] = data[--size];
        siftDown(0);
        return min;
    }

    private void siftDown(int i) {
        while (true) {
            int smallest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            if (left < size && data[left] < data[smallest]) smallest = left;
            if (right < size && data[right] < data[smallest]) smallest = right;
            if (smallest == i) return;
            swap(i, smallest);
            i = smallest;
        }
    }

    private static int parent(int i) {
        return (i - 1) / 2;
    }

    private void swap(int i, int j) {
        int t = data[i];
        data[i] = data[j];
        data[j] = t;
    }
}
