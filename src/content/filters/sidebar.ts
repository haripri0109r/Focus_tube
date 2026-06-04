import { SelectorConfig } from '../../config/selectors.config';
import { shouldHide } from '../../lib/should-hide';
import { extractMetadata } from './utils';

export function applySidebarFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void
) {
  const root = document.querySelector(SelectorConfig.watch.root);
  if (!root) return;
  
  const selectors = SelectorConfig.watch.items.join(',');
  const elements = root.querySelectorAll(`${selectors}:not([data-ft-processed="true"])`);
  
  elements.forEach((el) => {
    const meta = extractMetadata(el);
    if (!meta) return; 

    if (meta.isSkeleton) return;
    if (meta.isProcessed) return;

    el.setAttribute('data-ft-processed', 'true');
    
    const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords);
    
    if (hide) {
      el.setAttribute('data-focustube-hidden', 'true');
      (el as HTMLElement).style.setProperty('display', 'none', 'important');
      onHide();
    } else {
      el.setAttribute('data-focustube-hidden', 'false');
      onShow();
    }
  });
}
