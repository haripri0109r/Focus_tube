import { SelectorConfig } from '../../config/selectors.config';
import { shouldHide } from '../../lib/should-hide';
import { extractMetadata } from './utils';

export function applyHomepageFilter(
  keywords: string[], 
  onHide: () => void, 
  onShow: () => void
) {
  const root = document.querySelector(SelectorConfig.home.root);
  if (!root) return;
  
  const selectors = SelectorConfig.home.items.join(',');
  const elements = root.querySelectorAll(`${selectors}:not([data-ft-processed="true"])`);
  
  elements.forEach((el) => {
    const meta = extractMetadata(el);
    if (!meta) return; 
    
    if (meta.isSkeleton) {
      // Don't mark as processed yet, wait for content
      return;
    }

    if (meta.isProcessed) return;

    el.setAttribute('data-ft-processed', 'true');
    
    const hide = shouldHide(meta.title, meta.channel, meta.ariaLabel, keywords);
    
    if (hide) {
      el.setAttribute('data-focustube-hidden', 'true');
      (el as HTMLElement).style.setProperty('display', 'none', 'important');
      onHide();
    } else {
      el.setAttribute('data-focustube-hidden', 'false');
      (el as HTMLElement).style.setProperty('display', 'block', 'important');
      onShow();
    }
  });

  checkHomepageFallback(root);
}

function checkHomepageFallback(root: Element) {
  const visibleItems = root.querySelectorAll('[data-focustube-hidden="false"]');
  const existingFallback = document.getElementById('ft-homepage-fallback');
  
  if (visibleItems.length === 0) {
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
        background: #0f0f0f;
        border-radius: 12px;
        margin: 20px;
        border: 1px dashed #333;
      `;
      fallback.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
        <h2 style="color: #fff; margin-bottom: 8px;">No relevant learning content found</h2>
        <p style="margin-bottom: 24px; max-width: 400px;">We've filtered your homepage to keep you focused. Try searching for a specific topic or check your focus keywords.</p>
        <div style="display: flex; gap: 12px;">
          <button id="ft-fallback-search" style="background: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer;">Search for Topics</button>
        </div>
      `;
      root.appendChild(fallback);
      
      fallback.querySelector('#ft-fallback-search')?.addEventListener('click', () => {
        const searchInput = document.querySelector('input#search') as HTMLInputElement;
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
