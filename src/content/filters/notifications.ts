import { SelectorConfig } from '../../config/selectors.config';
import { UserPrefs } from '../../types';
import { shouldHide } from '../../lib/should-hide';
import {
  extractMetadata,
  processedElements,
  markAsProcessed,
  hideElement,
  showElement,
} from './utils';

export function applyNotificationsFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void,
  prefs?: UserPrefs,
): void {
  const rootSelectors = SelectorConfig.notifications.root.split(',').map(s => s.trim());
  
  rootSelectors.forEach(rootSel => {
    const root = document.querySelector(rootSel);
    if (!root) return;

    const strictMode = prefs?.strictMode ?? false;
    const selectors = SelectorConfig.notifications.items.join(',');
    const elements = root.querySelectorAll(selectors);

    elements.forEach((el) => {
      if (processedElements.has(el)) return;

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
  });
}
