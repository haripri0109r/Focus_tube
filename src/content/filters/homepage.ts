/**
 * Homepage and Subscriptions Feed Filter
 *
 * Processes ytd-rich-item-renderer and related card types in the home grid.
 * Also detects and hides Shorts shelves (ytd-rich-section-renderer containing
 * ytd-reel-shelf-renderer) when filterShorts is enabled.
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
  isShortsItem,
} from './utils';

export function applyHomepageFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void,
  prefs?: UserPrefs,
): void {
  const root = document.querySelector(SelectorConfig.home.root);
  if (!root) return;

  const strictMode = prefs?.strictMode ?? false;
  const filterShorts = prefs?.filterShorts ?? true;

  const selectors = SelectorConfig.home.items.join(',');
  const elements = root.querySelectorAll(selectors);

  elements.forEach((el) => {
    // Skip if already processed (WeakSet check)
    if (processedElements.has(el)) return;

    // --- Shorts shelf detection — hide whole section immediately ---
    if (filterShorts && (isShortsShelf(el) || isShortsItem(el))) {
      processedElements.add(el);
      hideElement(el as HTMLElement, onHide);
      return;
    }

    const meta = extractMetadata(el);

    // Don't process loading skeletons — they'll be re-processed when content arrives
    if (meta.isSkeleton) return;

    // Mark as processed NOW (before async/other operations)
    processedElements.add(el);

    // If no text at all (non-video element like ads, banners), skip
    if (!meta.title && !meta.channel && !meta.ariaLabel) return;

    const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords, strictMode);

    if (hide) {
      hideElement(el as HTMLElement, onHide);
    } else {
      showElement(el as HTMLElement, onShow);
    }
  });

  checkHomepageFallback(root);
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
        const searchInput = document.querySelector('input#search') as HTMLInputElement | null;
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
