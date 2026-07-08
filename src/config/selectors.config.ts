/**
 * DOM Selectors for FocusTube Filtering
 *
 * YouTube uses Polymer web components (ytd-*) for its UI.
 * These selectors target the current YouTube DOM structure as of 2024-2025.
 *
 * Maintenance note: If filtering breaks after a YouTube update, this file
 * is the first place to check. Inspect the DOM and update selectors here.
 */

export const SelectorConfig = {
  version: 3,

  home: {
    /** Container for the main grid of video cards on the home feed */
    root: 'ytd-rich-grid-renderer',
    /** Individual video card types found in the home grid */
    items: [
      'ytd-rich-item-renderer',      // Standard video card
      'ytd-rich-section-renderer',   // Section (Shorts shelf, promoted, etc.)
      'ytd-video-renderer',          // Fallback list-style video
    ],
    /** Sections that should always be hidden (Shorts shelves, etc.) */
    shelves: [
      'ytd-rich-section-renderer',
    ],
  },

  subscriptions: {
    root: 'ytd-rich-grid-renderer',
    items: [
      'ytd-rich-item-renderer',
      'ytd-rich-section-renderer',
      'ytd-video-renderer',
    ],
    shelves: [
      'ytd-rich-section-renderer',
    ],
  },

  search: {
    /** Root container for all search result items */
    root: 'ytd-section-list-renderer #contents',
    /** All card types that can appear in search results */
    items: [
      'ytd-video-renderer',          // Standard video result
      'ytd-shelf-renderer',          // "Related to your search" shelf
      'ytd-reel-shelf-renderer',     // Shorts shelf in search results
      'ytd-channel-renderer',        // Channel result card
      'ytd-movie-renderer',          // Movie/film result
      'ytd-playlist-renderer',       // Playlist result
      'ytd-radio-renderer',          // Mix/radio result
      'yt-lockup-view-model',        // New card format (YouTube experiments)
    ],
    /** Shelf types that should be wholesale hidden */
    shelves: [
      'ytd-reel-shelf-renderer',
      'ytd-shelf-renderer',
    ],
  },

  watch: {
    /**
     * Root for related/recommended videos on the watch page.
     * YouTube uses '#secondary' as the outer container and
     * 'ytd-watch-next-secondary-results-renderer' as the inner list.
     */
    root: '#secondary',
    /** Individual recommendation card types */
    items: [
      'ytd-compact-video-renderer',        // Standard compact recommendation
      'ytd-compact-radio-renderer',         // Auto-play mix card
      'ytd-compact-playlist-renderer',      // Playlist recommendation
      'ytd-compact-movie-renderer',         // Movie recommendation
      'ytd-reel-shelf-renderer',            // Shorts shelf in sidebar
    ],
  },

  /**
   * Trending / Explore page — ytd-expanded-shelf-contents-renderer
   * Note: Hiding the entire explore page is too aggressive; we filter
   * individual video cards within explore sections.
   */
  explore: {
    root: 'ytd-browse[page-subtype="trending"] #contents',
    items: [
      'ytd-video-renderer',
      'ytd-rich-item-renderer',
    ],
  },

  /**
   * Metadata selectors — tried in order, first non-empty match wins.
   * Multiple selectors handle both old and new YouTube card formats.
   */
  metadata: {
    title: [
      '#video-title',                                      // Standard card title
      'a#video-title-link',                                // Link variant
      'yt-formatted-string#video-title',                   // Formatted string variant
      'span#video-title',                                  // Span variant (compact cards)
      '.yt-lockup-metadata-view-model-wiz__title',         // New lockup card
      'h3 a',                                              // Generic heading link
      'a[title]',                                          // Anchor with title attr
    ],
    channel: [
      'ytd-channel-name yt-formatted-string',              // Standard channel name
      'ytd-channel-name a',                                // Channel link
      '#channel-name yt-formatted-string',                 // Alternate ID
      '#channel-name a',
      '.ytd-channel-name',                                 // Class-based
      'yt-formatted-string.ytd-channel-name',
      '.yt-lockup-metadata-view-model-wiz__subtitle a',    // New lockup subtitle
      '.yt-lockup-metadata-view-model-wiz__subtitle',
    ],
    thumbnailLink: [
      'a#thumbnail',
      'a.ytd-thumbnail',
    ],
  },

  /** Selectors for Shorts content across all pages */
  shorts: {
    /** Full Shorts player (on /shorts/* route) */
    player: 'ytd-shorts',
    /** Shorts shelf/row embedded in home/search */
    shelf: 'ytd-reel-shelf-renderer',
    /** Individual Shorts item in a shelf */
    item: 'ytd-reel-item-renderer',
    /** Shorts item in a rich grid (home page) */
    richItem: 'ytd-rich-item-renderer:has(ytd-reel-item-renderer)',
  },
} as const;
