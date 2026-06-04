import { PageType } from '../types';
import { SelectorConfig } from '../config/selectors.config';

export function healthCheck(pageType: PageType, retryInterval = 500, maxTime = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    let rootSelector = '';
    if (pageType === 'home') rootSelector = SelectorConfig.home.root;
    else if (pageType === 'search') rootSelector = SelectorConfig.search.root;
    else if (pageType === 'watch') rootSelector = SelectorConfig.watch.root;
    
    // No root required for shorts or other in V1
    if (!rootSelector) {
      return resolve(true);
    }
    
    let elapsed = 0;
    const check = () => {
      if (document.querySelector(rootSelector)) {
        return resolve(true);
      }
      
      elapsed += retryInterval;
      if (elapsed >= maxTime) {
        console.warn(`FocusTube: Root element ${rootSelector} not found within ${maxTime}ms. Filters might be delayed or inactive.`);
        return resolve(false);
      }
      
      setTimeout(check, retryInterval);
    };
    
    check();
  });
}
