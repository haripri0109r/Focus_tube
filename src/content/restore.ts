export function restoreAllHiddenElements() {
  const hiddenElements = document.querySelectorAll('[data-focustube-hidden="true"]');
  hiddenElements.forEach((el) => {
    el.removeAttribute('data-focustube-hidden');
    (el as HTMLElement).style.removeProperty('display');
  });
}
