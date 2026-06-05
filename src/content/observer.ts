import { PageType, UserPrefs } from '../types';
import { applyHomepageFilter } from './filters/homepage';
import { applySearchFilter } from './filters/search';
import { applySidebarFilter } from './filters/sidebar';
import { applyShortsFilter } from './filters/shorts';

let currentObserver: MutationObserver | null = null;
let debounceTimer: number | null = null;

// Stats callbacks
let onHideCallback: () => void = () => {};
let onShowCallback: () => void = () => {};

/**
 * Waits for a selector to exist in the DOM before executing a callback.
 * This prevents race conditions on initial page load and SPA navigations.
 */
function waitForElement(selector: string, callback: (element: Element) => void) {
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds timeout (50 * 100ms)

  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    } else {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        console.warn(`FocusTube: Timed out waiting for element '${selector}'`);
      }
    }
  }, 100);
}

export function setStatsCallbacks(onHide: () => void, onShow: () => void) {
  onHideCallback = onHide;
  onShowCallback = onShow;
}

export function setupObserver(pageType: PageType, keywords: string[], topic: string, prefs: UserPrefs) {
  disconnectObserver();
  
  if (pageType === 'shorts' && prefs.filterShorts) {
    applyShortsFilter(topic, prefs.defaultTopic);
    return;
  }
  
  // Initial pass
  processFilters(pageType, keywords, prefs);
  
  let rootSelector = '';
  if (pageType === 'home') rootSelector = 'ytd-rich-grid-renderer';
  else if (pageType === 'search') rootSelector = 'ytd-section-list-renderer #contents';
  else if (pageType === 'watch') rootSelector = '#related';
  
  if (!rootSelector) return;
  
  // Wait for the root element to be present before attaching the observer
  waitForElement(rootSelector, (root) => {
    // Initial pass now that we have the root
    processFilters(pageType, keywords, prefs);

    currentObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        processFilters(pageType, keywords, prefs);
      }, 150);
    });
    
    currentObserver.observe(root, { childList: true, subtree: true });
  });
}

export function disconnectObserver() {
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
}

function processFilters(pageType: PageType, keywords: string[], prefs: UserPrefs) {
  if (pageType === 'home' && prefs.filterHome) {
    applyHomepageFilter(keywords, onHideCallback, onShowCallback);
  } else if (pageType === 'search' && prefs.filterSearch) {
    applySearchFilter(keywords, onHideCallback, onShowCallback, prefs.filterShorts);
  } else if (pageType === 'watch' && prefs.filterSidebar) {
    applyHomepageFilter(keywords, onHideCallback, onShowCallback);
  }
}
