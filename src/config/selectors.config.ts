export const SelectorConfig = {
  version: 1,
  home: {
    root: 'ytd-rich-grid-renderer #contents',
    items: ['ytd-rich-item-renderer', 'ytd-rich-section-renderer', 'ytd-video-renderer'],
    shelves: ['ytd-rich-section-renderer']
  },
  subscriptions: {
    root: 'ytd-rich-grid-renderer #contents',
    items: ['ytd-rich-item-renderer', 'ytd-rich-section-renderer', 'ytd-video-renderer'],
    shelves: ['ytd-rich-section-renderer']
  },
  search: {
    root: 'ytd-section-list-renderer #contents',
    items: ['ytd-video-renderer', 'ytd-shelf-renderer', 'ytd-reel-shelf-renderer', 'ytd-channel-renderer'],
    shelves: ['ytd-reel-shelf-renderer', 'ytd-shelf-renderer']
  },
  watch: {
    root: '#secondary-inner',
    items: ['ytd-compact-video-renderer']
  },
  metadata: {
    title: ['#video-title', 'h3 a', 'a#video-title-link'],
    channel: ['ytd-channel-name', '#channel-name', '.ytd-channel-name'],
    thumbnailLink: ['a#thumbnail']
  }
};
