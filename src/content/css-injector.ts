// Injected at document_start
const style = document.createElement('style');
style.id = 'focustube-preload';
style.textContent = `
  /* Hide home page grid completely until observer starts */
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer #contents,
  ytd-rich-grid-renderer #contents {
    display: none !important;
  }
  
  /* Global Anti-Flicker: Hide any video/short that hasn't been processed by FocusTube yet */
  ytd-video-renderer:not([data-focustube-hidden]),
  ytd-grid-video-renderer:not([data-focustube-hidden]),
  ytd-rich-item-renderer:not([data-focustube-hidden]),
  ytd-compact-video-renderer:not([data-focustube-hidden]),
  ytd-reel-item-renderer:not([data-focustube-hidden]),
  yt-lockup-view-model:not([data-focustube-hidden]),
  ytd-channel-renderer:not([data-focustube-hidden]) {
    opacity: 0 !important;
    pointer-events: none !important;
  }
`;
document.documentElement.appendChild(style);
