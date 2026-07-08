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

export function setupSpaNavigator(onNavigate: (pageType: PageType) => void): void {
  const handleNavigation = () => {
    const currentUrl = window.location.href;

    // Deduplicate: only trigger if URL actually changed
    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const pageType = getPageType(window.location.pathname);
      onNavigate(pageType);
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
  return 'other';
}
