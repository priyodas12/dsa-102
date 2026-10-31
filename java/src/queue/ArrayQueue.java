package queue;

import java.util.NoSuchElementException;

/** A fixed-capacity queue of ints on a circular array. Mirrors web/topics/queue/steps.js. */
public class ArrayQueue {
    private final int[] data;
    private int head; // index of the front element
    private int size;

    public ArrayQueue(int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
        data = new int[capacity];
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    /** O(1): write at the first free slot after the last element, wrapping around. */
    public void enqueue(int value) {
        if (size == data.length) throw new IllegalStateException("queue full");
        int tail = (head + size) % data.length;
        data[tail] = value;
        size++;
    }

    /** O(1): read at head and move head forward. Nothing is shifted. */
    public int dequeue() {
        if (size == 0) throw new NoSuchElementException();
        int value = data[head];
        data[head] = 0;
        head = (head + 1) % data.length;
        size--;
        return value;
    }

    public int peek() {
        if (size == 0) throw new NoSuchElementException();
        return data[head];
    }
}
