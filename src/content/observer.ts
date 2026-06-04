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
  if (pageType === 'home') rootSelector = 'ytd-rich-grid-renderer #contents';
  else if (pageType === 'search') rootSelector = 'ytd-section-list-renderer #contents';
  else if (pageType === 'watch') rootSelector = '#secondary-inner';
  
  if (!rootSelector) return;
  
  const root = document.querySelector(rootSelector);
  if (!root) return;
  
  currentObserver = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      processFilters(pageType, keywords, prefs);
    }, 150);
  });
  
  currentObserver.observe(root, { childList: true, subtree: true });
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
    applySidebarFilter(keywords, onHideCallback, onShowCallback);
  }
}

