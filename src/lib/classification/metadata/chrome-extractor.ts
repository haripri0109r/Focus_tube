/**
 * Chrome Metadata Extractor
 *
 * Browser-specific module — the only file in the classification engine
 * that directly touches the YouTube DOM.
 *
 * Tries multiple selector strategies in priority order and degrades
 * gracefully when any field is unavailable.
 */

import { ClassificationVideoMetadata, IMetadataExtractor } from '../types';

/** Reads inner text from the first matching selector, or '' if not found */
function text(root: Element | Document, ...selectors: string[]): string {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return '';
}

/** Reads an attribute from the first matching selector, or '' */
function attr(root: Element | Document, selector: string, attribute: string): string {
  return (root.querySelector(selector) as HTMLElement | null)
    ?.getAttribute(attribute) ?? '';
}

export class ChromeMetadataExtractor implements IMetadataExtractor {
  extract(element: Element): ClassificationVideoMetadata {
    return {
      videoId:        this.extractVideoId(element),
      title:          this.extractTitle(element),
      channel:        this.extractChannel(element),
      description:    this.extractDescription(element),
      tags:           this.extractTags(element),
      hashtags:       this.extractHashtags(element),
      accessibilityLabel: attr(element, 'a[aria-label]', 'aria-label'),
      videoLengthSeconds: this.extractDuration(element),
      isLive:         !!element.querySelector('[overlay-style="LIVE"]'),
      isPremiere:     !!element.querySelector('[overlay-style="UPCOMING"]'),
      isVerified:     !!element.querySelector('[icon-type="OFFICIAL_ARTIST_BADGE"], .yt-icon-badge-shape'),
    };
  }

  private extractVideoId(el: Element): string | undefined {
    // href="/watch?v=VIDEO_ID" on the primary link
    const href = attr(el, 'a[href*="/watch?v="]', 'href');
    const match = href.match(/[?&]v=([^&]+)/);
    return match?.[1];
  }

  private extractTitle(el: Element): string {
    return text(el,
      '#video-title',
      'a#video-title-link',
      '.yt-lockup-metadata-view-model-wiz__title',
      'h3 a',
      'h3',
      '.title',
    );
  }

  private extractChannel(el: Element): string {
    return text(el,
      'ytd-channel-name yt-formatted-string',
      '#channel-name yt-formatted-string',
      '.ytd-channel-name',
      'ytd-channel-name a',
      '.channel-name',
      'yt-formatted-string.ytd-channel-name',
    );
  }

  private extractDescription(el: Element): string {
    // Description is typically only on watch page
    return text(el,
      '#description-text',
      'yt-formatted-string#description',
      '#meta #description',
    );
  }

  private extractTags(el: Element): string[] {
    // Tags are injected into <meta name="keywords"> on watch page
    const metaKw = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    if (metaKw) return metaKw.split(',').map(t => t.trim()).filter(Boolean);
    return [];
  }

  private extractHashtags(el: Element): string[] {
    const hashtagEls = el.querySelectorAll('a.yt-simple-endpoint[href*="hashtag"]');
    return Array.from(hashtagEls)
      .map(h => h.textContent?.trim() ?? '')
      .filter(Boolean);
  }

  private extractDuration(el: Element): number | undefined {
    const durationText = text(el,
      'span.ytd-thumbnail-overlay-time-status-renderer',
      'ytd-thumbnail-overlay-time-status-renderer span',
      'span[aria-label*="minutes"]',
    );
    if (!durationText) return undefined;
    const parts = durationText.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return undefined;
  }
}
