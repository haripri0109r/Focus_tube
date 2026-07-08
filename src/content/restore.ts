/**
 * Restore hidden elements when filter is deactivated.
 *
 * Note: WeakSet cannot be "cleared" programmatically, but since
 * SPA navigation replaces the DOM, old elements are garbage collected
 * and automatically removed from the WeakSet. New elements inserted
 * after navigation will not be in the set, so they will be re-processed.
 */

export function restoreAllHiddenElements(): void {
  const hiddenElements = document.querySelectorAll('[data-focustube-hidden]');
  hiddenElements.forEach((el) => {
    el.removeAttribute('data-focustube-hidden');
    (el as HTMLElement).style.removeProperty('display');
  });

  // Remove fallback messages
  document.getElementById('ft-homepage-fallback')?.remove();
  document.getElementById('ft-search-fallback')?.remove();
}

/**
 * Called on SPA navigation before re-setting up the observer.
 *
 * The WeakSet in filters/utils.ts automatically handles GC of old elements.
 * This function is kept for any cleanup that IS needed across navigations.
 */
export function clearAllProcessedFlags(): void {
  // Remove legacy data-ft-processed attributes from any elements that may
  // have been processed before the WeakSet refactor (backwards compat)
  const legacyProcessed = document.querySelectorAll('[data-ft-processed]');
  legacyProcessed.forEach((el) => el.removeAttribute('data-ft-processed'));
}
