/**
 * Filter Utilities — Shared helpers for all filter modules.
 *
 * Key design decisions:
 * 1. WeakSet for processed tracking (not DOM attributes) so Polymer recycling
 *    of elements doesn't cause stale state bugs.
 * 2. Metadata extraction tries multiple selectors to handle both old and new
 *    YouTube card formats.
 * 3. Skeleton detection prevents marking loading placeholders as processed.
 */

import { SelectorConfig } from '../../config/selectors.config';
import { VideoMetadata } from '../../types';
import { debugLogSync } from '../../lib/debug';

// ---------------------------------------------------------------------------
// Shared WeakSet — tracks which elements have been fully processed.
// Exported so observer.ts can reset it on disconnect.
// ---------------------------------------------------------------------------

export const processedElements = new WeakSet<Element>();

/** Marks an element as processed by adding it to the WeakSet and setting the data-ft-processed DOM attribute. */
export function markAsProcessed(el: Element): void {
  processedElements.add(el);
  el.setAttribute('data-ft-processed', 'true');
}

/** Reset the processed tracking set (call on SPA navigation / disconnect). */
export function resetProcessedElements(): void {
  // WeakSet has no .clear(), so we replace the module's internal tracking
  // by marking all elements as stale. On next filter pass, processedElements
  // will start fresh when we re-export (module-level singleton).
  //
  // Implementation note: we can't truly "clear" a WeakSet. Instead,
  // on SPA navigation the old DOM elements get GC'd and the WeakSet entries
  // are automatically dropped. New DOM elements will not be in the set.
  // The function signature is kept for clarity / symmetry with restore.ts.
}

// ---------------------------------------------------------------------------
// Hide / Show helpers — centralised so display logic is in one place
// ---------------------------------------------------------------------------

/**
 * Hides a video card element.
 * Uses `display: none !important` to override YouTube's inline and class styles.
 */
export function hideElement(el: HTMLElement, onHide: () => void): void {
  el.setAttribute('data-focustube-hidden', 'true');
  el.style.setProperty('display', 'none', 'important');
  onHide();
}

/**
 * Marks an element as allowed (visible).
 * Does NOT set `display: block` — we let YouTube control its own layout.
 */
export function showElement(el: HTMLElement, onShow: () => void): void {
  el.setAttribute('data-focustube-hidden', 'false');
  el.style.removeProperty('display');
  onShow();
}

// ---------------------------------------------------------------------------
// Metadata extraction
// ---------------------------------------------------------------------------

/**
 * Extracts video metadata (title, channel, aria-label) from a card element.
 * Returns a VideoMetadata object. Never returns null — caller always gets
 * a result, with isSkeleton/isEmpty flags to decide what to do.
 */
export function extractMetadata(el: Element): VideoMetadata {
  // Already processed by a previous filter pass?
  const isProcessed = processedElements.has(el);

  // --- Title extraction ---
  let title = '';
  for (const sel of SelectorConfig.metadata.title) {
    const titleEl = el.querySelector(sel);
    const text = titleEl?.textContent?.trim() ?? (titleEl as HTMLElement | null)?.title?.trim() ?? '';
    if (text) {
      title = text;
      break;
    }
  }

  // Fallback: anchor with title attribute
  if (!title) {
    const anchor = el.querySelector('a[title]') as HTMLAnchorElement | null;
    if (anchor?.title) title = anchor.title.trim();
  }

  // --- Channel extraction ---
  let channel = '';
  for (const sel of SelectorConfig.metadata.channel) {
    const channelEl = el.querySelector(sel);
    const text = channelEl?.textContent?.trim() ?? '';
    if (text) {
      channel = text;
      break;
    }
  }

  // --- Aria-label extraction ---
  let ariaLabel = el.getAttribute('aria-label') ?? '';
  if (!ariaLabel) {
    // Try inner links for aria-label
    const links = el.querySelectorAll('a[aria-label]');
    for (const link of Array.from(links)) {
      const label = link.getAttribute('aria-label') ?? '';
      if (label) {
        ariaLabel = label;
        break;
      }
    }
  }

  // --- Skeleton detection ---
  // Skeleton elements have no visible text AND have loading indicators
  const hasNoText = !title && !channel && !ariaLabel;
  const hasSkeleton =
    !!el.querySelector('.skeleton, #video-title-skeleton, ytd-thumbnail-overlay-loading-preview-renderer, [class*="skeleton"]') ||
    (hasNoText && (el as HTMLElement).innerText?.trim() === '');

  const isSkeleton = hasNoText && hasSkeleton;

  debugLogSync('METADATA', {
    tag: el.tagName,
    title: title.substring(0, 60),
    channel: channel.substring(0, 30),
    ariaLabel: ariaLabel.substring(0, 60),
    isSkeleton,
    isProcessed,
  });

  return {
    title,
    channel,
    ariaLabel,
    isSkeleton,
    isProcessed,
  };
}

// ---------------------------------------------------------------------------
// Shorts shelf detection
// ---------------------------------------------------------------------------

/**
 * Returns true if the element is a Shorts shelf section.
 * Used to wholesale-hide Shorts rows on the homepage/search.
 */
export function isShortsShelf(el: Element): boolean {
  // ytd-reel-shelf-renderer is always a Shorts shelf
  if (el.tagName.toLowerCase() === 'ytd-reel-shelf-renderer') return true;

  // ytd-rich-section-renderer that contains a reel shelf
  if (
    el.tagName.toLowerCase() === 'ytd-rich-section-renderer' &&
    el.querySelector('ytd-reel-shelf-renderer, ytd-reel-item-renderer')
  ) {
    return true;
  }

  // ytd-shelf-renderer labelled "Shorts" or containing Shorts items/icons
  if (el.tagName.toLowerCase() === 'ytd-shelf-renderer') {
    if (el.querySelector('yt-icon[icon="shorts_logo"], .ytd-shorts-logo, ytd-reel-item-renderer')) {
      return true;
    }
    const title = el.querySelector('#title, h2')?.textContent?.toLowerCase() ?? '';
    if (title.includes('short')) return true;
  }

  return false;
}

/**
 * Returns true if an element is itself a short video item (reel item).
 */
export function isShortsItem(el: Element): boolean {
  if (el.tagName.toLowerCase() === 'ytd-reel-item-renderer') return true;
  if (el.querySelector('ytd-reel-item-renderer')) return true;
  return false;
}
