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
function waitForElement(selector: string, callback: (element: Element, isFallback: boolean) => void) {
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds timeout (50 * 100ms)

  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element, false);
    } else {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        console.warn(`FocusTube: Timed out waiting for element '${selector}', falling back to document.body`);
        callback(document.body, true);
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
  else if (pageType === 'subscriptions') rootSelector = 'ytd-rich-grid-renderer';
  else if (pageType === 'search') rootSelector = 'ytd-section-list-renderer #contents';
  else if (pageType === 'watch') rootSelector = '#related';
  
  if (!rootSelector) return;
  
  // Wait for the root element to be present before attaching the observer
  waitForElement(rootSelector, (root, isFallback) => {
    // Initial pass now that we have the root (or body)
    processFilters(pageType, keywords, prefs);

    let currentObserved = root;
    currentObserver = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        if (isFallback && currentObserved === document.body) {
           const realRoot = document.querySelector(rootSelector);
           if (realRoot) {
               currentObserver?.disconnect();
               currentObserved = realRoot;
               currentObserver?.observe(realRoot, { childList: true, subtree: true });
               console.log(`FocusTube: Reconnected observer to '${rootSelector}'`);
           }
        }
        processFilters(pageType, keywords, prefs);
      }, 150);
    });
    
    currentObserver.observe(currentObserved, { childList: true, subtree: true });
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
  if ((pageType === 'home' || pageType === 'subscriptions') && prefs.filterHome) {
    applyHomepageFilter(keywords, onHideCallback, onShowCallback);
  } else if (pageType === 'search' && prefs.filterSearch) {
    applySearchFilter(keywords, onHideCallback, onShowCallback, prefs.filterShorts);
  } else if (pageType === 'watch' && prefs.filterSidebar) {
    applyHomepageFilter(keywords, onHideCallback, onShowCallback);
  }
}
