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
import { applyShortsFilter } from './filters/shorts';

let currentObserver: MutationObserver | null = null;
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

const DEBOUNCE_DELAY = 300;   // ms — wait for DOM to settle after mutations
const DEBOUNCE_MAX_WAIT = 2000; // ms — maximum wait before forcing a filter pass

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

  // Shorts page: apply blocker and return (no need for a mutation observer)
  if (pageType === 'shorts' && prefs.filterShorts) {
    applyShortsFilter(topic, prefs.defaultTopic);
    return;
  }

  // Initial synchronous filter pass (catches cards already in DOM)
  processFilters(pageType, keywords, prefs);

  // Determine which element to observe
  const rootSelector = getRootSelector(pageType);

  // Observe document.body as permanent fallback — it's always available.
  // If the specific root element is found, switch to it for better performance.
  startObserver(document.body, pageType, keywords, prefs, rootSelector);
}

function startObserver(
  initialRoot: Element,
  pageType: PageType,
  keywords: string[],
  prefs: UserPrefs,
  preferredSelector: string,
): void {
  let observedRoot = initialRoot;

  currentObserver = new MutationObserver(() => {
    debouncedWithMaxWait(() => {
      // Opportunistically upgrade from body to the specific root
      if (observedRoot === document.body && preferredSelector) {
        const specificRoot = document.querySelector(preferredSelector);
        if (specificRoot) {
          currentObserver?.disconnect();
          observedRoot = specificRoot;
          currentObserver?.observe(observedRoot, { childList: true, subtree: true });
        }
      }

      processFilters(pageType, keywords, prefs);
    });
  });

  currentObserver.observe(observedRoot, { childList: true, subtree: true });

  // Try to immediately upgrade to the specific root if it already exists
  if (preferredSelector && initialRoot === document.body) {
    const specificRoot = document.querySelector(preferredSelector);
    if (specificRoot) {
      currentObserver.disconnect();
      observedRoot = specificRoot;
      currentObserver.observe(observedRoot, { childList: true, subtree: true });
    }
  }
}

// ---------------------------------------------------------------------------
// Filter routing — THIS IS WHERE BUG 1 WAS
// ---------------------------------------------------------------------------

function processFilters(pageType: PageType, keywords: string[], prefs: UserPrefs): void {
  if (pageType === 'home' || pageType === 'subscriptions') {
    if (prefs.filterHome) {
      applyHomepageFilter(keywords, onHideCallback, onShowCallback, prefs);
    }
  } else if (pageType === 'search') {
    if (prefs.filterSearch) {
      applySearchFilter(keywords, onHideCallback, onShowCallback, prefs.filterShorts, prefs);
    }
  } else if (pageType === 'watch') {
    // ✅ FIX: was incorrectly calling applyHomepageFilter here
    if (prefs.filterSidebar) {
      applySidebarFilter(keywords, onHideCallback, onShowCallback, prefs);
    }
  }
}

function getRootSelector(pageType: PageType): string {
  switch (pageType) {
    case 'home':
    case 'subscriptions': return 'ytd-rich-grid-renderer';
    case 'search':        return 'ytd-section-list-renderer #contents';
    case 'watch':         return '#secondary';
    default:              return '';
  }
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

export function disconnectObserver(): void {
  currentObserver?.disconnect();
  currentObserver = null;
  clearAllTimers();
}
