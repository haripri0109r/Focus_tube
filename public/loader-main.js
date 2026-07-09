
(async () => {
  const injectExtId = () => {
    if (document.documentElement) document.documentElement.dataset.extensionId = chrome.runtime.id;
  };
  injectExtId();
  document.addEventListener('DOMContentLoaded', injectExtId);
  await import(chrome.runtime.getURL('content/main.js'));
})();

