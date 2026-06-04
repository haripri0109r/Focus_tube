import { SelectorConfig } from '../../config/selectors.config';

export function extractMetadata(el: Element) {
  // If already processed, skip
  if (el.hasAttribute('data-ft-processed')) {
    return { title: '', channel: '', ariaLabel: '', isProcessed: true };
  }

  let title = '';
  for (const sel of SelectorConfig.metadata.title) {
    const titleEl = el.querySelector(sel);
    if (titleEl && titleEl.textContent?.trim()) {
      title = titleEl.textContent.trim();
      break;
    }
  }
  
  let channel = '';
  for (const sel of SelectorConfig.metadata.channel) {
    const channelEl = el.querySelector(sel);
    if (channelEl && channelEl.textContent?.trim()) {
      channel = channelEl.textContent.trim();
      break;
    }
  }
  
  let ariaLabel = el.getAttribute('aria-label') || '';
  if (!ariaLabel) {
     const link = el.querySelector('a#video-title-link, a#video-title, #video-title, a#thumbnail');
     if (link) ariaLabel = link.getAttribute('aria-label') || '';
  }
  
  // Skeleton detection: if it's empty but has a skeleton class or structure
  const isSkeleton = !title && !channel && !ariaLabel && 
    (el.querySelector('.skeleton') || el.querySelector('#video-title-skeleton') || (el as HTMLElement).innerText?.trim() === '');

  if (isSkeleton) {
    return { title, channel, ariaLabel, isSkeleton: true };
  }

  // If it's truly empty and not a skeleton, it might just be a non-video element or still loading
  if (!title && !channel && !ariaLabel) {
    return null;
  }
  
  return { title, channel, ariaLabel, isSkeleton: false };
}
