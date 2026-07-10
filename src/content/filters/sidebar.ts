/**
 * Sidebar / Watch Page Recommendations Filter
 *
 * Filters ytd-compact-video-renderer and related card types in the
 * #secondary panel on the /watch route.
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
} from './utils';

export function applySidebarFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void,
  prefs?: UserPrefs,
): void {
  // Correct root for watch page recommendations
  const root = document.querySelector(SelectorConfig.watch.root);
  if (!root) return;

  const strictMode = prefs?.strictMode ?? false;
  const filterShorts = prefs?.filterShorts ?? true;

  const selectors = SelectorConfig.watch.items.join(',');
  const elements = root.querySelectorAll(selectors);

  elements.forEach((el) => {
    if (processedElements.has(el)) return;

    // Hide Shorts shelves in the sidebar
    if (filterShorts && isShortsShelf(el)) {
      markAsProcessed(el);
      hideElement(el as HTMLElement, onHide);
      return;
    }

    const meta = extractMetadata(el);
    if (meta.isSkeleton) return;

    if (!meta.title && !meta.channel && !meta.ariaLabel) return;

    markAsProcessed(el);

    const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords, strictMode);

    if (hide) {
      hideElement(el as HTMLElement, onHide);
    } else {
      showElement(el as HTMLElement, onShow);
    }
  });
}
