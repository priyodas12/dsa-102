package array;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class DynamicArrayTest {
    private static DynamicArray of(int capacity, int... values) {
        DynamicArray a = new DynamicArray(capacity);
        for (int v : values) a.append(v);
        return a;
    }

    @Test
    void insertInMiddleShiftsRight() {
        DynamicArray a = of(5, 1, 2, 3);
        a.insert(1, 9);
        assertEquals(4, a.size());
        assertEquals(9, a.get(1));
        assertEquals(2, a.get(2));
        assertEquals(3, a.get(3));
    }

    @Test
    void insertIntoEmptyArray() {
        DynamicArray a = new DynamicArray(1);
        a.insert(0, 5);
        assertEquals(5, a.get(0));
    }

    @Test
    void growsByDoublingWhenFull() {
        DynamicArray a = of(2, 1, 2);
        a.append(3);
        assertEquals(4, a.capacity());
        assertEquals(3, a.get(2));
    }

    @Test
    void deleteShiftsLeft() {
        DynamicArray a = of(5, 1, 2, 3, 4);
        a.delete(1);
        assertEquals(3, a.size());
        assertEquals(3, a.get(1));
        assertEquals(4, a.get(2));
    }

    @Test
    void deleteOnlyElement() {
        DynamicArray a = of(1, 7);
        a.delete(0);
        assertEquals(0, a.size());
    }

    @Test
    void indexOfFindsFirstMatchOrMinusOne() {
        DynamicArray a = of(4, 4, 7, 7);
        assertEquals(1, a.indexOf(7));
        assertEquals(-1, a.indexOf(9));
    }

    @Test
    void badIndicesThrow() {
        DynamicArray a = of(4, 1, 2);
        assertThrows(IndexOutOfBoundsException.class, () -> a.get(2));
        assertThrows(IndexOutOfBoundsException.class, () -> a.insert(3, 0));
        assertThrows(IndexOutOfBoundsException.class, () -> a.delete(-1));
    }
}
