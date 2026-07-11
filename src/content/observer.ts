/**
 * FocusTube MutationObserver
 *
 * Watches the YouTube DOM for newly inserted video cards and applies
 * the appropriate filter. Uses a debounced trailing-edge callback with
 * a maxWait cap so it handles both rapid card insertions (initial page
 * load) and slow infinite-scroll additions.
 *
 * Key fixes vs. v1:
 * - Watch page now correctly routes to applySidebarFilter (was applyHomepageFilter)
 * - Debounce has a 2000ms maxWait cap (prevents waiting forever on busy pages)
 * - Uses shared WeakSet from utils.ts — no stale DOM attribute tracking
 * - Observer always falls back to document.body if target element not found
 */

import { PageType, UserPrefs } from '../types';
import { applyHomepageFilter } from './filters/homepage';
import { applySearchFilter } from './filters/search';
import { applySidebarFilter } from './filters/sidebar';
import { applyShortsFilter, restoreShorts } from './filters/shorts';
import { applyRouteBlocker, removeRouteBlocker } from './filters/route-blocker';
import { applyChannelFilter, removeChannelBlocker } from './filters/channel';
import { applyWatchPlayerFilter, setupWatchPlayerObserver, disconnectPlayerObserver, removePlayerBlocker } from './filters/watch-player';
import { applyNotificationsFilter } from './filters/notifications';

let currentObserver: MutationObserver | null = null;
let videoObserver: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let maxWaitTimer: ReturnType<typeof setTimeout> | null = null;

/** Stats callbacks set by main.ts */
let onHideCallback: () => void = () => {};
let onShowCallback: () => void = () => {};

export function setStatsCallbacks(onHide: () => void, onShow: () => void): void {
  onHideCallback = onHide;
  onShowCallback = onShow;
}

// ---------------------------------------------------------------------------
// Debounce with maxWait
// ---------------------------------------------------------------------------

const DEBOUNCE_DELAY = 50;   // ms — wait for DOM to settle after mutations (reduced from 300ms for speed)
const DEBOUNCE_MAX_WAIT = 200; // ms — maximum wait before forcing a filter pass (reduced from 2000ms)

/**
 * Schedules `fn` to run after DEBOUNCE_DELAY ms of inactivity,
 * but guarantees it runs within DEBOUNCE_MAX_WAIT ms even if mutations
 * keep firing continuously (e.g. during initial YouTube page load).
 */
function debouncedWithMaxWait(fn: () => void): void {
  // Reset the trailing debounce
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (maxWaitTimer) clearTimeout(maxWaitTimer);
    maxWaitTimer = null;
    fn();
  }, DEBOUNCE_DELAY);

  // Set maxWait timer only if not already running
  if (!maxWaitTimer) {
    maxWaitTimer = setTimeout(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = null;
      maxWaitTimer = null;
      fn();
    }, DEBOUNCE_MAX_WAIT);
  }
}

function clearAllTimers(): void {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  if (maxWaitTimer)  { clearTimeout(maxWaitTimer);  maxWaitTimer = null;  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function setupObserver(
  pageType: PageType,
  keywords: string[],
  topic: string,
  prefs: UserPrefs,
): void {
  disconnectObserver();

  // 1. Route Blocking (Gaming, Music, Trending, etc.)
  if (applyRouteBlocker(pageType, topic, prefs.defaultTopic)) {
    return; // Stop setting up filters, page is fully blocked
  }

  // 2. Channel Page Blocking
  if (pageType === 'channel') {
    if (applyChannelFilter(keywords, prefs)) {
      return; // Stop here if channel is blocked
    }
    // If not blocked, we could apply search filter to its videos, but for now we just allow it
  }

  // 3. Shorts Blocking
  if (pageType === 'shorts' && prefs.filterShorts) {
    applyShortsFilter(topic, prefs.defaultTopic);
    return;
  }

  // 4. Watch Player Blocking
  if (pageType === 'watch') {
    applyWatchPlayerFilter(keywords, topic, prefs);
    setupWatchPlayerObserver(keywords, topic, prefs);
    // Continue to setupObserver to filter the sidebar recommendations
  }

  // Initial synchronous filter pass (catches cards already in DOM)
  processFilters(pageType, keywords, topic, prefs);

  // Observe ytd-page-manager (if present) or document.body as stable containers.
  // This guarantees we never lose mutations due to element recreation / SPA detachment.
  const stableRoot = document.querySelector('ytd-page-manager') || document.body;

  currentObserver = new MutationObserver(() => {
    debouncedWithMaxWait(() => {
      processFilters(pageType, keywords, topic, prefs);
    });
  });

  currentObserver.observe(stableRoot, { childList: true, subtree: true });

  // Global Video Observer for Miniplayer / Autoplay background changes
  if (!videoObserver) {
    videoObserver = new MutationObserver(() => {
      // If the video src changes, it means a new video loaded (e.g., via autoplay in miniplayer)
      // We should preemptively pause and re-evaluate if it's the main movie_player
      debouncedWithMaxWait(() => {
        applyWatchPlayerFilter(keywords, topic, prefs);
      });
    });
    
    // The video element might not exist immediately on load, we can observe the player container
    const player = document.querySelector('#movie_player video') || document.querySelector('video');
    if (player) {
      videoObserver.observe(player, { attributeFilter: ['src'] });
    }
  }
}

// ---------------------------------------------------------------------------
// Filter routing — THIS IS WHERE BUG 1 WAS
// ---------------------------------------------------------------------------

function processFilters(pageType: PageType, keywords: string[], topic: string, prefs: UserPrefs): void {
  console.log('[FT:OBSERVER]', { pageType, keywordsCount: keywords.length, keywords, filterHome: prefs.filterHome });
  if (pageType === 'home' || pageType === 'subscriptions') {
    if (prefs.filterHome) {
      applyHomepageFilter(keywords, topic, onHideCallback, onShowCallback, prefs);
    }
  } else if (pageType === 'search' || pageType === 'history' || pageType === 'library' || pageType === 'playlist' || pageType === 'explore') {
    if (prefs.filterSearch) {
      // Reuse the search filter for these list-style pages, it handles the same DOM structure
      applySearchFilter(keywords, onHideCallback, onShowCallback, prefs.filterShorts, prefs);
    }
  } else if (pageType === 'watch') {
    if (prefs.filterSidebar) {
      applySidebarFilter(keywords, onHideCallback, onShowCallback, prefs);
    }
  }

  // Always apply notifications filter globally
  applyNotificationsFilter(keywords, onHideCallback, onShowCallback, prefs);
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

export function disconnectObserver(): void {
  currentObserver?.disconnect();
  currentObserver = null;
  videoObserver?.disconnect();
  videoObserver = null;
  clearAllTimers();
  
  disconnectPlayerObserver();
}

export function cancelPendingTasks(): void {
  // If we are currently evaluating a video in the background, this will abort it
  disconnectPlayerObserver();
}

export function restoreAllGlobalBlockers(): void {
  removeRouteBlocker();
  removeChannelBlocker();
  removePlayerBlocker();
}
