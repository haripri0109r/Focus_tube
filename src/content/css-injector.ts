// Injected at document_start
if (window.location.pathname === '/' || window.location.pathname === '/feed/home') {
  const style = document.createElement('style');
  style.id = 'focustube-preload';
  style.textContent = `
    ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents,
    ytd-rich-grid-renderer #contents {
      display: none !important;
    }
  `;
  document.documentElement.appendChild(style);
}
