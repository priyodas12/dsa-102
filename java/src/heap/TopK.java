package heap;

import java.util.PriorityQueue;

/** Interview problem (LeetCode 215 / 703): the k largest values. O(n log k) time, O(k) space. */
public final class TopK {
    private TopK() {}

    /** Returns the k largest values, in no particular order. */
    public static int[] largest(int[] nums, int k) {
        if (k < 1 || k > nums.length) throw new IllegalArgumentException("k must be in 1.." + nums.length);
        PriorityQueue<Integer> heap = new PriorityQueue<>(); // min-heap of the k best so far
        for (int x : nums) {
            if (heap.size() < k) heap.add(x);
            else if (x > heap.peek()) { heap.poll(); heap.add(x); } // the root is the weakest of the best
        }
        return heap.stream().mapToInt(Integer::intValue).toArray();
    }

    public static int kthLargest(int[] nums, int k) {
        int[] best = largest(nums, k);
        int min = Integer.MAX_VALUE;
        for (int v : best) min = Math.min(min, v);
        return min;
    }
}
