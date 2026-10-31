package linkedlist;

/** Interview problem (LeetCode 141): does the list contain a cycle? O(n) time, O(1) space. */
public final class Cycle {
    private Cycle() {}

    public static class ListNode {
        public int val;
        public ListNode next;

        public ListNode(int val) {
            this.val = val;
        }
    }

    public static boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;       // one step
            fast = fast.next.next;  // two steps
            if (slow == fast) return true; // the fast pointer lapped the slow one
        }
        return false; // fast reached the end: the list has an end, so no cycle
    }
}
