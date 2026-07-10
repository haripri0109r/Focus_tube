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

export function applyHomepageFilter(
  keywords: string[],
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
    const elements = root.querySelectorAll(selectors);

    elements.forEach((el) => {
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
    checkHomepageFallback(roots[0]);
  }
}


function checkHomepageFallback(root: Element): void {
  const visibleItems = root.querySelectorAll('[data-focustube-hidden="false"]');
  const existingFallback = document.getElementById('ft-homepage-fallback');

  if (visibleItems.length === 0 && root.querySelectorAll('[data-focustube-hidden]').length > 0) {
    if (!existingFallback) {
      const fallback = document.createElement('div');
      fallback.id = 'ft-homepage-fallback';
      fallback.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #aaa;
        text-align: center;
        border-radius: 12px;
        margin: 20px;
        border: 1px dashed #333;
      `;
      fallback.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">🎓</div>
        <h2 style="color: #fff; margin-bottom: 8px; font-family: Roboto, Arial, sans-serif;">All distractions filtered!</h2>
        <p style="margin-bottom: 24px; max-width: 400px; font-family: Roboto, Arial, sans-serif; color: #aaa;">
          Your homepage is now distraction-free. Search for your learning topic below.
        </p>
        <button id="ft-fallback-search" style="background: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer; font-size: 14px;">
          Search Your Topic
        </button>
      `;
      root.appendChild(fallback);

      fallback.querySelector('#ft-fallback-search')?.addEventListener('click', () => {
        const searchInput = document.querySelector('input[name="search_query"]') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
         } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  } else if (existingFallback) {
    existingFallback.remove();
  }
}
