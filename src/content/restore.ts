export function restoreAllHiddenElements() {
  const hiddenElements = document.querySelectorAll('[data-focustube-hidden="true"]');
  hiddenElements.forEach((el) => {
    el.removeAttribute('data-focustube-hidden');
    (el as HTMLElement).style.removeProperty('display');
  });
}

export function clearAllProcessedFlags() {
  const processedElements = document.querySelectorAll('[data-ft-processed="true"]');
  processedElements.forEach((el) => {
    el.removeAttribute('data-ft-processed');
  });
}
