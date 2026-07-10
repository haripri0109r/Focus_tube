/**
 * FocusTube Classification Engine — Component Versions
 *
 * Every major subsystem exposes a version string.
 * These versions are embedded in ClassificationResult and cache keys,
 * ensuring stale cached results are never served after an upgrade.
 */

export const EngineVersions = {
  classifier:     '1.0.0',
  taxonomy:       '1.0.0',
  nlpPipeline:    '1.0.0',
  intentModel:    '1.0.0',
  scoringProfile: '1.0.0',
  cache:          '1.0.0',
} as const;

export type ComponentVersions = typeof EngineVersions;
