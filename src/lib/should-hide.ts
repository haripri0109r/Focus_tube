import { calculateRelevance } from './relevance/scorer';
import { debugLogSync } from './debug';

/**
 * Determines whether a video card should be hidden.
 *
 * @param title       - Video title text
 * @param channel     - Channel name text
 * @param ariaLabel   - aria-label attribute (often contains title + channel)
 * @param keywords    - Active topic keywords from the current session
 * @param strictMode  - If true, applies a higher confidence threshold
 * @returns true = hide the video, false = show the video
 */
export function shouldHide(
  title: string,
  channel: string,
  ariaLabel: string,
  keywords: string[],
  strictMode = false,
): boolean {
  // If no keywords are active, filtering is disabled — show everything
  if (!keywords || keywords.length === 0) return false;

  // If all metadata is empty, we can't make a decision — hide to be safe
  const combined = `${title}${channel}${ariaLabel}`.trim();
  if (!combined) {
    debugLogSync('FILTER', { decision: 'hide', reason: 'empty-metadata' });
    return true;
  }

  const relevance = calculateRelevance(title, channel, ariaLabel, keywords, strictMode);

  debugLogSync('FILTER', {
    title: title.substring(0, 60),
    channel: channel.substring(0, 30),
    decision: relevance.finalDecision,
    score: relevance.score,
    reason: relevance.reason,
  });

  return relevance.finalDecision === 'hide';
}
