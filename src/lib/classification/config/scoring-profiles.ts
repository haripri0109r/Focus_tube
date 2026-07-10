/**
 * Scoring Profiles — Built-in Configurations
 *
 * Each profile defines how the weighted formula weights each signal.
 * Users switch profiles from the popup; the engine reacts automatically.
 * The cache invalidates automatically because profileId is part of the cache key.
 */

import { ScoringProfile } from '../types';

export const ScoringProfiles: Record<string, ScoringProfile> = {
  strict: {
    id: 'strict',
    name: 'Strict Learning',
    version: '1.0.0',
    educationWeight: 0.45,
    topicWeight: 0.30,
    intentWeight: 0.15,
    contentQualityWeight: 0.10,
    entertainmentPenalty: 0.80,
    negativePenalty: 0.60,
    blockThreshold: -10,   // Phase 1 net score
    allowThreshold: 20,
    hideThreshold: 65,     // Phase 2 LP
    collapseThreshold: 80,
  },

  balanced: {
    id: 'balanced',
    name: 'Balanced',
    version: '1.0.0',
    educationWeight: 0.40,
    topicWeight: 0.25,
    intentWeight: 0.20,
    contentQualityWeight: 0.15,
    entertainmentPenalty: 0.55,
    negativePenalty: 0.40,
    blockThreshold: -20,
    allowThreshold: 15,
    hideThreshold: 49,
    collapseThreshold: 69,
  },

  research: {
    id: 'research',
    name: 'Research Mode',
    version: '1.0.0',
    // Research: show a wider net of educational content even if off-topic
    educationWeight: 0.55,
    topicWeight: 0.15,
    intentWeight: 0.15,
    contentQualityWeight: 0.15,
    entertainmentPenalty: 0.30,
    negativePenalty: 0.25,
    blockThreshold: -30,
    allowThreshold: 10,
    hideThreshold: 35,
    collapseThreshold: 55,
  },

  relaxed: {
    id: 'relaxed',
    name: 'Relaxed',
    version: '1.0.0',
    educationWeight: 0.30,
    topicWeight: 0.20,
    intentWeight: 0.10,
    contentQualityWeight: 0.10,
    entertainmentPenalty: 0.25,
    negativePenalty: 0.20,
    blockThreshold: -40,
    allowThreshold: 5,
    hideThreshold: 25,
    collapseThreshold: 40,
  },

  developer: {
    id: 'developer',
    name: 'Developer Mode',
    version: '1.0.0',
    // Same as balanced but hideThreshold=0 so nothing is hidden — for debugging
    educationWeight: 0.40,
    topicWeight: 0.25,
    intentWeight: 0.20,
    contentQualityWeight: 0.15,
    entertainmentPenalty: 0.55,
    negativePenalty: 0.40,
    blockThreshold: -9999,
    allowThreshold: -9999,
    hideThreshold: 0,
    collapseThreshold: 0,
  },
};

export const DEFAULT_PROFILE_ID = 'balanced';

export function getProfile(id: string): ScoringProfile {
  return ScoringProfiles[id] ?? ScoringProfiles[DEFAULT_PROFILE_ID];
}
