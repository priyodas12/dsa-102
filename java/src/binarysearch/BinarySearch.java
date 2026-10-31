package binarysearch;

/** Classic binary search problems. Each mirrors a problem in web/topics/binarysearch/steps.js. */
public final class BinarySearch {
    private BinarySearch() {}

    /** Index of target in a sorted array (any one of them if there are duplicates), or -1. O(log n). */
    public static int binarySearch(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2; // not (lo + hi) / 2: that can overflow
            if (a[mid] == target) return mid;
            if (a[mid] < target) lo = mid + 1; // the target is in the right half
            else hi = mid - 1;                 // the target is in the left half
        }
        return -1;
    }

    /** First index whose value is >= target, or a.length if there is none. O(log n). */
    public static int lowerBound(int[] a, int target) {
        int lo = 0, hi = a.length; // hi is one past the end: the answer can be a.length
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] < target) lo = mid + 1; // everything up to mid is too small
            else hi = mid;                     // mid might be the answer: keep it
        }
        return lo;
    }

    /** LeetCode 33: search a sorted array of distinct values that has been rotated. O(log n). */
    public static int searchRotated(int[] a, int target) {
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == target) return mid;
            if (a[lo] <= a[mid]) { // the left half is sorted
                if (a[lo] <= target && target < a[mid]) hi = mid - 1; else lo = mid + 1;
            } else {               // the right half is sorted
                if (a[mid] < target && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
            }
        }
        return -1;
    }

    /** LeetCode 69: binary search on the answer. The biggest whole number whose square is at most x. O(log x). */
    public static int mySqrt(int x) {
        int lo = 0, hi = x, ans = 0;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if ((long) mid * mid <= x) { ans = mid; lo = mid + 1; } // mid works: try a bigger one
            else hi = mid - 1;                                      // too big: try a smaller one
        }
        return ans;
    }
}
