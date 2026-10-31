package queue;

import java.util.ArrayDeque;
import java.util.Queue;

/** Interview problem: Josephus / hot potato. O(n * k) time, O(n) space. */
public final class HotPotato {
    private HotPotato() {}

    public static int lastSurvivor(int n, int k) {
        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) q.add(i);
        while (q.size() > 1) {
            for (int i = 1; i < k; i++) q.add(q.remove()); // pass the potato
            q.remove(); // the k-th person is out
        }
        return q.remove();
    }
}
