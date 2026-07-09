import { PageType } from '../../types';
import { debugLogSync } from '../../lib/debug';

const BLOCKED_ROUTES: Set<PageType> = new Set([
  'trending',
  'explore',
  'gaming',
  'music',
  'movies',
  'live',
  'fashion',
  'sports',
  'news',
]);

/**
 * Checks if the current page is a blocked entertainment route.
 * If so, hides the main content and shows an overlay.
 * 
 * @returns true if the route was blocked (meaning we shouldn't run other filters).
 */
export function applyRouteBlocker(pageType: PageType, topic: string, defaultTopic: string): boolean {
  if (!BLOCKED_ROUTES.has(pageType)) {
    removeRouteBlocker();
    return false;
  }

  debugLogSync('ROUTE_BLOCKER', { decision: 'block', route: pageType });

  // Hide the main YouTube app container but keep the top navigation bar
  const appContainer = document.querySelector('ytd-app') as HTMLElement | null;
  const pageManager = document.querySelector('#page-manager') as HTMLElement | null;

  if (pageManager) {
    pageManager.style.setProperty('display', 'none', 'important');
  } else if (appContainer) {
    // Fallback if page-manager isn't ready
    appContainer.style.setProperty('display', 'none', 'important');
  }

  // Inject overlay if it doesn't exist
  if (!document.getElementById('focustube-route-blocker')) {
    const blocker = document.createElement('div');
    blocker.id = 'focustube-route-blocker';
    blocker.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 999999;
      color: white; font-family: Roboto, Arial, sans-serif;
      gap: 16px;
    `;

    const searchTopic = topic || defaultTopic || 'learning';
    const capitalizedRoute = pageType.charAt(0).toUpperCase() + pageType.slice(1);

    blocker.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 8px;">🚫</div>
      <h2 style="font-size: 28px; margin: 0; font-weight: 700; text-align: center;">
        ${capitalizedRoute} is blocked
      </h2>
      <p style="color: #aaa; font-size: 16px; text-align: center; max-width: 400px; margin: 0;">
        This section is disabled during Focus Mode.<br/>
        Stay focused on <strong style="color: #3ea6ff;">${searchTopic}</strong>.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 8px;">
        <a href="/" style="
          background-color: #3ea6ff; color: #0f0f0f; padding: 12px 24px;
          border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 15px;
          transition: opacity 0.2s;
        ">🏠 Back to Home</a>
      </div>
    `;

    document.body.appendChild(blocker);
  }

  return true;
}

export function removeRouteBlocker(): void {
  const blocker = document.getElementById('focustube-route-blocker');
  if (blocker) blocker.remove();

  const appContainer = document.querySelector('ytd-app') as HTMLElement | null;
  const pageManager = document.querySelector('#page-manager') as HTMLElement | null;

  if (pageManager) {
    pageManager.style.removeProperty('display');
  } else if (appContainer) {
    appContainer.style.removeProperty('display');
  }
}
