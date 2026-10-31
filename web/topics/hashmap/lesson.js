export const lesson = {
  title: 'Hash map',
  why: 'Looking something up in an array by value means checking items one by one: O(n). A hash map answers "what is stored under this key?" in about one step, however many entries there are, by turning the key itself into the location to look at. That makes it the most-used tool for speeding up slow solutions: counting, caching, finding duplicates, matching pairs.',
  how: [
    'The map is an array of buckets. A hash function turns a key into a number (a hash), and index = hash mod (number of buckets) picks the bucket where the key lives.',
    'Java\'s String.hashCode is h = h × 31 + each character. The same key always gives the same hash, so get() goes straight back to the bucket put() used.',
    'Two different keys can land in the same bucket: a collision. They are unavoidable (many more possible keys than buckets), so the map must handle them.',
    'Separate chaining, shown here, keeps a small list in each bucket. A lookup hashes the key, goes to that one bucket, and compares keys along its chain.',
    'If chains get long, lookups slow down. So the map watches its load factor, size ÷ buckets. When it exceeds 0.75 the table doubles and every entry is rehashed, because index = hash mod newSize changes.',
    'With a good hash function and the load factor kept low, chains stay about one entry long, so put, get and remove are O(1) on average.',
  ],
  operations: {
    put: { name: 'Put', time: 'O(1) average', space: 'O(1)', note: 'Worst case O(n) if every key collides into one chain. A resize step costs O(n) but happens rarely, so the average stays O(1) (amortized).' },
    get: { name: 'Get', time: 'O(1) average', space: 'O(1)', note: 'One hash, one bucket, a short chain. The number of entries in the map barely matters.' },
    remove: { name: 'Remove', time: 'O(1) average', space: 'O(1)', note: 'Same path as get: find the bucket, find the key in the chain, unlink it.' },
    twoSum: { name: 'Two Sum', time: 'O(n)', space: 'O(n)', note: 'One pass with an O(1) lookup per number, instead of a nested loop checking every pair, which would be O(n²). We pay O(n) memory for the map.' },
  },
  tradeoffs: [
    'Use a hash map when you need fast lookup by exact key and do not care about order. It trades memory (spare buckets) for speed.',
    'A hash map has no useful order. If you need sorted keys, ranges or "next larger key", use a TreeMap (a balanced tree) with O(log n) operations.',
    'A HashSet is just a hash map that stores keys only. Use it for "have I seen this before?".',
    'The "store what you have seen, check for what you need" pattern from Two Sum turns many O(n²) pair-search problems into O(n).',
    'Open addressing is the main alternative to chaining: on a collision it probes other slots in the same array instead of chaining. Java\'s HashMap uses chaining (and turns long chains into trees).',
  ],
  pitfalls: [
    'Mutable keys: if a key\'s fields change after it was put, its hash changes and the entry is lost in the wrong bucket. Use immutable keys such as String and Integer.',
    'Overriding equals() without hashCode() (or the other way round) breaks lookups. Equal keys must have equal hashes.',
    'A bad hash function sends many keys to one bucket and makes the map as slow as a list. Hashing every key to 0 is legal but useless.',
    'Negative hashes: use Math.floorMod(hash, size), because hash % size can be negative in Java.',
    'Two Sum: look for the partner before storing the current number, or a number could pair with itself.',
    'put on an existing key replaces the value rather than adding a second entry.',
    'The map\'s iteration order is not the order you inserted keys in. Use LinkedHashMap if you need that.',
  ],
};
