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
  // Hide the tabs and content
  const content = document.querySelector('#tabs-content, ytd-two-column-browse-results-renderer');
  if (content) {
    (content as HTMLElement).style.setProperty('display', 'none', 'important');
  }

  // Inject overlay if it doesn't exist
  if (!document.getElementById('focustube-channel-blocker')) {
    const pageManager = document.querySelector('#page-manager') as HTMLElement | null;
    const container = pageManager || document.body;

    const blocker = document.createElement('div');
    blocker.id = 'focustube-channel-blocker';
    blocker.style.cssText = `
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 60px 20px; margin: 40px auto;
      max-width: 600px;
      background: linear-gradient(135deg, #1e1e2e 0%, #16213e 100%);
      border: 1px solid #2d2d44; border-radius: 16px;
      color: white; font-family: Roboto, Arial, sans-serif;
      gap: 16px; text-align: center;
    `;

    blocker.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 8px;">📺</div>
      <h2 style="font-size: 24px; margin: 0; font-weight: 700;">
        Channel Blocked
      </h2>
      <p style="color: #aaa; font-size: 15px; max-width: 400px; margin: 0;">
        <strong style="color: #fff;">${channelName}</strong> appears to be an entertainment channel.<br/>
        Its videos, shorts, and playlists are hidden during Focus Mode.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <button id="ft-channel-home" style="
          background-color: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px;
          border-radius: 20px; font-weight: bold; font-size: 14px; cursor: pointer;
        ">Go to Home</button>
      </div>
    `;

    // Insert after the header if possible
    const header = document.querySelector('ytd-c4-tabbed-header-renderer, yt-page-header-renderer');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(blocker, header.nextSibling);
    } else {
      container.appendChild(blocker);
    }

    blocker.querySelector('#ft-channel-home')?.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
}

export function removeChannelBlocker(): void {
  const blocker = document.getElementById('focustube-channel-blocker');
  if (blocker) blocker.remove();

  const content = document.querySelector('#tabs-content, ytd-two-column-browse-results-renderer');
  if (content) {
    (content as HTMLElement).style.removeProperty('display');
  }
}
