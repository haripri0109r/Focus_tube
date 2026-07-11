/**
 * Homepage and Subscriptions Feed Filter
 *
 * Handles two distinct DOM layouts:
 * - Home: ytd-rich-grid-renderer > ytd-rich-item-renderer
 * - Subscriptions: ytd-section-list-renderer > ytd-item-section-renderer > ytd-video-renderer
 *   (or new grid layout: ytd-rich-grid-renderer > ytd-rich-item-renderer on some accounts)
 *
 * Also detects and hides Shorts shelves when filterShorts is enabled.
 */

import { SelectorConfig } from '../../config/selectors.config';
import { UserPrefs } from '../../types';
import { shouldHide } from '../../lib/should-hide';
import {
  extractMetadata,
  processedElements,
  markAsProcessed,
  hideElement,
  showElement,
  isShortsShelf,
  isShortsItem,
} from './utils';

export function removeLearningHeader(): void {
  const el = document.getElementById('ft-learning-header');
  if (el) el.remove();
  
  const existingFallback = document.getElementById('ft-homepage-fallback');
  if (existingFallback) existingFallback.remove();
}

function renderLearningHeader(_root: Element, topic: string): void {
  // Already mounted — don't remount if the search input is there (prevents focus disruption)
  if (document.getElementById('ft-learning-header')) {
    return;
  }

  const header = document.createElement('div');
  header.id = 'ft-learning-header';
  // Use position:sticky so it stays at the very top of the scrollable content area
  // YouTube's own header is ~56px tall. We sit just below it.
  header.style.cssText = `
    position: sticky;
    top: 56px;
    z-index: 1000;
    width: 100%;
    padding: 16px 24px;
    background: #0f0f0f;
    border-bottom: 1px solid #2d2d2d;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: Roboto, Arial, sans-serif;
  `;

  header.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:20px;">🎓</span>
        <div>
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#3ea6ff; letter-spacing:1.5px; line-height:1;">Focus Session</div>
          <div style="font-size:16px; font-weight:700; color:#fff; margin-top:2px;">${topic}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-shrink:0;">
        <button id="ft-header-pause" style="padding:7px 14px; border-radius:16px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #444; background:#272727; color:#fff; transition:background 0.2s;">⏸ Pause</button>
        <button id="ft-header-end" style="padding:7px 14px; border-radius:16px; font-size:12px; font-weight:700; cursor:pointer; border:none; background:#cc0000; color:#fff; transition:background 0.2s;">✕ End Session</button>
      </div>
    </div>
    <div style="position:relative; max-width:700px; width:100%;">
      <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:15px; color:#888; pointer-events:none; z-index:1;">🔍</span>
      <input type="text" id="ft-header-search-input"
        placeholder='Search for "${topic}" tutorials, courses...'
        style="width:100%; box-sizing:border-box; padding:11px 16px 11px 42px; border-radius:22px; border:1.5px solid #3a3a3a; background:#1a1a1a; color:#fff; font-size:14px; outline:none; font-family:Roboto,Arial,sans-serif; transition:border-color 0.2s;"
        autocomplete="off"
        onfocus="this.style.borderColor='#3ea6ff'"
        onblur="this.style.borderColor='#3a3a3a'"
      />
    </div>
  `;

  // Insert BEFORE the primary grid or list renderer so it sits cleanly at the top of the feed
  const targetFeed = document.querySelector('ytd-rich-grid-renderer') || document.querySelector('ytd-section-list-renderer');
  if (targetFeed && targetFeed.parentElement) {
    targetFeed.parentElement.insertBefore(header, targetFeed);
  } else {
    // Fallback: insert before the page manager content
    const pageManager = document.querySelector('ytd-page-manager') || document.body;
    if (pageManager.firstChild) {
      pageManager.insertBefore(header, pageManager.firstChild);
    } else {
      pageManager.appendChild(header);
    }
  }

  // Wire up events
  const searchInput = header.querySelector('#ft-header-search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `/results?search_query=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
    // Auto-focus the search box so user can immediately type
    setTimeout(() => searchInput.focus(), 200);
  }

  header.querySelector('#ft-header-pause')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'SESSION_PAUSE' });
  });

  header.querySelector('#ft-header-end')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'SESSION_END' });
  });
}

export function applyHomepageFilter(
  keywords: string[],
  topic: string,
  onHide: () => void,
  onShow: () => void,
  prefs?: UserPrefs,
): void {
  const strictMode = prefs?.strictMode ?? false;
  const filterShorts = prefs?.filterShorts ?? true;

  // Collect all possible root elements — home and subscriptions have different DOMs
  const roots = Array.from(
    new Set([
      // Home page grid
      ...Array.from(document.querySelectorAll('ytd-rich-grid-renderer')),
      // Subscriptions section list (classic layout)
      ...Array.from(document.querySelectorAll('ytd-section-list-renderer #contents')),
    ])
  ).filter(Boolean);

  if (roots.length === 0) return;

  const selectors = [
    'ytd-rich-item-renderer',
    'ytd-rich-section-renderer',
    'ytd-video-renderer',
    'ytd-item-section-renderer',
    'yt-lockup-view-model',
  ].join(',');

  let foundAny = false;

  for (const root of roots) {
    // 1. Render the Learning Header at the top of the homepage grid
    if (root.tagName.toLowerCase() === 'ytd-rich-grid-renderer' && topic) {
      renderLearningHeader(root, topic);
    }

    const elements = root.querySelectorAll(selectors);

    elements.forEach((el) => {
      // Exclude learning header or fallback cards
      if (el.id === 'ft-learning-header' || el.id === 'ft-homepage-fallback') return;

      // Skip if already processed (WeakSet check)
      if (processedElements.has(el)) return;

      // --- Shorts shelf detection — hide whole section immediately ---
      if (filterShorts && (isShortsShelf(el) || isShortsItem(el))) {
        markAsProcessed(el);
        hideElement(el as HTMLElement, onHide);
        return;
      }

      // For ytd-item-section-renderer (subscriptions wrapper), drill into inner videos
      if (el.tagName.toLowerCase() === 'ytd-item-section-renderer') {
        markAsProcessed(el);
        const innerVideos = el.querySelectorAll('ytd-video-renderer, yt-lockup-view-model');
        innerVideos.forEach((innerEl) => {
          if (processedElements.has(innerEl)) return;
          const meta = extractMetadata(innerEl);
          if (meta.isSkeleton) return;
          if (!meta.title && !meta.channel && !meta.ariaLabel) return;
          markAsProcessed(innerEl);
          foundAny = true;
          const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords, strictMode);
          if (hide) {
            hideElement(innerEl as HTMLElement, onHide);
            // Also visually collapse the section wrapper
            (el as HTMLElement).style.setProperty('display', 'none', 'important');
            el.setAttribute('data-focustube-hidden', 'true');
          } else {
            showElement(innerEl as HTMLElement, onShow);
          }
        });
        return;
      }

      const meta = extractMetadata(el);

      // Don't process loading skeletons — they'll be re-processed when content arrives
      if (meta.isSkeleton) return;

      // If no text at all (non-video element like ads, banners), skip
      if (!meta.title && !meta.channel && !meta.ariaLabel) return;

      // Mark as processed NOW
      markAsProcessed(el);

      foundAny = true;
      const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords, strictMode);

      if (hide) {
        hideElement(el as HTMLElement, onHide);
      } else {
        showElement(el as HTMLElement, onShow);
      }
    });
  }

  // Only check fallback if we actually found video elements to process
  if (foundAny) {
    checkHomepageFallback(roots[0], topic);
  }
}


function checkHomepageFallback(root: Element, topic: string): void {
  // Exclude the learning header and the fallback itself from the queries
  const visibleItems = Array.from(root.querySelectorAll('[data-focustube-hidden="false"]'))
    .filter(el => el.id !== 'ft-learning-header' && el.id !== 'ft-homepage-fallback');
  const existingFallback = document.getElementById('ft-homepage-fallback');

  const processedCount = Array.from(root.querySelectorAll('[data-focustube-hidden]'))
    .filter(el => el.id !== 'ft-learning-header' && el.id !== 'ft-homepage-fallback').length;

  if (visibleItems.length === 0 && processedCount > 0) {
    if (!existingFallback) {
      window.scrollTo(0, 0);
      setTimeout(() => window.scrollTo(0, 0), 100);
      const fallback = document.createElement('div');
      fallback.id = 'ft-homepage-fallback';
      fallback.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #aaa;
        text-align: center;
        border-radius: 12px;
        margin: 20px 0;
        border: 1px dashed #333;
        background: #0f0f0f;
        font-family: Roboto, Arial, sans-serif;
      `;
      fallback.innerHTML = `
        <div style="font-size: 36px; margin-bottom: 12px;">🎯</div>
        <h3 style="color: #fff; margin-bottom: 8px;">All recommendations filtered</h3>
        <p style="margin: 0; color: #888; font-size: 14px;">
          Use the search bar in the Focus header above to search for "${topic}" videos.
        </p>
      `;
      
      const contentsContainer = root.querySelector('#contents') || root;
      // Append right after the learning header if it exists
      const header = document.getElementById('ft-learning-header');
      if (header && header.nextSibling) {
        contentsContainer.insertBefore(fallback, header.nextSibling);
      } else {
        contentsContainer.appendChild(fallback);
      }
    }
  } else if (existingFallback) {
    existingFallback.remove();
  }
}
