import { SelectorConfig } from '../../config/selectors.config';

/**
 * Applies Shorts filtering when the user is on the /shorts/* route.
 * Blocks the entire Shorts player and shows a redirect overlay.
 */
export function applyShortsFilter(topic: string, defaultTopic: string): void {
  if (document.getElementById('focustube-shorts-blocker')) return;

  // Hide the Shorts player
  const shortsContainer = document.querySelector('ytd-shorts') as HTMLElement | null;
  if (shortsContainer) {
    shortsContainer.style.setProperty('display', 'none', 'important');
    
    // Pause any playing shorts videos
    const videos = shortsContainer.querySelectorAll('video');
    videos.forEach(v => {
      if (!v.paused) v.pause();
    });
  }

  const blocker = document.createElement('div');
  blocker.id = 'focustube-shorts-blocker';
  blocker.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; z-index: 999999;
    color: white; font-family: Roboto, Arial, sans-serif;
    gap: 16px;
  `;

  const searchTopic = topic || defaultTopic || 'learning';
  const searchUrl = `/results?search_query=${encodeURIComponent(searchTopic)}`;

  blocker.innerHTML = `
    <div style="font-size: 64px; margin-bottom: 8px;">🎓</div>
    <h2 style="font-size: 28px; margin: 0; font-weight: 700; text-align: center;">
      Shorts are blocked
    </h2>
    <p style="color: #aaa; font-size: 16px; text-align: center; max-width: 400px; margin: 0;">
      Stay focused on <strong style="color: #3ea6ff;">${searchTopic}</strong>.<br/>
      Shorts are a distraction from your learning session.
    </p>
    <div style="display: flex; gap: 12px; margin-top: 8px;">
      <a href="${searchUrl}" style="
        background-color: #3ea6ff; color: #0f0f0f; padding: 12px 24px;
        border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 15px;
        transition: opacity 0.2s;
      ">📚 Back to ${searchTopic}</a>
      <a href="/" style="
        background: transparent; color: #3ea6ff; padding: 12px 24px;
        border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 15px;
        border: 1px solid #3ea6ff;
      ">🏠 Home</a>
    </div>
  `;

  document.body.appendChild(blocker);
}

/**
 * Hides Shorts shelves embedded in home/search pages.
 * Call this from the homepage and search filters when filterShorts is enabled.
 */
export function hideShortsShelvesInPage(onHide: () => void): void {
  // Hide all reel shelves (Shorts rows)
  const shelves = document.querySelectorAll(
    `${SelectorConfig.shorts.shelf}:not([data-focustube-hidden="true"]),
     ${SelectorConfig.shorts.item}:not([data-focustube-hidden="true"])`
  );

  shelves.forEach((el) => {
    el.setAttribute('data-focustube-hidden', 'true');
    (el as HTMLElement).style.setProperty('display', 'none', 'important');
    onHide();
  });
}

export function restoreShorts(): void {
  const blocker = document.getElementById('focustube-shorts-blocker');
  if (blocker) blocker.remove();

  const shortsEl = document.querySelector(SelectorConfig.shorts.player);
  if (shortsEl) {
    (shortsEl as HTMLElement).style.removeProperty('display');
  }
}
