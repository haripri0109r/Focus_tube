(async () => {
  await import(chrome.runtime.getURL('content/css-injector.js'));
})();
