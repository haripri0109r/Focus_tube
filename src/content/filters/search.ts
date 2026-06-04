import { SelectorConfig } from '../../config/selectors.config';
import { shouldHide } from '../../lib/should-hide';
import { extractMetadata } from './utils';

export function applySearchFilter(
  keywords: string[],
  onHide: () => void,
  onShow: () => void,
  filterShorts: boolean // usually true
) {
  const root = document.querySelector(SelectorConfig.search.root);
  if (!root) return;
  
  // Handle shorts shelves
  if (filterShorts && SelectorConfig.search.shelves) {
    const shelfSelectors = SelectorConfig.search.shelves.join(',');
    const shelves = root.querySelectorAll(`${shelfSelectors}:not([data-ft-processed="true"])`);
    shelves.forEach((el) => {
      el.setAttribute('data-ft-processed', 'true');
      el.setAttribute('data-focustube-hidden', 'true');
      (el as HTMLElement).style.setProperty('display', 'none', 'important');
      onHide();
    });
  }

  // Handle standard search results
  const selectors = SelectorConfig.search.items.join(',');
  const elements = root.querySelectorAll(`${selectors}:not([data-ft-processed="true"])`);
  
  elements.forEach((el) => {
    const meta = extractMetadata(el);
    if (!meta) return; 

    if (meta.isSkeleton) return;
    if (meta.isProcessed) return;
    
    // Ignore children that are inside shelves (already hidden)
    if (el.closest('[data-focustube-hidden="true"]')) {
      el.setAttribute('data-ft-processed', 'true');
      return; 
    }
    
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

  checkSearchFallback(root);
}

function checkSearchFallback(root: Element) {
  const visibleItems = root.querySelectorAll('[data-focustube-hidden="false"]');
  const existingFallback = document.getElementById('ft-search-fallback');
  
  if (visibleItems.length === 0) {
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
        background: #121212;
        border-radius: 8px;
        margin: 10px 0;
        min-height: 50vh;
      `;
      fallback.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 12px;">🚫</div>
        <h3 style="color: #fff; margin-bottom: 8px;">No content matches your current focus topic</h3>
        <p style="margin-bottom: 24px;">Your current focus filters are keeping you away from unrelated content.</p>
        <div style="display: flex; gap: 12px;">
          <button id="ft-search-continue" style="background: #3ea6ff; color: #0f0f0f; border: none; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer;">Continue Learning</button>
          <button id="ft-search-change" style="background: transparent; color: #3ea6ff; border: 1px solid #3ea6ff; padding: 10px 20px; border-radius: 18px; font-weight: bold; cursor: pointer;">Change Topic</button>
        </div>
      `;
      root.insertBefore(fallback, root.firstChild);

      fallback.querySelector('#ft-search-continue')?.addEventListener('click', () => {
         chrome.storage.local.get(['focustube_prefs', 'session_current'], (data) => {
            const topic = data.session_current?.topic || data.focustube_prefs?.defaultTopic || 'learning';
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
