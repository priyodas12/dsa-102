package slidingwindow;

import java.util.HashSet;
import java.util.Set;

/** Classic sliding window problems. Each mirrors a problem in web/topics/slidingwindow/steps.js. */
public final class SlidingWindow {
    private SlidingWindow() {}

    /** Fixed window: the largest sum of k consecutive numbers. O(n) time, O(1) space. Needs 1 <= k <= a.length. */
    public static int maxSumOfK(int[] a, int k) {
        int sum = 0;
        for (int i = 0; i < k; i++) sum += a[i]; // the first window
        int best = sum;
        for (int right = k; right < a.length; right++) {
            sum += a[right] - a[right - k]; // slide: add the new value, drop the old one
            best = Math.max(best, sum);
        }
        return best;
    }

    /** Variable window, LeetCode 3: length of the longest substring without repeating characters. */
    public static int lengthOfLongestSubstring(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            while (window.contains(s.charAt(right))) { // duplicate: shrink from the left, as often as needed
                window.remove(s.charAt(left));
                left++;
            }
            window.add(s.charAt(right));
            best = Math.max(best, right - left + 1);
        }
        return best;
    }

    /** Variable window, LeetCode 209: shortest subarray with sum >= target, or 0. All values must be positive. */
    public static int minSubArrayLen(int target, int[] a) {
        int left = 0, sum = 0, best = Integer.MAX_VALUE;
        for (int right = 0; right < a.length; right++) {
            sum += a[right]; // grow the window on the right
            while (sum >= target) { // big enough: record it, then try to shrink from the left
                best = Math.min(best, right - left + 1);
                sum -= a[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }
}
