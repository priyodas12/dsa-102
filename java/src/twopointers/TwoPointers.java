package twopointers;

/** Classic two pointers problems. Each mirrors a problem in web/topics/twopointers/steps.js. */
public final class TwoPointers {
    private TwoPointers() {}

    /** Opposite ends. LeetCode 167: indices of two numbers in a sorted array that add up to target, or null. O(n) time, O(1) space. */
    public static int[] twoSumSorted(int[] a, int target) {
        int left = 0, right = a.length - 1;
        while (left < right) {
            int sum = a[left] + a[right];
            if (sum == target) return new int[] {left, right};
            if (sum < target) left++; // too small: only a bigger left value can help
            else right--;             // too big: only a smaller right value can help
        }
        return null;
    }

    /** Opposite ends. LeetCode 125: palindrome ignoring case and non-alphanumeric characters. */
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (!Character.isLetterOrDigit(s.charAt(left))) { left++; continue; }
            if (!Character.isLetterOrDigit(s.charAt(right))) { right--; continue; }
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
            left++;
            right--;
        }
        return true;
    }

    /** Slow and fast. LeetCode 26: compact a sorted array in place and return the new length. */
    public static int removeDuplicates(int[] a) {
        if (a.length == 0) return 0;
        int slow = 0; // a[0..slow] holds the unique values found so far
        for (int fast = 1; fast < a.length; fast++) {
            if (a[fast] != a[slow]) {
                slow++;
                a[slow] = a[fast];
            }
        }
        return slow + 1; // the new length
    }

    /** Opposite ends. LeetCode 11: the most water two walls can hold. Always move the shorter wall. */
    public static int maxArea(int[] h) {
        int left = 0, right = h.length - 1, best = 0;
        while (left < right) {
            int area = Math.min(h[left], h[right]) * (right - left);
            best = Math.max(best, area);
            if (h[left] < h[right]) left++; else right--;
        }
        return best;
    }
}
