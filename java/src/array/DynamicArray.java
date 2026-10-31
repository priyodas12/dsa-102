package array;

/**
 * A growable array of ints, built on a plain int[].
 * Mirrors the code shown in the animation (web/topics/array/steps.js).
 */
public class DynamicArray {
    private int[] data;
    private int size;

    public DynamicArray(int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
        data = new int[capacity];
    }

    public int size() {
        return size;
    }

    public int capacity() {
        return data.length;
    }

    /** O(1): one address calculation. */
    public int get(int index) {
        checkIndex(index, size - 1);
        return data[index];
    }

    /** O(n): worst case looks at every element. */
    public int indexOf(int target) {
        for (int i = 0; i < size; i++) {
            if (data[i] == target) return i;
        }
        return -1;
    }

    /** Appending is amortized O(1); inserting at the front is O(n). */
    public void insert(int index, int value) {
        checkIndex(index, size); // index == size is allowed: that is an append
        if (size == data.length) grow();
        for (int i = size; i > index; i--) {
            data[i] = data[i - 1]; // shift right, starting from the end
        }
        data[index] = value;
        size++;
    }

    public void append(int value) {
        insert(size, value);
    }

    /** O(n): shifts everything after index one slot left. */
    public void delete(int index) {
        checkIndex(index, size - 1);
        for (int i = index; i < size - 1; i++) {
            data[i] = data[i + 1];
        }
        data[--size] = 0; // clear the tail slot
    }

    private void grow() {
        int[] bigger = new int[data.length * 2]; // doubling keeps n appends O(n) overall
        for (int i = 0; i < size; i++) bigger[i] = data[i];
        data = bigger;
    }

    private void checkIndex(int index, int max) {
        if (index < 0 || index > max) {
            throw new IndexOutOfBoundsException("index " + index + ", valid range 0.." + max);
        }
    }
}
