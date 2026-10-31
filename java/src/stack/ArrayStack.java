package stack;

import java.util.EmptyStackException;

/** A fixed-capacity stack of ints. Mirrors web/topics/stack/steps.js. */
public class ArrayStack {
    private final int[] data;
    private int top = -1; // index of the top element; -1 means empty

    public ArrayStack(int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
        data = new int[capacity];
    }

    public int size() {
        return top + 1;
    }

    public boolean isEmpty() {
        return top == -1;
    }

    /** O(1): write to the next free slot. */
    public void push(int value) {
        if (top == data.length - 1) throw new StackOverflowError();
        data[++top] = value;
    }

    /** O(1): read the top and move the pointer down. */
    public int pop() {
        if (isEmpty()) throw new EmptyStackException();
        int value = data[top];
        data[top--] = 0;
        return value;
    }

    /** O(1): read the top without removing it. */
    public int peek() {
        if (isEmpty()) throw new EmptyStackException();
        return data[top];
    }
}
