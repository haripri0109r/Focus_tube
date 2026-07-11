/**
 * All five scoring modules in a single file for Phase 1.
 * Each module implements ClassificationModule and is independently testable.
 *
 * Modules:
 *   1. EduScorerModule      — educational taxonomy matching
 *   2. EntScorerModule      — entertainment taxonomy matching
 *   3. TopicMatcherModule   — direct topic keyword matching
 *   4. IntentScorerModule   — stemmed + synonym-expanded intent
 *   5. NegativeDetectorModule — clickbait / caps / exclamation penalties
 */

import {
  ClassificationModule, ModuleResult, NormalizedMetadata, SessionContext, NegativeSignals,
} from '../types';
import { getCompiledTaxonomy } from '../taxonomy';
import { getTopicSynonyms } from '../nlp/topic-synonyms';
import { PorterStemmer } from '../nlp/stemmer';
import { levenshtein, clamp, normalize } from '../utils/math';

// Saturation values: raw scores at or above these are capped at 100
const EDU_SATURATION  = 200;
const ENT_SATURATION  = 200;
const TOPIC_SATURATION = 150;
const INTENT_SATURATION = 150;

// ============================================================================
// 1. Educational Scorer
// ============================================================================
export class EduScorerModule implements ClassificationModule {
  readonly id = 'edu-scorer';
  readonly version = '1.0.0';
  readonly phase = 1 as const;
  readonly featureFlag = null;

  evaluate(meta: NormalizedMetadata, _ctx: SessionContext): ModuleResult {
    const ac = getCompiledTaxonomy();
    const hits = ac.search(meta.normalizedText).filter(h => h.type === 'EDU');

    let rawScore = 0;
    const matchedKeywords: string[] = [];
    const matchedCategories = new Set<string>();

    for (const hit of hits) {
      rawScore += hit.weight;
      matchedKeywords.push(hit.keyword);
      matchedCategories.add(hit.category);
    }

    const score = normalize(rawScore, EDU_SATURATION);

    return {
      moduleId: this.id,
      moduleVersion: this.version,
      score,
      weight: 1.0,
      matchedKeywords: [...new Set(matchedKeywords)].slice(0, 15),
      matchedCategories: [...matchedCategories] as any,
      reasons: score > 0
        ? [`Educational signals (${score.toFixed(0)}): ${[...new Set(matchedKeywords)].slice(0, 5).join(', ')}`]
        : ['No educational signals detected'],
    };
  }
}

// ============================================================================
// 2. Entertainment Scorer
// ============================================================================
export class EntScorerModule implements ClassificationModule {
  readonly id = 'ent-scorer';
  readonly version = '1.0.0';
  readonly phase = 1 as const;
  readonly featureFlag = null;

  evaluate(meta: NormalizedMetadata, _ctx: SessionContext): ModuleResult {
    const ac = getCompiledTaxonomy();
    const hits = ac.search(meta.normalizedText).filter(h => h.type === 'ENT');

    let rawScore = 0;
    const matchedKeywords: string[] = [];
    const matchedCategories = new Set<string>();

    for (const hit of hits) {
      rawScore += hit.weight;
      matchedKeywords.push(hit.keyword);
      matchedCategories.add(hit.category);
    }

    const score = normalize(rawScore, ENT_SATURATION);

    return {
      moduleId: this.id,
      moduleVersion: this.version,
      score,
      weight: 1.0,
      matchedKeywords: [...new Set(matchedKeywords)].slice(0, 15),
      matchedCategories: [...matchedCategories] as any,
      reasons: score > 0
        ? [`Entertainment signals (${score.toFixed(0)}): ${[...new Set(matchedKeywords)].slice(0, 5).join(', ')}`]
        : ['No entertainment signals detected'],
    };
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function containsWord(text: string, word: string): boolean {
  const escaped = escapeRegExp(word);
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function containsPrefixWord(text: string, prefix: string): boolean {
  const escaped = escapeRegExp(prefix);
  return new RegExp(`\\b${escaped}`, 'i').test(text);
}

// ============================================================================
// 3. Topic Matcher
// ============================================================================
export class TopicMatcherModule implements ClassificationModule {
  readonly id = 'topic-matcher';
  readonly version = '1.0.0';
  readonly phase = 1 as const;
  readonly featureFlag = null;

  evaluate(meta: NormalizedMetadata, ctx: SessionContext): ModuleResult {
    const { keywords, topic } = ctx;
    const text = meta.normalizedText;
    let rawScore = 0;
    const matched: string[] = [];

    // Direct keyword matches (from user's session keyword list)
    for (const kw of keywords) {
      const lk = kw.toLowerCase().trim();
      if (!lk) continue;

      if (containsWord(text, lk)) {
        rawScore += 50;
        matched.push(lk);
      } else if (lk.length >= 4) {
        const slice = lk.slice(0, -1);
        if (containsPrefixWord(text, slice)) {
          rawScore += 25;
          matched.push(`~${lk}`);
        }
      }
    }

    // Also try direct topic string match
    if (topic) {
      const lTopic = topic.toLowerCase().trim();
      if (lTopic && containsWord(text, lTopic)) {
        rawScore += 40;
        matched.push(lTopic);
      }
    }

    const score = normalize(rawScore, TOPIC_SATURATION);

    return {
      moduleId: this.id,
      moduleVersion: this.version,
      score,
      weight: 1.0,
      matchedKeywords: [...new Set(matched)],
      reasons: score > 0
        ? [`Topic match (${score.toFixed(0)}): "${[...new Set(matched)].join('", "')}" found in metadata`]
        : [`No match for topic "${topic}"`],
    };
  }
}

// ============================================================================
// 4. Intent Scorer
// ============================================================================
const stemmer = new PorterStemmer();

export class IntentScorerModule implements ClassificationModule {
  readonly id = 'intent-scorer';
  readonly version = '1.0.0';
  readonly phase = 1 as const;
  readonly featureFlag = null;

  evaluate(meta: NormalizedMetadata, ctx: SessionContext): ModuleResult {
    const synonyms = getTopicSynonyms(ctx.topic);
    const synonymStems = synonyms.map(s => stemmer.stem(s.toLowerCase()));
    const videoStems = meta.tokens; // already stemmed by normalizer

    let rawScore = 0;
    const matched: string[] = [];

    for (const vStem of videoStems) {
      for (let i = 0; i < synonymStems.length; i++) {
        const sStem = synonymStems[i];
        if (vStem === sStem) {
          rawScore += 15;  // exact stem match
          matched.push(synonyms[i]);
          break;
        }
        if (vStem.startsWith(sStem) || sStem.startsWith(vStem)) {
          rawScore += 8;   // partial match
          matched.push(`~${synonyms[i]}`);
          break;
        }
        if (levenshtein(vStem, sStem, 2) <= 2) {
          rawScore += 4;   // fuzzy match (typo tolerance)
          matched.push(`≈${synonyms[i]}`);
          break;
        }
      }
    }

    const score = normalize(rawScore, INTENT_SATURATION);

    return {
      moduleId: this.id,
      moduleVersion: this.version,
      score,
      weight: 1.0,
      matchedKeywords: [...new Set(matched)].slice(0, 10),
      reasons: score > 0
        ? [`Intent match (${score.toFixed(0)}): synonym hits: ${[...new Set(matched)].slice(0, 5).join(', ')}`]
        : [`Low intent — few synonym hits for "${ctx.topic}"`],
    };
  }
}

// ============================================================================
// 5. Negative Signal Detector
// ============================================================================
const CLICKBAIT_PATTERNS: string[] = [
  'omg','shocking','you won\'t believe','insane','impossible','gone wrong',
  'must watch','watch till end','don\'t skip','wait for it','last to leave',
  'i can\'t believe','emotional','actually happened','exposing','exposed',
  'truth revealed','secret revealed','gone viral','breaking news','urgent',
  'warning','must see','jaw dropping','unbelievable','mind blowing','mindblowing',
  'extreme challenge','viral challenge','tiktok challenge','worlds biggest',
  'i survived','spending 24 hours','24 hours in','best in the world',
  'never been done','nobody has ever','first time ever','changed my life',
  'they said it was impossible','police called','ambulance called',
];

export class NegativeDetectorModule implements ClassificationModule {
  readonly id = 'negative-detector';
  readonly version = '1.0.0';
  readonly phase = 1 as const;
  readonly featureFlag = null;

  evaluate(meta: NormalizedMetadata, _ctx: SessionContext): ModuleResult {
    const lowerTitle = meta.title.toLowerCase();
    const clickbaitHits = CLICKBAIT_PATTERNS.filter(p => lowerTitle.includes(p));

    let penalty = 0;
    penalty += Math.min(meta.capsRatio * 40, 15);         // caps: up to 15pts
    penalty += Math.min(meta.exclCount * 3, 10);          // exclamation: up to 10pts
    penalty += Math.min(clickbaitHits.length * 5, 15);    // clickbait: up to 15pts
    penalty = Math.min(penalty, 40);                       // hard cap at 40

    const signals: NegativeSignals = {
      capsRatio: meta.capsRatio,
      exclCount: meta.exclCount,
      clickbaitHits,
      totalPenalty: penalty,
    };

    const reasons: string[] = [];
    if (meta.capsRatio > 0.5) reasons.push(`High ALL-CAPS ratio: ${(meta.capsRatio * 100).toFixed(0)}%`);
    if (meta.exclCount > 1) reasons.push(`Excessive exclamation marks: ${meta.exclCount}`);
    if (clickbaitHits.length > 0) reasons.push(`Clickbait patterns: "${clickbaitHits.slice(0, 3).join('", "')}"`);

    return {
      moduleId: this.id,
      moduleVersion: this.version,
      score: penalty,  // higher = more negative (penalty applied in aggregator)
      weight: 1.0,
      reasons: reasons.length > 0 ? reasons : ['No negative signals detected'],
      metadata: signals as unknown as Record<string, unknown>,
    };
  }
}
