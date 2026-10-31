package linkedlist;

import java.util.ArrayList;
import java.util.List;

/** A singly linked list of ints with only a head pointer. Mirrors web/topics/linkedlist/steps.js. */
public class SinglyLinkedList {
    private static class Node {
        int value;
        Node next;

        Node(int value) {
            this.value = value;
        }
    }

    private Node head;
    private int size;

    public int size() {
        return size;
    }

    /** O(1): no walking and no shifting. */
    public void addFirst(int value) {
        Node node = new Node(value);
        node.next = head; // the new node points at the old first node
        head = node;      // head now points at the new node
        size++;
    }

    /** O(n): we only know the head, so walk to the last node. */
    public void addLast(int value) {
        Node node = new Node(value);
        if (head == null) {
            head = node;
            size++;
            return;
        }
        Node curr = head;
        while (curr.next != null) curr = curr.next;
        curr.next = node;
        size++;
    }

    /** O(index) to reach the position, O(1) to link. index may equal size (append). */
    public void add(int index, int value) {
        if (index < 0 || index > size) throw new IndexOutOfBoundsException("index " + index);
        if (index == 0) {
            addFirst(value);
            return;
        }
        Node prev = head;
        for (int i = 0; i < index - 1; i++) prev = prev.next; // stop just before the position
        Node node = new Node(value);
        node.next = prev.next; // link the new node to what follows first...
        prev.next = node;      // ...then link the previous node to it
        size++;
    }

    public void removeAt(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException("index " + index);
        if (index == 0) {
            head = head.next;
            size--;
            return;
        }
        Node prev = head;
        for (int i = 0; i < index - 1; i++) prev = prev.next;
        prev.next = prev.next.next; // skip over the target; the garbage collector frees it
        size--;
    }

    /** O(n): first index holding target, or -1. */
    public int indexOf(int target) {
        Node curr = head;
        int i = 0;
        while (curr != null) {
            if (curr.value == target) return i;
            curr = curr.next;
            i++;
        }
        return -1;
    }

    /** Interview problem (LeetCode 206): reverse in place. O(n) time, O(1) space. */
    public void reverse() {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node next = curr.next; // remember the rest before cutting the link
            curr.next = prev;      // flip the arrow
            prev = curr;           // move both pointers one step forward
            curr = next;
        }
        head = prev; // prev is the new head
    }

    public List<Integer> toList() {
        List<Integer> out = new ArrayList<>();
        for (Node n = head; n != null; n = n.next) out.add(n.value);
        return out;
    }
}
