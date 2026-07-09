import { PageType } from '../types';

/**
 * SPA Navigation Detector for YouTube
 *
 * YouTube is a Single Page Application (SPA) — it uses the History API
 * and custom events instead of full page reloads. We listen to multiple
 * signals to reliably detect page transitions:
 *
 * 1. `yt-navigate-finish` — YouTube's primary navigation event (most reliable)
 * 2. `yt-page-data-updated` — Fires when YouTube updates page data after navigation
 * 3. `popstate` — Browser back/forward navigation
 *
 * All signals are debounced to a single callback to avoid double-processing.
 */

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastUrl = window.location.href;

const DEBOUNCE_MS = 200;

export function setupSpaNavigator(
  onNavigateStart: () => void,
  onNavigateFinish: (pageType: PageType) => void
): void {
  // Navigation Start (Immediate)
  window.addEventListener('yt-navigate-start', () => {
    onNavigateStart();
  });

  // Navigation Finish (Debounced)
  const handleNavigation = () => {
    const currentUrl = window.location.href;

    // Deduplicate: only trigger if URL actually changed
    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const pageType = getPageType(window.location.pathname);
      onNavigateFinish(pageType);
    }, DEBOUNCE_MS);
  };

  // Primary: YouTube's own navigation event
  window.addEventListener('yt-navigate-finish', handleNavigation);

  // Secondary: YouTube page data update
  window.addEventListener('yt-page-data-updated', handleNavigation);

  // Fallback: browser history events (back/forward)
  window.addEventListener('popstate', handleNavigation);
}

export function getPageType(pathname: string): PageType {
  if (pathname === '/' || pathname === '/feed/home') return 'home';
  if (pathname === '/feed/subscriptions') return 'subscriptions';
  if (pathname === '/results') return 'search';
  if (pathname === '/watch') return 'watch';
  if (pathname.startsWith('/shorts')) return 'shorts';
  
  if (pathname === '/feed/history') return 'history';
  if (pathname === '/feed/library' || pathname === '/feed/you') return 'library';
  if (pathname === '/playlist') return 'playlist';
  
  // Channel pages usually start with /@ or /c/ or /channel/ or /user/
  if (
    pathname.startsWith('/@') || 
    pathname.startsWith('/c/') || 
    pathname.startsWith('/channel/') || 
    pathname.startsWith('/user/')
  ) {
    return 'channel';
  }

  // Purely entertainment or non-learning routes that will be blocked
  if (pathname === '/feed/trending') return 'trending';
  if (pathname === '/feed/explore') return 'explore';
  if (pathname === '/gaming') return 'gaming';
  if (pathname === '/music') return 'music';
  if (pathname === '/feed/storefront' || pathname === '/movies') return 'movies'; // Storefront is often movies
  if (pathname.startsWith('/live') || pathname === '/channel/UC4R8DWoMoI7CAwX8_LjQHig') return 'live'; // the Live channel
  if (pathname === '/channel/UC1XjB93C8Yd5uUjC1Z2R-3g') return 'fashion'; // Fashion & Beauty channel
  if (pathname === '/channel/UCEgdi0XIXXZ-qJOFPf4JSKw') return 'sports';
  if (pathname === '/channel/UCYfdidRxbB8Qhf0Nx7ioOYw') return 'news';

  return 'other';
}
