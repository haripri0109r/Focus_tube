/**
 * FocusTube — Relevance Scorer
 *
 * Scores a video's relevance to the user's learning topic using multiple
 * weighted signals. The default bias is always toward HIDING — a video must
 * earn its way onto the page, not the other way around.
 *
 * Score interpretation:
 *   >= SHOW_THRESHOLD (default 60, strict 90)  → show
 *   < SHOW_THRESHOLD                           → hide
 *
 * A video with no topic keyword match AND no educational signals → score ≈ 0 → hide.
 */

import {
  EDUCATIONAL_KEYWORDS,
  ENTERTAINMENT_KEYWORDS,
  EDUCATIONAL_CHANNELS,
  ENTERTAINMENT_CHANNEL_PATTERNS,
} from './constants';
import { debugLogSync } from '../debug';

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

/** Standard mode: show if score >= this value */
const STANDARD_SHOW_THRESHOLD = 50;

/** Strict mode: only show if score >= this value */
const STRICT_SHOW_THRESHOLD = 90;

/** Score added for each topic keyword that directly matches */
const TOPIC_MATCH_SCORE = 50;

/** Score added for partial/substring topic match */
const TOPIC_PARTIAL_SCORE = 25;

/** Score added per educational keyword hit */
const EDUCATIONAL_KW_SCORE = 10;

/** Score deducted per entertainment keyword hit — raised for stronger blocking */
const ENTERTAINMENT_KW_SCORE = -35;

/** Score added for a known educational channel */
const EDUCATIONAL_CHANNEL_SCORE = 55;

/**
 * Score deducted for a known entertainment channel pattern.
 * Set very negative so that even a topic match cannot overcome it.
 */
const ENTERTAINMENT_CHANNEL_SCORE = -200;

/** Score deducted for clear entertainment contextual signals */
const CONTEXTUAL_PENALTY_HEAVY = -60;
const CONTEXTUAL_PENALTY_MEDIUM = -40;
const CONTEXTUAL_PENALTY_LIGHT = -20;

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface RelevanceScore {
  /** Raw calculated score (can be negative) */
  score: number;
  /** Whether the video matched at least one topic keyword */
  matchesTopic: boolean;
  /** Whether the final decision is to show or hide the video */
  finalDecision: 'show' | 'hide';
  /** Human-readable reason for the decision (debug use) */
  reason: string;
}

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

/**
 * Normalizes text for comparison:
 * - Lowercase
 * - Replace common punctuation with spaces
 * - Collapse whitespace
 * - Remove common emoji patterns that inflate/deflate keyword matching
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[|!@#$%^&*(){}\[\]<>]/g, ' ')
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns true if `text` contains `term` as a whole-word or phrase match.
 * This avoids "react" matching "reaction" by requiring word boundaries.
 */
function containsPhrase(text: string, term: string): boolean {
  if (!term || !text) return false;
  const t = normalize(term);
  const tx = normalize(text);

  // Exact substring match first (fastest path for multi-word phrases)
  if (tx.includes(t)) return true;

  // For single words, also check word boundaries
  if (!t.includes(' ')) {
    const regex = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return regex.test(tx);
  }

  return false;
}

// ---------------------------------------------------------------------------
// Shorts detection helpers
// ---------------------------------------------------------------------------

const SHORTS_SIGNALS = ['#shorts', '#short', '#reels', '#reel', '#youtubeshorts'];

function isLikelyShorts(title: string, ariaLabel: string, url?: string): boolean {
  const combined = `${title} ${ariaLabel} ${url ?? ''}`.toLowerCase();
  if (combined.includes('/shorts/')) return true;
  for (const s of SHORTS_SIGNALS) {
    if (combined.includes(s)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Main scorer
// ---------------------------------------------------------------------------

export function calculateRelevance(
  title: string,
  channel: string,
  ariaLabel: string,
  topicKeywords: string[],
  strictMode = false,
): RelevanceScore {

  // Guard: if no keywords configured, show everything (filter is inactive)
  if (!topicKeywords || topicKeywords.length === 0) {
    return { score: 100, matchesTopic: false, finalDecision: 'show', reason: 'no-keywords' };
  }

  const normTitle = normalize(title);
  const normChannel = normalize(channel);
  const normAria = normalize(ariaLabel);
  const fullText = `${normTitle} ${normChannel} ${normAria}`;

  let score = 0;
  let matchesTopic = false;
  let topicMatchCount = 0;
  const reasons: string[] = [];

  // ------------------------------------------------------------------
  // Signal 1: Shorts detection — immediate heavy penalty
  // ------------------------------------------------------------------
  if (isLikelyShorts(title, ariaLabel)) {
    score += -100;
    reasons.push('shorts-signal');
    return buildResult(score, false, strictMode, reasons);
  }

  // ------------------------------------------------------------------
  // Signal 2: Topic keyword matching (highest weight)
  // ------------------------------------------------------------------
  for (const keyword of topicKeywords) {
    if (containsPhrase(fullText, keyword)) {
      score += TOPIC_MATCH_SCORE;
      matchesTopic = true;
      topicMatchCount++;
      reasons.push(`topic-match:${keyword}`);
      // Cap topic bonuses at 3 matches to prevent score inflation
      if (topicMatchCount >= 3) break;
    }
  }

  // Partial/substring topic match (weaker signal)
  if (!matchesTopic) {
    for (const keyword of topicKeywords) {
      const kw = normalize(keyword);
      if (kw.length >= 4 && fullText.includes(kw)) {
        score += TOPIC_PARTIAL_SCORE;
        matchesTopic = true;
        reasons.push(`topic-partial:${keyword}`);
        break;
      }
    }
  }

  // ------------------------------------------------------------------
  // Signal 3: Educational channel (strong positive)
  // ------------------------------------------------------------------
  let isKnownEduChannel = false;
  for (const ch of EDUCATIONAL_CHANNELS) {
    if (containsPhrase(normChannel, ch)) {
      score += EDUCATIONAL_CHANNEL_SCORE;
      isKnownEduChannel = true;
      reasons.push(`edu-channel:${ch}`);
      break;
    }
  }

  // ------------------------------------------------------------------
  // Signal 4: Entertainment channel pattern (ABSOLUTE OVERRIDE — instant hide)
  // ------------------------------------------------------------------
  let isEntertainmentChannel = false;
  for (const pattern of ENTERTAINMENT_CHANNEL_PATTERNS) {
    if (containsPhrase(normChannel, pattern)) {
      score += ENTERTAINMENT_CHANNEL_SCORE; // -200, impossible to overcome
      reasons.push(`ent-channel:${pattern}`);
      isEntertainmentChannel = true;
      break;
    }
  }

  // Short-circuit: known entertainment channel = always hide
  if (isEntertainmentChannel) {
    return buildResult(score, matchesTopic, strictMode, [...reasons, 'instant-hide:ent-channel']);
  }

  // ------------------------------------------------------------------
  // Signal 5: Educational keywords (positive, capped)
  // ------------------------------------------------------------------
  let eduHits = 0;
  for (const word of EDUCATIONAL_KEYWORDS) {
    if (containsPhrase(fullText, word)) {
      score += EDUCATIONAL_KW_SCORE;
      eduHits++;
      if (eduHits >= 8) break; // cap at +80 from this signal
    }
  }
  if (eduHits > 0) reasons.push(`edu-keywords:${eduHits}`);

  // ------------------------------------------------------------------
  // Signal 6: Entertainment keywords (negative, uncapped — deliberate)
  // ------------------------------------------------------------------
  let entHits = 0;
  for (const word of ENTERTAINMENT_KEYWORDS) {
    if (containsPhrase(fullText, word)) {
      score += ENTERTAINMENT_KW_SCORE;
      entHits++;
      reasons.push(`ent-kw:${word}`);
      if (entHits >= 8) break; // cap at -280 from this signal
    }
  }

  // Override: entertainment keywords detected, no topic match = always hide
  // This prevents entertainment content with no learning relevance from sneaking through
  if (entHits >= 1 && !matchesTopic && !isKnownEduChannel) {
    return buildResult(-100, false, strictMode, [...reasons, 'instant-hide:ent-no-topic']);
  }

  // ------------------------------------------------------------------
  // Signal 7: Contextual penalties
  // ------------------------------------------------------------------

  // "reaction" unless it's clearly educational ("chemical reaction")
  if (containsPhrase(normTitle, 'reaction') && !containsPhrase(normTitle, 'chemical reaction')) {
    score += CONTEXTUAL_PENALTY_HEAVY;
    reasons.push('contextual:reaction');
  }

  // Official music/audio/video releases
  if (containsPhrase(normTitle, 'official video') || containsPhrase(normTitle, 'official audio')) {
    score += CONTEXTUAL_PENALTY_HEAVY;
    reasons.push('contextual:official-media');
  }

  // Reacting/watching patterns
  if (containsPhrase(normTitle, 'reacting to') || containsPhrase(normTitle, 'watching')) {
    score += CONTEXTUAL_PENALTY_MEDIUM;
    reasons.push('contextual:watching');
  }

  // Day-in-life / lifestyle signals
  if (
    containsPhrase(normTitle, 'day in my life') ||
    containsPhrase(normTitle, 'day in the life') ||
    containsPhrase(normTitle, 'morning routine') ||
    containsPhrase(normTitle, 'night routine')
  ) {
    score += CONTEXTUAL_PENALTY_HEAVY;
    reasons.push('contextual:vlog-pattern');
  }

  // Gaming-specific patterns
  if (containsPhrase(normTitle, 'lets play') || containsPhrase(normTitle, 'gameplay')) {
    score += CONTEXTUAL_PENALTY_HEAVY;
    reasons.push('contextual:gaming');
  }

  // Bollywood/movie patterns
  if (
    containsPhrase(normTitle, 'full movie') ||
    containsPhrase(normTitle, 'movie download') ||
    containsPhrase(normTitle, 'trailer')
  ) {
    score += CONTEXTUAL_PENALTY_HEAVY;
    reasons.push('contextual:movie');
  }

  // If topic IS matched but there are strong entertainment signals, apply extra penalty
  // Raised from 2 to 1 hit threshold — any entertainment + topic = suspicious
  if (matchesTopic && entHits >= 1) {
    score += CONTEXTUAL_PENALTY_MEDIUM;
    reasons.push('contextual:topic-but-ent');
  }

  // If no topic match at all AND no educational signals, force hide
  if (!matchesTopic && !isKnownEduChannel && eduHits === 0) {
    return buildResult(-50, false, strictMode, [...reasons, 'instant-hide:no-edu-signals']);
  }

  // ------------------------------------------------------------------
  // Decision logic
  // ------------------------------------------------------------------
  // Default bias: HIDE unless score is high enough
  const threshold = strictMode ? STRICT_SHOW_THRESHOLD : STANDARD_SHOW_THRESHOLD;

  debugLogSync('SCORER', {
    title: title.substring(0, 60),
    channel: channel.substring(0, 30),
    score,
    threshold,
    matchesTopic,
    isKnownEduChannel,
    reasons,
  });

  return buildResult(score, matchesTopic, strictMode, reasons);
}

function buildResult(
  score: number,
  matchesTopic: boolean,
  strictMode: boolean,
  reasons: string[],
): RelevanceScore {
  const threshold = strictMode ? STRICT_SHOW_THRESHOLD : STANDARD_SHOW_THRESHOLD;

  let finalDecision: 'show' | 'hide';
  let reason: string;

  if (score >= threshold) {
    finalDecision = 'show';
    reason = `score ${score} >= threshold ${threshold}`;
  } else {
    finalDecision = 'hide';
    reason = `score ${score} < threshold ${threshold} [${reasons.slice(0, 5).join(', ')}]`;
  }

  return { score, matchesTopic, finalDecision, reason };
}
