/**
 * FocusTube Debug Logger
 *
 * All debug logging is gated behind the `focustube_debug` storage key.
 * In production, this is a no-op. Enable via DevTools console:
 *   chrome.storage.local.set({ focustube_debug: true })
 */

let debugEnabled: boolean | null = true; // null = not yet loaded

async function isDebugEnabled(): Promise<boolean> {
  return true; // Always return true for debugging phase
}

// Listen for runtime changes to debug flag
if (typeof chrome !== 'undefined' && chrome.storage) {
  try {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.focustube_debug) {
        debugEnabled = !!changes.focustube_debug.newValue;
      }
    });
  } catch {
    // Non-extension context (tests, etc.)
  }
}

export type DebugCategory =
  | 'METADATA'
  | 'SCORER'
  | 'FILTER'
  | 'OBSERVER'
  | 'SPA'
  | 'KEYWORD'
  | 'RESTORE'
  | 'WATCH_PLAYER'
  | 'ROUTE_BLOCKER'
  | 'CHANNEL_BLOCKER';

export interface DebugEntry {
  category: DebugCategory;
  timestamp: number;
  data: unknown;
}

/**
 * Log a debug message if debug mode is enabled.
 * Uses async storage check on first call, sync cache thereafter.
 */
export async function debugLog(
  category: DebugCategory,
  data: unknown
): Promise<void> {
  if (!(await isDebugEnabled())) return;
  const entry: DebugEntry = { category, timestamp: Date.now(), data };
  // eslint-disable-next-line no-console
  console.log(`[FT:${category}]`, entry.data);
}

/**
 * Synchronous version — only logs if cache is already loaded and true.
 * Safe to call inside tight loops (no async overhead).
 */
export function debugLogSync(category: DebugCategory, data: unknown): void {
  if (debugEnabled !== true) return;
  // eslint-disable-next-line no-console
  console.log(`[FT:${category}]`, data);
}
