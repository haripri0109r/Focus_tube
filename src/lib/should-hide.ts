/**
 * FocusTube — should-hide adapter
 *
 * Thin compatibility shim that bridges the legacy `shouldHide()` API
 * (called from content script observers) to the new v2.2 Classification Engine.
 *
 * The old signature is preserved so content script callers need zero changes.
 * The internals now use the full 5-module pipeline instead of the old scorer.
 */

import { classify, buildContext } from './classification';
import { ChromeMetadataExtractor } from './classification/metadata/chrome-extractor';
import { debugLogSync } from './debug';

const extractor = new ChromeMetadataExtractor();

/**
 * Determines whether a video card should be hidden.
 *
 * @param title       - Video title text
 * @param channel     - Channel name text
 * @param ariaLabel   - aria-label attribute (contains title + channel)
 * @param keywords    - Active topic keywords from the current session
 * @param strictMode  - If true, uses the "strict" scoring profile
 * @returns true = hide the video, false = show the video
 */
export function shouldHide(
  title: string,
  channel: string,
  ariaLabel: string,
  keywords: string[],
  strictMode = false,
): boolean {
  if (!keywords || keywords.length === 0) return false;

  const combined = `${title}${channel}${ariaLabel}`.trim();
  if (!combined) {
    debugLogSync('FILTER', { decision: 'hide', reason: 'empty-metadata' });
    return true;
  }

  const topic = keywords[0] ?? '';
  const context = buildContext({
    topic,
    keywords,
    profileId: strictMode ? 'strict' : 'balanced',
  });

  // Build a lightweight metadata object from the raw strings
  const rawMeta = {
    title,
    channel,
    accessibilityLabel: ariaLabel,
  };

  const result = classify(rawMeta, context);

  debugLogSync('FILTER_V2', {
    title: title.substring(0, 60),
    channel: channel.substring(0, 30),
    decision: result.decision,
    score: result.scores.final.toFixed(1),
    confidence: result.confidence,
    edu: result.scores.educational.toFixed(0),
    ent: result.scores.entertainment.toFixed(0),
    topic: result.scores.topic.toFixed(0),
    intent: result.scores.intent.toFixed(0),
    neg: result.scores.negativePenalty.toFixed(0),
    categories: result.detectedCategories.slice(0, 3).join(', '),
  });

  return result.decision === 'BLOCK' || result.decision === 'UNCERTAIN';
}
