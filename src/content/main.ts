import { PageType, SessionState, UserPrefs } from '../types';
import { CAREER_PATH_PRESETS } from '../data/career-paths';
import { setupSpaNavigator, getPageType } from './spa-navigator';
import { restoreAllHiddenElements, clearAllProcessedFlags } from './restore';
import { restoreShorts } from './filters/shorts';
import { setupObserver, disconnectObserver, setStatsCallbacks, restoreAllGlobalBlockers, cancelPendingTasks } from './observer';
import { mountOverlay, unmountOverlay } from './overlay';

let currentTabId: number | null = null;
let currentPrefs: UserPrefs | null = null;
let currentSession: SessionState | null = null;

// Stats tracking
let localHiddenCount = 0;
let localShownCount = 0;
let hidesSinceLastFlush = 0;

async function init() {
  document.documentElement.dataset.extensionId = chrome.runtime.id;

  const result = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT' });
  if (!result || !result.tabId) return;
  currentTabId = result.tabId;

  const prefsData = await chrome.storage.local.get('focustube_prefs');
  const p = prefsData.focustube_prefs as UserPrefs | undefined;
  if (p) {
    p.defaultKeywords = p.defaultKeywords ?? [];
    currentPrefs = p;
  } else {
    currentPrefs = {
      alwaysOn: false,
      defaultTopic: '',
      defaultKeywords: [],
      careerPath: null,
      filterHome: true,
      filterSearch: true,
      filterSidebar: true,
      filterShorts: true,
      strictMode: false,
    };
  }

  const sessionKey = `session_${currentTabId}`;
  const sessionData = await chrome.storage.local.get(sessionKey);
  currentSession = (sessionData[sessionKey] as SessionState) || {
    status: 'inactive',
    topic: '',
    keywords: [],
    startTime: 0,
    pausedDuration: 0,
    hiddenCount: 0,
    shownCount: 0,
  };

  // Listen for storage changes (session start/end, prefs changes)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.focustube_prefs) {
      const p = changes.focustube_prefs.newValue as UserPrefs;
      if (p) p.defaultKeywords = p.defaultKeywords ?? [];
      currentPrefs = p;
      onFilterStateChange();
    }

    if (changes[`session_${currentTabId}`]) {
      currentSession = (changes[`session_${currentTabId}`].newValue as SessionState) || {
        status: 'inactive',
        topic: '',
        keywords: [],
        startTime: 0,
        pausedDuration: 0,
        hiddenCount: 0,
        shownCount: 0,
      };
      onFilterStateChange();
    }
  });

  setStatsCallbacks(
    () => {
      localHiddenCount++;
      hidesSinceLastFlush++;
      if (hidesSinceLastFlush >= 10) {
        flushStats();
      }
    },
    () => {
      localShownCount++;
    },
  );

  setupSpaNavigator(
    () => {
      // Immediate cancellation and preemptive actions on navigation start
      if (isFilterActive()) {
        cancelPendingTasks();
      }
    },
    onNavigation
  );
  
  setupFlushListeners();

  // Kickstart on initial load
  onFilterStateChange();
}

function setupFlushListeners(): void {
  const flush = () => flushStats();
  window.addEventListener('pagehide', flush);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', flush);
}

function flushStats(): void {
  if (hidesSinceLastFlush > 0 && currentTabId && isFilterActive()) {
    chrome.runtime.sendMessage({
      type: 'SESSION_FLUSH_STATS',
      tabId: currentTabId,
      hiddenCount: localHiddenCount,
      shownCount: localShownCount,
    });
    hidesSinceLastFlush = 0;
  }
}

function isFilterActive(): boolean {
  if (currentSession?.status === 'active') return true;
  if (currentSession?.status === 'paused') return false;
  if (
    currentPrefs?.alwaysOn &&
    ((currentPrefs.defaultKeywords ?? []).length > 0 || currentPrefs.careerPath)
  ) {
    return true;
  }
  return false;
}

async function onFilterStateChange(): Promise<void> {
  const active = isFilterActive();
  const pageType = getPageType(window.location.pathname);

  if (active) {
    unmountOverlay();
    removePreloadCss();
    injectGlobalBlockerCss();

    if (currentPrefs) {
      const topic =
        currentSession?.status === 'active'
          ? currentSession.topic
          : currentPrefs.defaultTopic;
      setupObserver(pageType, getKeywords(), topic, currentPrefs);
    }
  } else {
    disconnectObserver();
    restoreAllHiddenElements();
    restoreShorts();
    restoreAllGlobalBlockers();
    removeGlobalBlockerCss();

    if (pageType === 'home' && !currentPrefs?.alwaysOn && currentTabId) {
      mountOverlay(currentTabId);
      removePreloadCss();
    } else {
      unmountOverlay();
      removePreloadCss();
    }
  }
}

function onNavigation(pageType: PageType): void {
  clearAllProcessedFlags();
  onFilterStateChange();
}

function removePreloadCss(): void {
  const el = document.getElementById('focustube-preload');
  if (el) el.remove();
}

function injectGlobalBlockerCss(): void {
  if (document.getElementById('focustube-global-css')) return;
  const style = document.createElement('style');
  style.id = 'focustube-global-css';
  style.textContent = `
    /* Hide end-screen video recommendations */
    .ytp-endscreen-content { display: none !important; }
    /* Hide the miniplayer if it tries to pop up */
    ytd-miniplayer { display: none !important; }
    
    /* Global Anti-Flicker: Hide any video/short that hasn't been processed by FocusTube yet */
    ytd-video-renderer:not([data-focustube-hidden]),
    ytd-grid-video-renderer:not([data-focustube-hidden]),
    ytd-rich-item-renderer:not([data-focustube-hidden]),
    ytd-compact-video-renderer:not([data-focustube-hidden]) {
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.documentElement.appendChild(style);
}

function removeGlobalBlockerCss(): void {
  const el = document.getElementById('focustube-global-css');
  if (el) el.remove();
}

function getKeywords(): string[] {
  const careerKeywords = currentPrefs?.careerPath
    ? (CAREER_PATH_PRESETS[currentPrefs.careerPath] || [])
    : [];

  if (currentSession?.status === 'active') {
    return Array.from(new Set([...currentSession.keywords, ...careerKeywords]));
  }
  if (currentPrefs?.alwaysOn) {
    return Array.from(new Set([...(currentPrefs.defaultKeywords ?? []), ...careerKeywords]));
  }
  return [];
}

init();
