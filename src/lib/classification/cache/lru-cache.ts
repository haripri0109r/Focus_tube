/**
 * LRU Cache
 *
 * A Map-backed, O(1) Least Recently Used cache.
 * Memory-bounded at `capacity` entries — oldest entries are evicted automatically.
 * WeakRef is NOT used here because cache keys are strings (primitives).
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key); // refresh position
    } else if (this.cache.size >= this.capacity) {
      // Evict LRU entry (first entry in Map iteration order)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
