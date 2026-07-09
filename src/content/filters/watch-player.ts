import { UserPrefs, VideoDecisionCache } from '../../types';
import { shouldHide } from '../../lib/should-hide';
import { debugLogSync } from '../../lib/debug';

let playerObserver: MutationObserver | null = null;
let currentAbortController: AbortController | null = null;
let preemptiveInterval: ReturnType<typeof setInterval> | null = null;

// Cache scoped to the session (cleared on navigate/session end if topic changes, 
// but for simplicity we keep an in-memory map and clear it if strictMode or topic changes).
const decisionCache = new Map<string, VideoDecisionCache>();
let currentCacheKey = ''; // e.g., 'DSA:strict=false'

export function applyWatchPlayerFilter(keywords: string[], topic: string, prefs?: UserPrefs): void {
  const strictMode = prefs?.strictMode ?? false;
  const newCacheKey = `${topic}:strict=${strictMode}`;
  
  // Invalidate cache if session parameters changed
  if (currentCacheKey !== newCacheKey) {
    decisionCache.clear();
    currentCacheKey = newCacheKey;
  }

  // Cancel any ongoing metadata extraction from a previous navigation
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  // 1. Immediately pause any playing video (preemptive strike)
  preemptivelyPauseAllVideos();

  // 2. Start asynchronous evaluation with timeout
  evaluateCurrentVideo(keywords, topic, strictMode, signal).catch(err => {
    if (err.name === 'AbortError') {
      debugLogSync('WATCH_PLAYER', 'Evaluation aborted due to navigation');
      return;
    }
    debugLogSync('WATCH_PLAYER', { error: 'Evaluation failed', details: err });
    // Default to BLOCKED if it fails unexpectedly
    blockPlayer(topic);
  });
}

/**
 * Preemptively finds and pauses all playing videos globally.
 * Starts a short-lived interval to fight autoplay until a decision is reached.
 */
function preemptivelyPauseAllVideos() {
  if (preemptiveInterval) clearInterval(preemptiveInterval);

  const pauseNow = () => {
    document.querySelectorAll('video').forEach(v => {
      if (!v.paused) v.pause();
    });
  };

  pauseNow();
  preemptiveInterval = setInterval(pauseNow, 100);
}

function clearPreemptivePausing() {
  if (preemptiveInterval) {
    clearInterval(preemptiveInterval);
    preemptiveInterval = null;
  }
}

/**
 * Extracts metadata and decides whether to block or allow.
 */
async function evaluateCurrentVideo(keywords: string[], topic: string, strictMode: boolean, signal: AbortSignal): Promise<void> {
  const videoId = getUrlVideoId();

  if (videoId && decisionCache.has(videoId)) {
    const cached = decisionCache.get(videoId)!;
    debugLogSync('WATCH_PLAYER', { cacheHit: true, videoId, decision: cached.decision });
    
    if (signal.aborted) return;
    
    if (cached.decision === 'hide') {
      blockPlayer(topic);
    } else {
      allowPlayer();
    }
    return;
  }

  // Try to extract rich metadata with a strict 2-second timeout
  const metadata = await extractWatchMetadataWithTimeout(2000, signal);
  
  if (signal.aborted) return;

  if (!metadata) {
    debugLogSync('WATCH_PLAYER', 'Metadata extraction timed out. Defaulting to BLOCKED.');
    blockPlayer(topic);
    return;
  }

  const hide = shouldHide(metadata.title, metadata.channel, metadata.description, keywords, strictMode);

  // Cache the decision if we have a valid videoId
  if (metadata.videoId) {
    decisionCache.set(metadata.videoId, {
      videoId: metadata.videoId,
      score: 0, // Not explicitly returning score from shouldHide right now, but decision is enough
      decision: hide ? 'hide' : 'show',
      timestamp: Date.now()
    });
  }

  if (hide) {
    debugLogSync('WATCH_PLAYER', { decision: 'block', metadata });
    blockPlayer(topic);
  } else {
    debugLogSync('WATCH_PLAYER', { decision: 'allow', metadata });
    allowPlayer();
  }
}

/**
 * Wait for rich DOM metadata.
 */
async function extractWatchMetadataWithTimeout(timeoutMs: number, signal: AbortSignal) {
  return new Promise<{ title: string; channel: string; description: string; videoId: string } | null>((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const cleanup = () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      cleanup();
      resolve(null);
    };

    signal.addEventListener('abort', onAbort);

    timeoutId = setTimeout(() => {
      cleanup();
      resolve(null); // Timeout -> resolve null
    }, timeoutMs);

    intervalId = setInterval(() => {
      const videoId = getUrlVideoId();
      const titleEl = document.querySelector('h1.ytd-watch-metadata, h1.title');
      const channelEl = document.querySelector('ytd-video-owner-renderer .ytd-channel-name, #owner-name a');
      const descEl = document.querySelector('#description-inner');

      const title = titleEl?.textContent?.trim();
      
      // We need at least a title to evaluate
      if (title) {
        cleanup();
        resolve({
          title,
          channel: channelEl?.textContent?.trim() || '',
          description: descEl?.textContent?.trim() || '',
          videoId
        });
      }
    }, 100);
  });
}

function getUrlVideoId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v') || '';
}

/**
 * Applies the UI blocker and enforces video pausing
 */
function blockPlayer(topic: string): void {
  // Clear the preemptive interval since we are now permanently enforcing block
  clearPreemptivePausing();
  
  const video = document.querySelector('video') as HTMLVideoElement | null;
  if (video) {
    video.pause();
    video.addEventListener('play', forcePause);
    
    // We add a slow interval just in case YouTube breaks the event listener
    if (!preemptiveInterval) {
      preemptiveInterval = setInterval(() => {
        if (!video.paused) video.pause();
      }, 500);
    }
  }

  // 2. Hide comments and related videos
  const comments = document.querySelector('#comments');
  if (comments) (comments as HTMLElement).style.setProperty('display', 'none', 'important');
  
  const related = document.querySelector('#secondary');
  if (related) (related as HTMLElement).style.setProperty('display', 'none', 'important');

  // 3. Blur the player container
  const playerContainer = document.querySelector('#player-container-inner, #ytd-player');
  if (playerContainer) {
    (playerContainer as HTMLElement).style.setProperty('filter', 'blur(20px) grayscale(50%)', 'important');
    (playerContainer as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
  }

  // 4. Inject Overlay
  if (!document.getElementById('focustube-player-blocker')) {
    const parent = document.querySelector('#player-container-outer, #primary-inner') || document.body;
    
    const blocker = document.createElement('div');
    blocker.id = 'focustube-player-blocker';
    blocker.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-height: 400px;
      background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(10px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 999999;
      color: white; font-family: Roboto, Arial, sans-serif;
      gap: 16px; text-align: center; border-radius: 12px;
    `;

    blocker.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 8px;">🚫</div>
      <h2 style="font-size: 28px; margin: 0; font-weight: 700;">
        Video Blocked
      </h2>
      <p style="color: #aaa; font-size: 16px; max-width: 400px; margin: 0;">
        This video is not related to your learning session.<br/>
        Current Focus: <strong style="color: #3ea6ff;">${topic || 'Learning'}</strong>
      </p>
      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <button id="ft-player-home" style="
          background-color: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px;
          border-radius: 20px; font-weight: bold; font-size: 14px; cursor: pointer;
        ">Go to Home</button>
        <button id="ft-player-back" style="
          background-color: transparent; color: #e2e8f0; border: 1px solid #475569; padding: 10px 20px;
          border-radius: 20px; font-weight: bold; font-size: 14px; cursor: pointer;
        ">Resume Learning</button>
      </div>
    `;

    if (parent !== document.body) {
      (parent as HTMLElement).style.position = 'relative';
    }
    parent.appendChild(blocker);

    blocker.querySelector('#ft-player-home')?.addEventListener('click', () => {
      window.location.href = '/';
    });
    blocker.querySelector('#ft-player-back')?.addEventListener('click', () => {
      window.history.back();
    });
  }
}

/**
 * Re-enables playback and removes blockers if the video is educational
 */
function allowPlayer(): void {
  clearPreemptivePausing();
  removePlayerBlocker();

  // If we preemptively paused an educational video, we can safely play it now
  const video = document.querySelector('video') as HTMLVideoElement | null;
  if (video && video.paused && !video.ended) {
    // Only play if it has source and isn't at the end
    if (video.readyState >= 2) {
      video.play().catch(() => {});
    }
  }
}

function forcePause(e: Event) {
  (e.target as HTMLVideoElement).pause();
}

export function removePlayerBlocker(): void {
  const blocker = document.getElementById('focustube-player-blocker');
  if (blocker) blocker.remove();

  clearPreemptivePausing();

  const video = document.querySelector('video') as HTMLVideoElement | null;
  if (video) {
    video.removeEventListener('play', forcePause);
  }

  const comments = document.querySelector('#comments');
  if (comments) (comments as HTMLElement).style.removeProperty('display');
  
  const related = document.querySelector('#secondary');
  if (related) (related as HTMLElement).style.removeProperty('display');

  const playerContainer = document.querySelector('#player-container-inner, #ytd-player');
  if (playerContainer) {
    (playerContainer as HTMLElement).style.removeProperty('filter');
    (playerContainer as HTMLElement).style.removeProperty('pointer-events');
  }
}

export function setupWatchPlayerObserver(keywords: string[], topic: string, prefs: UserPrefs): void {
  if (playerObserver) {
    playerObserver.disconnect();
  }

  // On title/metadata DOM change, trigger a re-evaluation
  playerObserver = new MutationObserver(() => {
    applyWatchPlayerFilter(keywords, topic, prefs);
  });

  const target = document.querySelector('ytd-watch-metadata, #primary-inner');
  if (target) {
    playerObserver.observe(target, { childList: true, subtree: true, characterData: true });
  }
}

export function disconnectPlayerObserver(): void {
  if (playerObserver) {
    playerObserver.disconnect();
    playerObserver = null;
  }
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
  removePlayerBlocker();
  clearPreemptivePausing();
}
