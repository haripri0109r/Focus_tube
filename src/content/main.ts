import { PageType, SessionState, UserPrefs } from '../types';
import { CAREER_PATH_PRESETS } from '../data/career-paths';
import { setupSpaNavigator } from './spa-navigator';
import { setupObserver, disconnectObserver, setStatsCallbacks } from './observer';
import { restoreAllHiddenElements, clearAllProcessedFlags } from './restore';
import { restoreShorts } from './filters/shorts';
import { healthCheck } from '../lib/health-check';
import { mountOverlay, unmountOverlay } from './overlay';

let currentTabId: number | null = null;
let currentPrefs: UserPrefs | null = null;
let currentSession: SessionState | null = null;

// Stats tracking
let localHiddenCount = 0;
let localShownCount = 0;
let hidesSinceLastFlush = 0;

async function init() {
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
      alwaysOn: false, defaultTopic: '', defaultKeywords: [], careerPath: null,
      filterHome: true, filterSearch: true, filterSidebar: true, filterShorts: true
    };
  }
  
  const sessionKey = `session_${currentTabId}`;
  const sessionData = await chrome.storage.local.get(sessionKey);
  currentSession = (sessionData[sessionKey] as SessionState) || {
    status: 'inactive', topic: '', keywords: [], startTime: 0, pausedDuration: 0, hiddenCount: 0, shownCount: 0
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    
    if (changes.focustube_prefs) {
      const p = changes.focustube_prefs.newValue as UserPrefs;
      if (p) p.defaultKeywords = p.defaultKeywords ?? [];
      currentPrefs = p;
      onFilterStateChange();
    }
    
    if (changes[`session_${currentTabId}`]) {
      currentSession = (changes[`session_${currentTabId}`].newValue as SessionState) || { status: 'inactive', topic: '', keywords: [], startTime: 0, pausedDuration: 0, hiddenCount: 0, shownCount: 0 };
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
    }
  );

  setupSpaNavigator(onNavigation);
  setupFlushListeners();
  
  // Kickstart on initial load
  onFilterStateChange();
}

function setupFlushListeners() {
  const flush = () => flushStats();
  window.addEventListener('pagehide', flush);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', flush);
}

function flushStats() {
  if (hidesSinceLastFlush > 0 && currentTabId && isFilterActive()) {
    chrome.runtime.sendMessage({
      type: 'SESSION_FLUSH_STATS',
      tabId: currentTabId,
      hiddenCount: localHiddenCount,
      shownCount: localShownCount
    });
    hidesSinceLastFlush = 0;
  }
}

function isFilterActive(): boolean {
  if (currentSession?.status === 'active') return true;
  if (currentSession?.status === 'paused') return false; 
  if (currentPrefs?.alwaysOn && ((currentPrefs.defaultKeywords ?? []).length > 0 || currentPrefs.careerPath)) return true;
  return false;
}

async function onFilterStateChange() {
  const active = isFilterActive();
  const pageType = getPageType(window.location.pathname);
  
  if (active) {
    unmountOverlay();
    removePreloadCss();
    const isHealthy = await healthCheck(pageType);
    if (isHealthy && currentPrefs) {
      const topic = currentSession?.status === 'active' ? currentSession.topic : currentPrefs.defaultTopic;
      setupObserver(pageType, getKeywords(), topic, currentPrefs);
    }
  } else {
    disconnectObserver();
    restoreAllHiddenElements();
    restoreShorts();
    
    if (pageType === 'home' && !currentPrefs?.alwaysOn && currentTabId) {
      mountOverlay(currentTabId);
      removePreloadCss();
    } else {
      unmountOverlay();
      removePreloadCss();
    }
  }
}

function onNavigation(pageType: PageType) {
  clearAllProcessedFlags();
  onFilterStateChange();
}

function removePreloadCss() {
  const el = document.getElementById('focustube-preload');
  if (el) el.remove();
}

function getPageType(pathname: string): PageType {
  if (pathname === '/' || pathname === '/feed/home') return 'home';
  if (pathname === '/feed/subscriptions') return 'subscriptions';
  if (pathname === '/results') return 'search';
  if (pathname === '/watch') return 'watch';
  if (pathname.startsWith('/shorts')) return 'shorts';
  return 'other';
}

function getKeywords(): string[] {
  // Career path keywords (supplemental, appended after session/custom)
  const careerKeywords = currentPrefs?.careerPath
    ? (CAREER_PATH_PRESETS[currentPrefs.careerPath] || [])
    : [];

  if (currentSession?.status === 'active') {
    // Priority: session keywords first, then career path keywords
    return Array.from(new Set([...currentSession.keywords, ...careerKeywords]));
  }
  if (currentPrefs?.alwaysOn) {
    // Priority: custom keywords first, then career path keywords
    return Array.from(new Set([...(currentPrefs.defaultKeywords ?? []), ...careerKeywords]));
  }
  return [];
}

init();
