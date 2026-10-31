package hashmap;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class HashMapTest {
    @Test
    void putGetAndUpdate() {
        ChainedHashMap map = new ChainedHashMap(4);
        map.put("cat", 3);
        map.put("dog", 8);
        assertEquals(3, map.get("cat"));
        map.put("cat", 30); // update, not a second entry
        assertEquals(30, map.get("cat"));
        assertEquals(2, map.size());
        assertNull(map.get("owl"));
    }

    @Test
    void collidingKeysShareABucketAndBothStayReachable() {
        ChainedHashMap map = new ChainedHashMap(4);
        map.put("cat", 3); // "cat" and "bee" both land in bucket 2 when there are 4 buckets
        map.put("bee", 5);
        assertEquals(3, map.get("cat"));
        assertEquals(5, map.get("bee"));
        assertTrue(map.remove("cat"));
        assertEquals(5, map.get("bee"));
        assertNull(map.get("cat"));
    }

    @Test
    void growsByDoublingAndKeepsEveryEntry() {
        ChainedHashMap map = new ChainedHashMap(4);
        for (int i = 0; i < 50; i++) map.put("k" + i, i);
        assertEquals(50, map.size());
        assertTrue(map.capacity() >= 64);
        for (int i = 0; i < 50; i++) assertEquals(i, map.get("k" + i));
    }

    @Test
    void removeMissingKeyChangesNothing() {
        ChainedHashMap map = new ChainedHashMap(4);
        map.put("a", 1);
        assertFalse(map.remove("zzz"));
        assertEquals(1, map.size());
    }

    @Test
    void negativeHashCodesStillPickAValidBucket() {
        ChainedHashMap map = new ChainedHashMap(8);
        map.put("polygenelubricants", 1); // its hashCode() is Integer.MIN_VALUE
        assertEquals(1, map.get("polygenelubricants"));
    }

    @Test
    void twoSum() {
        assertArrayEquals(new int[] {0, 1}, TwoSum.twoSum(new int[] {2, 7, 11, 15}, 9));
        assertArrayEquals(new int[] {0, 1}, TwoSum.twoSum(new int[] {3, 3}, 6));
        assertArrayEquals(new int[] {0, 2}, TwoSum.twoSum(new int[] {-3, 4, 3, 90}, 0));
        assertNull(TwoSum.twoSum(new int[] {3, 5}, 6)); // 3 + 3 would reuse index 0
        assertNull(TwoSum.twoSum(new int[] {}, 1));
    }
}
