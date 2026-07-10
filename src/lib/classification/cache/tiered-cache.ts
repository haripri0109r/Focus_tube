/**
 * Tiered Cache
 *
 * Multi-dimensional cache key strategy:
 *   Tier 1: videoId (YouTube ID — most precise, never collides)
 *   Tier 2: hash(title + channel + duration)
 *   Tier 3: hash(title + channel)  [fallback]
 *
 * The context suffix encodes taxonomy version, classifier version,
 * profile ID, and topic so that changing any of these automatically
 * bypasses stale cached results without explicit invalidation.
 *
 * L1: in-memory LRU (2000 entries)
 * L2: chrome.storage.local (debounced flush every 5s)
 */

import { ClassificationResult, ClassificationVideoMetadata, CacheContextKey } from '../types';
import { LRUCache } from './lru-cache';
import { hashString } from '../utils/hash';

const L1_CAPACITY = 2000;
const STORAGE_KEY = 'ft_classification_cache_v1';
const FLUSH_DEBOUNCE_MS = 5000;

export class TieredCache {
  private l1 = new LRUCache<string, ClassificationResult>(L1_CAPACITY);
  private pendingFlush: ReturnType<typeof setTimeout> | null = null;
  private pendingWrites: Record<string, ClassificationResult> = {};

  buildKey(meta: ClassificationVideoMetadata, ctx: CacheContextKey): string {
    const suffix = `${ctx.taxonomyVersion}|${ctx.classifierVersion}|${ctx.profileId}|${hashString(ctx.topic)}|${ctx.flagsHash}`;

    if (meta.videoId) {
      return `v1:${meta.videoId}:${suffix}`;
    }
    if (meta.videoLengthSeconds) {
      return `v2:${hashString(`${meta.title}|${meta.channel}|${meta.videoLengthSeconds}`)}:${suffix}`;
    }
    return `v3:${hashString(`${meta.title}|${meta.channel}`)}:${suffix}`;
  }

  get(key: string): ClassificationResult | null {
    return this.l1.get(key) ?? null;
  }

  set(key: string, result: ClassificationResult): void {
    this.l1.set(key, result);
    this.pendingWrites[key] = result;
    this.scheduleFlushl();
  }

  /** Clears L1 (e.g. on topic change or profile switch) */
  invalidateMemory(): void {
    this.l1.clear();
  }

  /** Async warm L1 from chrome.storage.local on startup */
  async warmFromStorage(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get(STORAGE_KEY);
      const entries: Record<string, ClassificationResult> = stored[STORAGE_KEY] ?? {};
      let loaded = 0;
      for (const [key, value] of Object.entries(entries)) {
        if (loaded >= L1_CAPACITY / 2) break; // only warm half capacity
        this.l1.set(key, value);
        loaded++;
      }
    } catch {
      // chrome.storage not available (e.g. in unit tests) — ignore
    }
  }

  private scheduleFlushl(): void {
    if (this.pendingFlush) return;
    this.pendingFlush = setTimeout(() => this.flush(), FLUSH_DEBOUNCE_MS);
  }

  private async flush(): Promise<void> {
    this.pendingFlush = null;
    const toWrite = { ...this.pendingWrites };
    this.pendingWrites = {};
    if (Object.keys(toWrite).length === 0) return;
    try {
      const stored = await chrome.storage.local.get(STORAGE_KEY);
      const existing: Record<string, ClassificationResult> = stored[STORAGE_KEY] ?? {};
      const merged = { ...existing, ...toWrite };
      // Trim to last 5000 entries to prevent unbounded growth
      const trimmed = Object.fromEntries(Object.entries(merged).slice(-5000));
      await chrome.storage.local.set({ [STORAGE_KEY]: trimmed });
    } catch {
      // Ignore storage errors
    }
  }
}
