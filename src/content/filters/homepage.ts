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

function renderLearningHeader(root: Element, topic: string): void {
  let header = document.getElementById('ft-learning-header');
  
  if (!header) {
    header = document.createElement('div');
    header.id = 'ft-learning-header';
    header.style.cssText = `
      grid-column: 1 / -1;
      width: 100%;
      margin: 16px 0 24px 0;
      padding: 24px;
      background: linear-gradient(135deg, #1b1b1b 0%, #111 100%);
      border: 1px solid #2d2d2d;
      border-radius: 12px;
      color: white;
      font-family: Roboto, Arial, sans-serif;
      box-sizing: border-box;
    `;
    
    // Insert at the very top of contents container or root
    const contents = root.querySelector('#contents') || root;
    if (contents.firstChild) {
      contents.insertBefore(header, contents.firstChild);
    } else {
      contents.appendChild(header);
    }
  }

  // Check if innerHTML is already set to prevent resetting user focus
  if (!header.querySelector('#ft-header-search-input')) {
    header.innerHTML = `
      <style>
        #ft-header-search-input:focus {
          border-color: #3ea6ff !important;
          box-shadow: 0 0 8px rgba(62, 166, 255, 0.3);
        }
        .ft-header-btn {
          padding: 8px 16px;
          border-radius: 18px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
          border: none;
        }
        .ft-header-btn-secondary {
          background: #272727;
          color: #fff;
          border: 1px solid #3f3f3f;
        }
        .ft-header-btn-secondary:hover {
          background: #3f3f3f;
        }
        .ft-header-btn-danger {
          background: #cc0000;
          color: white;
        }
        .ft-header-btn-danger:hover {
          background: #ff0000;
        }
      </style>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #3ea6ff; letter-spacing: 1.5px;">Focus Session</div>
          <h2 style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: #fff;">🎓 ${topic}</h2>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="ft-header-pause" class="ft-header-btn ft-header-btn-secondary">Pause Session</button>
          <button id="ft-header-end" class="ft-header-btn ft-header-btn-danger">End Session</button>
        </div>
      </div>
      <div style="position: relative; width: 100%; max-width: 600px;">
        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #888; pointer-events: none;">🔍</span>
        <input type="text" id="ft-header-search-input" placeholder="Search YouTube for &quot;${topic}&quot; content..." 
          style="width: 100%; box-sizing: border-box; padding: 12px 16px 12px 44px; border-radius: 22px; border: 1px solid #3a3a3a; background: #121212; color: white; font-size: 15px; outline: none; transition: all 0.2s;" 
          autocomplete="off" />
      </div>
    `;

    // Add event listeners
    const searchInput = header.querySelector('#ft-header-search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `/results?search_query=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });

    header.querySelector('#ft-header-pause')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'SESSION_PAUSE' });
    });

    header.querySelector('#ft-header-end')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'SESSION_END' });
    });
  }
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
