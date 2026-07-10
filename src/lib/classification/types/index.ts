/**
 * FocusTube Classification Engine — All TypeScript Interfaces & Enums
 *
 * This is the single source of truth for all types used across
 * the classification pipeline. Every module imports from here.
 */

// ---------------------------------------------------------------------------
// Enums & Union Types
// ---------------------------------------------------------------------------

export type ContentCategory =
  // Educational
  | 'PROGRAMMING'
  | 'COMPUTER_SCIENCE'
  | 'AI_ML'
  | 'MATHEMATICS'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'ENGINEERING'
  | 'ELECTRONICS'
  | 'ROBOTICS'
  | 'CYBERSECURITY'
  | 'CLOUD_DEVOPS'
  | 'FINANCE'
  | 'BUSINESS'
  | 'PRODUCTIVITY'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'LANGUAGE_LEARNING'
  | 'EXAM_PREP'
  | 'MEDICINE'
  | 'LAW'
  | 'RESEARCH'
  // Entertainment
  | 'GAMING'
  | 'MUSIC'
  | 'MOVIES'
  | 'SPORTS'
  | 'VLOGS'
  | 'PRANKS'
  | 'REACTIONS'
  | 'CHALLENGES'
  | 'COMEDY'
  | 'LIFESTYLE'
  | 'TRAVEL'
  | 'FOOD'
  | 'CELEBRITY'
  | 'CLICKBAIT'
  // Neutral
  | 'NEWS'
  | 'PODCAST'
  | 'UNKNOWN';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type ContentQualityLabel = 'EDUCATIONAL' | 'ENTERTAINMENT' | 'MIXED' | 'UNKNOWN';

export type SessionRelevanceLabel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

/** Phase 2+: determines how the video card is rendered */
export type DisplayTier = 'PINNED' | 'NORMAL' | 'COLLAPSED' | 'HIDDEN';

export type ConfidenceLabel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type ClassificationDecision = 'ALLOW' | 'BLOCK' | 'UNCERTAIN';

export type FeatureFlag = keyof FeatureFlags;

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

export interface FeatureFlags {
  // Phase 2
  enableLearningPriority: boolean;
  enableDisplayTiers: boolean;
  enableRanking: boolean;
  enableExplainability: boolean;
  enableScoringProfiles: boolean;

  // Phase 3
  enableDifficulty: boolean;
  enableFreshness: boolean;
  enableAdaptiveLearning: boolean;
  enableEnhancedMetadata: boolean;

  // Phase 4
  enableML: boolean;
  enableEmbeddings: boolean;
}

export const DefaultFeatureFlags: FeatureFlags = {
  enableLearningPriority:  false,
  enableDisplayTiers:      false,
  enableRanking:           false,
  enableExplainability:    false,
  enableScoringProfiles:   false,
  enableDifficulty:        false,
  enableFreshness:         false,
  enableAdaptiveLearning:  false,
  enableEnhancedMetadata:  false,
  enableML:                false,
  enableEmbeddings:        false,
};

// ---------------------------------------------------------------------------
// Scoring Profile
// ---------------------------------------------------------------------------

export interface ScoringProfile {
  id: string;
  name: string;
  version: string;
  educationWeight: number;        // 0–1
  topicWeight: number;            // 0–1
  intentWeight: number;           // 0–1
  contentQualityWeight: number;   // 0–1
  entertainmentPenalty: number;   // 0–1
  negativePenalty: number;        // 0–1
  /** Phase 1: net score below this → BLOCK */
  blockThreshold: number;
  /** Phase 1: net score above this → ALLOW */
  allowThreshold: number;
  /** Phase 2+: LP below this → HIDDEN */
  hideThreshold: number;
  /** Phase 2+: LP below this → COLLAPSED */
  collapseThreshold: number;
}

// ---------------------------------------------------------------------------
// Video Metadata (Input)
// ---------------------------------------------------------------------------

export interface ClassificationVideoMetadata {
  videoId?: string;
  title: string;
  channel: string;
  description?: string;
  tags?: string[];
  hashtags?: string[];
  category?: string;
  playlistTitle?: string;
  videoLengthSeconds?: number;
  uploadDate?: Date;
  isLive?: boolean;
  isPremiere?: boolean;
  isVerified?: boolean;
  language?: string;
  accessibilityLabel?: string;
  autoTopics?: string[];
  // Phase 3+
  chapters?: string[];
  pinnedComment?: string;
  transcriptSnippet?: string;
  thumbnailAlt?: string;
}

// ---------------------------------------------------------------------------
// NLP
// ---------------------------------------------------------------------------

export interface NormalizedMetadata {
  /** Full combined text: title + channel + tags + description */
  normalizedText: string;
  /** Original fields kept for reference */
  title: string;
  channel: string;
  tags: string[];
  /** Tokenized (stemmed) words from the full text */
  tokens: string[];
  /** Ratio of uppercase characters to total alpha characters (0–1) */
  capsRatio: number;
  /** Number of exclamation marks in the original title */
  exclCount: number;
  wordCount: number;
}

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export interface TaxonomyEntry {
  keyword: string;
  type: 'EDU' | 'ENT';
  category: ContentCategory;
  subtopic: string;
  weight: number;
}

export interface TaxonomyHit {
  keyword: string;
  type: 'EDU' | 'ENT';
  category: ContentCategory;
  subtopic: string;
  weight: number;
  /** Index in the normalizedText where this keyword was found */
  position: number;
}

export interface SubtopicEntry {
  weight: number;
  keywords: string[];
}

export interface TaxonomyCategoryModule {
  category: ContentCategory;
  type: 'EDU' | 'ENT';
  version: string;
  subtopics: Record<string, SubtopicEntry>;
}

// ---------------------------------------------------------------------------
// Module System
// ---------------------------------------------------------------------------

export interface ModuleResult {
  moduleId: string;
  moduleVersion: string;
  /** Normalized score 0–100 for this module */
  score: number;
  /** Contribution weight — fed into score aggregator */
  weight: number;
  label?: string;
  matchedKeywords?: string[];
  matchedCategories?: ContentCategory[];
  reasons?: string[];
  metadata?: Record<string, unknown>;
}

export interface SessionContext {
  topic: string;
  keywords: string[];
  activeProfile: ScoringProfile;
  flags: FeatureFlags;
  userDifficultyLevel?: DifficultyLevel;
}

export interface ClassificationModule {
  readonly id: string;
  readonly version: string;
  readonly phase: 1 | 2 | 3 | 4;
  readonly featureFlag: FeatureFlag | null; // null = always enabled
  evaluate(meta: NormalizedMetadata, context: SessionContext): ModuleResult;
}

// ---------------------------------------------------------------------------
// Negative Signals
// ---------------------------------------------------------------------------

export interface NegativeSignals {
  capsRatio: number;
  exclCount: number;
  clickbaitHits: string[];
  totalPenalty: number;
}

// ---------------------------------------------------------------------------
// Component Scores
// ---------------------------------------------------------------------------

export interface ComponentScores {
  educational: number;    // 0–100
  entertainment: number;  // 0–100
  topic: number;          // 0–100
  intent: number;         // 0–100
  freshness?: number;     // 0–100 (Phase 3)
  difficultyFit?: number; // 0–100 (Phase 3)
  negativePenalty: number; // 0–40 (deducted)
  /** Final net score */
  final: number;
}

// ---------------------------------------------------------------------------
// Classification Result (Output)
// ---------------------------------------------------------------------------

export interface ClassificationResult {
  // --- Core (Phase 1) ---
  decision: ClassificationDecision;
  confidence: number;
  confidenceLabel: ConfidenceLabel;

  // --- Phase 2+ ---
  learningPriority?: number;
  displayTier?: DisplayTier;
  contentQualityLabel?: ContentQualityLabel;
  sessionRelevanceLabel?: SessionRelevanceLabel;

  // --- Scores ---
  scores: ComponentScores;
  moduleResults: ModuleResult[];

  // --- Explainability ---
  detectedCategories: ContentCategory[];
  matchedEduKeywords: string[];
  matchedEntKeywords: string[];
  matchedTopicSynonyms: string[];
  negativeSignals: NegativeSignals;
  reasons: string[];
  formula?: string;
  appliedProfile: ScoringProfile;

  // --- Versioning ---
  taxonomyVersion: string;
  classifierVersion: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

export interface CacheContextKey {
  taxonomyVersion: string;
  classifierVersion: string;
  profileId: string;
  topic: string;
  flagsHash: string;
}

// ---------------------------------------------------------------------------
// IScorer — ML Extension Point
// ---------------------------------------------------------------------------

export interface IScorer {
  readonly name: string;
  readonly version: string;
  score(meta: NormalizedMetadata, context: SessionContext): Promise<ComponentScores>;
}

// ---------------------------------------------------------------------------
// Platform Abstraction
// ---------------------------------------------------------------------------

export interface IMetadataExtractor {
  extract(element: Element): ClassificationVideoMetadata;
}

export interface IDOMRenderer {
  apply(action: DisplayAction): void;
}

export interface DisplayAction {
  tier: DisplayTier;
  element: HTMLElement;
  result: ClassificationResult;
}
