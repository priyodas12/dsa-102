package hashmap;

import java.util.HashMap;
import java.util.Map;

/** Interview problem (LeetCode 1): two numbers that add up to target. O(n) time, O(n) space. */
public final class TwoSum {
    private TwoSum() {}

    /** Returns the two indices, or null if there is no such pair. */
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>(); // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[] {seen.get(need), i}; // look before storing
            seen.put(nums[i], i);
        }
        return null;
    }
}
