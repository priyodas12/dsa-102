package hashmap;

import java.util.ArrayList;
import java.util.List;

/** A String-to-int hash map using separate chaining. Mirrors web/topics/hashmap/steps.js. */
public class ChainedHashMap {
    private static class Entry {
        final String key;
        int value;

        Entry(String key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    private static final double LOAD_FACTOR = 0.75;

    private List<Entry>[] buckets;
    private int size;

    public ChainedHashMap(int capacity) {
        if (capacity < 1) throw new IllegalArgumentException("capacity must be >= 1");
        buckets = newTable(capacity);
    }

    public int size() {
        return size;
    }

    public int capacity() {
        return buckets.length;
    }

    /** O(1) on average: hash, pick one bucket, scan its short chain. */
    public void put(String key, int value) {
        int index = indexFor(key, buckets.length);
        for (Entry e : buckets[index]) {
            if (e.key.equals(key)) {
                e.value = value; // key exists: update
                return;
            }
        }
        buckets[index].add(new Entry(key, value)); // new key: join the end of the chain
        if (++size > buckets.length * LOAD_FACTOR) resize();
    }

    /** Returns null when the key is absent. */
    public Integer get(String key) {
        for (Entry e : buckets[indexFor(key, buckets.length)]) {
            if (e.key.equals(key)) return e.value;
        }
        return null; // not in its bucket, so not in the map
    }

    public boolean remove(String key) {
        boolean removed = buckets[indexFor(key, buckets.length)].removeIf(e -> e.key.equals(key));
        if (removed) size--;
        return removed;
    }

    /** O(n), but rare: doubling keeps put O(1) amortized. */
    private void resize() {
        List<Entry>[] old = buckets;
        buckets = newTable(old.length * 2);
        for (List<Entry> chain : old) {
            for (Entry e : chain) {
                buckets[indexFor(e.key, buckets.length)].add(e); // every entry gets a new index
            }
        }
    }

    /** floorMod, because hashCode() can be negative and % can then be negative too. */
    private static int indexFor(String key, int capacity) {
        return Math.floorMod(key.hashCode(), capacity);
    }

    @SuppressWarnings("unchecked")
    private static List<Entry>[] newTable(int capacity) {
        List<Entry>[] table = new List[capacity];
        for (int i = 0; i < capacity; i++) table[i] = new ArrayList<>();
        return table;
    }
}
