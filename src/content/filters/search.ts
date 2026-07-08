/**
 * Search Results Filter
 *
 * Filters ytd-video-renderer and related card types in search results.
 * Automatically hides Shorts shelves (ytd-reel-shelf-renderer) and
 * other shelf types that contain non-educational content.
 */

import { SelectorConfig } from '../../config/selectors.config';
import { UserPrefs } from '../../types';
import { shouldHide } from '../../lib/should-hide';
import {
  extractMetadata,
  processedElements,
  hideElement,
  showElement,
  isShortsShelf,
} from './utils';

export function applySearchFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void,
  filterShorts: boolean,
  prefs?: UserPrefs,
): void {
  const root = document.querySelector(SelectorConfig.search.root);
  if (!root) return;

  const strictMode = prefs?.strictMode ?? false;

  // --- Step 1: Hide Shorts shelves (whole rows) ---
  if (filterShorts && SelectorConfig.search.shelves) {
    const shelfSelectors = SelectorConfig.search.shelves.join(',');
    const shelves = root.querySelectorAll(shelfSelectors);
    shelves.forEach((el) => {
      if (processedElements.has(el)) return;
      if (isShortsShelf(el)) {
        processedElements.add(el);
        hideElement(el as HTMLElement, onHide);
      }
    });
  }

  // --- Step 2: Filter individual video results ---
  const selectors = SelectorConfig.search.items.join(',');
  const elements = root.querySelectorAll(selectors);

  elements.forEach((el) => {
    if (processedElements.has(el)) return;

    // Skip elements already hidden by a parent shelf
    if (el.closest('[data-focustube-hidden="true"]')) {
      processedElements.add(el);
      return;
    }

    // Hide shelf-type elements (non-video sections) entirely
    if (
      el.tagName.toLowerCase() === 'ytd-shelf-renderer' ||
      el.tagName.toLowerCase() === 'ytd-reel-shelf-renderer'
    ) {
      processedElements.add(el);
      hideElement(el as HTMLElement, onHide);
      return;
    }

    const meta = extractMetadata(el);

    // Skip skeletons — they'll be reprocessed when content loads
    if (meta.isSkeleton) return;

    processedElements.add(el);

    // Non-video elements (channels, playlists) — apply same filter
    if (!meta.title && !meta.channel && !meta.ariaLabel) return;

    const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords, strictMode);

    if (hide) {
      hideElement(el as HTMLElement, onHide);
    } else {
      showElement(el as HTMLElement, onShow);
    }
  });

  checkSearchFallback(root);
}

function checkSearchFallback(root: Element): void {
  const visibleItems = root.querySelectorAll('[data-focustube-hidden="false"]');
  const existingFallback = document.getElementById('ft-search-fallback');

  if (visibleItems.length === 0 && root.querySelectorAll('[data-focustube-hidden]').length > 0) {
    if (!existingFallback) {
      const fallback = document.createElement('div');
      fallback.id = 'ft-search-fallback';
      fallback.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #aaa;
        text-align: center;
        border-radius: 8px;
        margin: 10px 0;
        min-height: 50vh;
        font-family: Roboto, Arial, sans-serif;
      `;
      fallback.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 12px;">🔒</div>
        <h3 style="color: #fff; margin-bottom: 8px;">No content matches your focus topic</h3>
        <p style="margin-bottom: 24px;">All results hidden to keep you on track.</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
          <button id="ft-search-continue" style="background: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer;">
            Search My Topic
          </button>
          <button id="ft-search-change" style="background: transparent; color: #3ea6ff; border: 1px solid #3ea6ff; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer;">
            Change Topic
          </button>
        </div>
      `;
      root.insertBefore(fallback, root.firstChild);

      fallback.querySelector('#ft-search-continue')?.addEventListener('click', () => {
        chrome.storage.local.get(['focustube_prefs'], (data) => {
          const topic = data.focustube_prefs?.defaultTopic || 'learning';
          window.location.href = `/results?search_query=${encodeURIComponent(topic)}`;
        });
      });

      fallback.querySelector('#ft-search-change')?.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS' });
      });
    }
  } else if (existingFallback) {
    existingFallback.remove();
  }
}
