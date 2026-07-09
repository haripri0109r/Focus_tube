import { UserPrefs } from '../../types';
import { shouldHide } from '../../lib/should-hide';
import { debugLogSync } from '../../lib/debug';

/**
 * Checks if the current channel page belongs to an entertainment channel.
 * If so, hides the channel contents and shows an overlay.
 * 
 * @returns true if the channel was blocked
 */
export function applyChannelFilter(keywords: string[], prefs?: UserPrefs): boolean {
  const strictMode = prefs?.strictMode ?? false;

  // Try to find the channel name
  let channelName = '';
  
  // 1. New YouTube header format
  const headerText = document.querySelector('ytd-c4-tabbed-header-renderer .ytd-channel-name, yt-page-header-renderer .yt-core-attributed-string');
  if (headerText) {
    channelName = headerText.textContent?.trim() ?? '';
  }

  // 2. Fallback: page title
  if (!channelName && document.title) {
    channelName = document.title.replace(' - YouTube', '').trim();
  }

  if (!channelName) return false;

  // Score the channel (we pass the channel name as both title and channel to the scorer)
  const hide = shouldHide(channelName, channelName, channelName, keywords, strictMode);

  if (hide) {
    debugLogSync('CHANNEL_BLOCKER', { decision: 'block', channel: channelName });
    blockChannel(channelName);
    return true;
  }

  removeChannelBlocker();
  return false;
}

function blockChannel(channelName: string): void {
  // Hide the entire page manager so no channel content (videos, tabs, banners) is visible
  const pageManager = document.querySelector('#page-manager') as HTMLElement | null;
  if (pageManager) {
    pageManager.style.setProperty('display', 'none', 'important');
  }

  // Inject overlay if it doesn't exist
  if (!document.getElementById('focustube-channel-blocker')) {
    const blocker = document.createElement('div');
    blocker.id = 'focustube-channel-blocker';
    blocker.style.cssText = `
      position: fixed; top: 56px; left: 0; width: 100vw; height: calc(100vh - 56px);
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 2000;
      color: white; font-family: Roboto, Arial, sans-serif;
      gap: 16px; text-align: center;
    `;

    blocker.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 8px;">📺</div>
      <h2 style="font-size: 28px; margin: 0; font-weight: 700;">
        Channel Blocked
      </h2>
      <p style="color: #aaa; font-size: 16px; max-width: 450px; margin: 0; line-height: 1.5;">
        <strong style="color: #fff;">${channelName}</strong> appears to be an entertainment channel.<br/>
        Its videos, shorts, and playlists are hidden during Focus Mode.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <button id="ft-channel-home" style="
          background-color: #3ea6ff; color: #0f0f0f; border: none; padding: 12px 24px;
          border-radius: 20px; font-weight: bold; font-size: 15px; cursor: pointer;
        ">Go to Home</button>
      </div>
    `;

    document.body.appendChild(blocker);

    blocker.querySelector('#ft-channel-home')?.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
}

export function removeChannelBlocker(): void {
  const blocker = document.getElementById('focustube-channel-blocker');
  if (blocker) blocker.remove();

  const pageManager = document.querySelector('#page-manager') as HTMLElement | null;
  if (pageManager) {
    pageManager.style.removeProperty('display');
  }
}
