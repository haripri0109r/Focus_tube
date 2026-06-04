import { PageType } from '../types';

let debounceTimer: number | null = null;

export function setupSpaNavigator(onNavigate: (pageType: PageType) => void) {
  window.addEventListener('yt-navigate-finish', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    
    debounceTimer = window.setTimeout(() => {
      const pageType = getPageType(window.location.pathname);
      onNavigate(pageType);
    }, 150);
  });
}

function getPageType(pathname: string): PageType {
  if (pathname === '/' || pathname === '/feed/home') return 'home';
  if (pathname === '/results') return 'search';
  if (pathname === '/watch') return 'watch';
  if (pathname.startsWith('/shorts')) return 'shorts';
  return 'other';
}
