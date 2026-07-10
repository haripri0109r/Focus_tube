/**
 * FocusTube Classification Engine — Public Façade
 *
 * Single import point for all content scripts.
 * Creates and manages the singleton engine instance with all Phase 1 modules registered.
 *
 * Usage:
 *   import { classify, invalidateCache } from '../lib/classification';
 *
 *   const result = classify(rawMeta, sessionContext);
 *   if (result.decision === 'BLOCK') hideElement(el);
 */

import { ClassificationEngine } from './engine/engine';
import {
  EduScorerModule, EntScorerModule, TopicMatcherModule,
  IntentScorerModule, NegativeDetectorModule,
} from './modules/phase1.modules';
import { DisplayStrategy, DOMRenderer } from './display/display-strategy';
import {
  ClassificationVideoMetadata, ClassificationResult,
  SessionContext, FeatureFlags, DefaultFeatureFlags,
  DisplayTier,
} from './types';
import { ScoringProfiles, DEFAULT_PROFILE_ID, getProfile } from './config/scoring-profiles';

// ---------------------------------------------------------------------------
// Singleton engine instance
// ---------------------------------------------------------------------------

const engine = new ClassificationEngine([
  new EduScorerModule(),
  new EntScorerModule(),
  new TopicMatcherModule(),
  new IntentScorerModule(),
  new NegativeDetectorModule(),
]);

const displayStrategy = new DisplayStrategy();
const domRenderer = new DOMRenderer();

// Warm L1 cache from storage asynchronously on module load
engine.warmCache().catch(() => {/* ignore */});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classifies a single video's metadata against the current session context.
 *
 * @param rawMeta    Metadata extracted from the DOM element
 * @param context    Active session context (topic, keywords, profile, flags)
 * @returns          ClassificationResult with decision, scores, and reasons
 */
export function classify(
  rawMeta: ClassificationVideoMetadata,
  context: SessionContext,
): ClassificationResult {
  return engine.classify(rawMeta, context);
}

/**
 * Classifies a video and immediately applies the result to a DOM element.
 * This is the main entry point called from the content script observer.
 *
 * @param element    The video card DOM element to evaluate
 * @param rawMeta    Pre-extracted metadata (pass null to re-extract)
 * @param context    Active session context
 * @returns          The ClassificationResult for this element
 */
export function classifyAndApply(
  element: HTMLElement,
  rawMeta: ClassificationVideoMetadata,
  context: SessionContext,
): ClassificationResult {
  const result = engine.classify(rawMeta, context);
  const tier = displayStrategy.resolve(result, context.flags);
  domRenderer.apply(tier, element, result);
  return result;
}

/**
 * Resolves a ClassificationResult to a DisplayTier without touching the DOM.
 * Useful for batch processing before applying changes.
 */
export function resolveDisplayTier(
  result: ClassificationResult,
  flags: FeatureFlags,
): DisplayTier {
  return displayStrategy.resolve(result, flags);
}

/**
 * Applies a pre-computed DisplayTier to a DOM element.
 */
export function applyTier(
  tier: DisplayTier,
  element: HTMLElement,
  result: ClassificationResult,
): void {
  domRenderer.apply(tier, element, result);
}

/**
 * Invalidates the in-memory cache.
 * Must be called when the session topic or scoring profile changes.
 */
export function invalidateCache(): void {
  engine.invalidateCache();
}

/**
 * Builds a SessionContext from raw extension storage values.
 * Used by content scripts to avoid manual context construction.
 */
export function buildContext(opts: {
  topic: string;
  keywords: string[];
  profileId?: string;
  flags?: Partial<FeatureFlags>;
}): SessionContext {
  const profile = getProfile(opts.profileId ?? DEFAULT_PROFILE_ID);
  return {
    topic: opts.topic,
    keywords: opts.keywords,
    activeProfile: profile,
    flags: { ...DefaultFeatureFlags, ...(opts.flags ?? {}) },
  };
}

// ---------------------------------------------------------------------------
// Re-exports (for advanced use)
// ---------------------------------------------------------------------------

export { ClassificationEngine } from './engine/engine';
export { ChromeMetadataExtractor } from './metadata/chrome-extractor';
export { DisplayStrategy, DOMRenderer } from './display/display-strategy';
export { ScoringProfiles, getProfile } from './config/scoring-profiles';
export { DefaultFeatureFlags } from './types';
export type {
  ClassificationResult, ClassificationVideoMetadata, SessionContext,
  FeatureFlags, ScoringProfile, DisplayTier, ContentCategory,
  ClassificationDecision, NegativeSignals, ComponentScores,
} from './types';
