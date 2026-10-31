package linkedlist;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import linkedlist.Cycle.ListNode;
import org.junit.jupiter.api.Test;

class LinkedListTest {
    private static SinglyLinkedList of(int... values) {
        SinglyLinkedList list = new SinglyLinkedList();
        for (int v : values) list.addLast(v);
        return list;
    }

    @Test
    void insertAtHeadMiddleAndEnd() {
        SinglyLinkedList list = of(3, 7, 5);
        list.add(0, 1);
        list.add(2, 9);
        list.add(5, 4);
        assertEquals(List.of(1, 3, 9, 7, 5, 4), list.toList());
        assertThrows(IndexOutOfBoundsException.class, () -> list.add(7, 0));
    }

    @Test
    void addFirstAndAddLastOnEmptyList() {
        SinglyLinkedList list = new SinglyLinkedList();
        list.addLast(2);
        list.addFirst(1);
        assertEquals(List.of(1, 2), list.toList());
    }

    @Test
    void removeAtHeadMiddleAndTail() {
        SinglyLinkedList list = of(3, 7, 9, 5);
        list.removeAt(0);
        list.removeAt(1);
        list.removeAt(1);
        assertEquals(List.of(7), list.toList());
        list.removeAt(0);
        assertEquals(0, list.size());
        assertThrows(IndexOutOfBoundsException.class, () -> list.removeAt(0));
    }

    @Test
    void indexOfFindsFirstMatchOrMinusOne() {
        SinglyLinkedList list = of(3, 7, 7);
        assertEquals(1, list.indexOf(7));
        assertEquals(-1, list.indexOf(9));
        assertEquals(-1, new SinglyLinkedList().indexOf(1));
    }

    @Test
    void reverseHandlesAnyLength() {
        for (int n = 0; n <= 4; n++) {
            SinglyLinkedList list = new SinglyLinkedList();
            for (int i = 1; i <= n; i++) list.addLast(i);
            list.reverse();
            List<Integer> expected = new java.util.ArrayList<>();
            for (int i = n; i >= 1; i--) expected.add(i);
            assertEquals(expected, list.toList());
        }
    }

    @Test
    void detectsCycles() {
        ListNode a = new ListNode(1), b = new ListNode(2), c = new ListNode(3);
        a.next = b;
        b.next = c;
        assertFalse(Cycle.hasCycle(a));
        assertFalse(Cycle.hasCycle(null));
        c.next = b;
        assertTrue(Cycle.hasCycle(a));
        c.next = c; // a node pointing at itself
        assertTrue(Cycle.hasCycle(a));
    }
}
