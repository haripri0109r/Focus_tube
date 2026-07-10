/**
 * Classification Engine — 6-Stage Pipeline
 *
 * Stage 1: Extract metadata from DOM element
 * Stage 2: Check tiered cache
 * Stage 3: Normalize text (NLP pipeline)
 * Stage 4: Run all enabled ClassificationModules
 * Stage 5: Aggregate module results → scores → decision
 * Stage 6: Build ClassificationResult with explainability
 *
 * The engine is platform-agnostic. Only the MetadataExtractor is
 * browser-specific. The engine itself can run in Node.js for tests.
 */

import {
  ClassificationModule, ClassificationResult, ClassificationVideoMetadata,
  ComponentScores, NegativeSignals, NormalizedMetadata, ScoringProfile,
  SessionContext, ModuleResult, ContentCategory, FeatureFlags,
  ClassificationDecision,
} from '../types';
import { normalize as normalizeMeta } from '../nlp/normalizer';
import { TieredCache } from '../cache/tiered-cache';
import { toConfidenceLabel, computeConfidence } from '../utils/confidence';
import { clamp } from '../utils/math';
import { hashString } from '../utils/hash';
import { EngineVersions } from '../version';
import { TAXONOMY_VERSION } from '../taxonomy/manifest';

export class ClassificationEngine {
  private cache = new TieredCache();
  private modules: ClassificationModule[] = [];

  constructor(modules: ClassificationModule[]) {
    this.modules = modules;
  }

  registerModule(module: ClassificationModule): void {
    this.modules.push(module);
  }

  /**
   * Main classification entry point.
   * Classifies a single video's metadata against the current session context.
   */
  classify(
    rawMeta: ClassificationVideoMetadata,
    context: SessionContext,
  ): ClassificationResult {
    const cacheKey = this.cache.buildKey(rawMeta, {
      taxonomyVersion: TAXONOMY_VERSION,
      classifierVersion: EngineVersions.classifier,
      profileId: context.activeProfile.id,
      topic: context.topic,
      flagsHash: hashString(JSON.stringify(context.flags)),
    });

    // Stage 2: Cache lookup
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Stage 3: Normalize
    const normalized = normalizeMeta(rawMeta);

    // Stage 4: Run modules
    const enabledModules = this.modules.filter(
      m => m.featureFlag === null || context.flags[m.featureFlag] !== false
    );
    const moduleResults = enabledModules.map(m => m.evaluate(normalized, context));

    // Stage 5: Aggregate
    const { scores, decision, negativeSignals } = this.aggregate(moduleResults, context.activeProfile);

    // Stage 6: Build result
    const confidence = computeConfidence(
      scores.educational, scores.entertainment,
      scores.topic, scores.intent, scores.negativePenalty,
    );

    const allEduKeywords = moduleResults
      .filter(r => r.moduleId === 'edu-scorer')
      .flatMap(r => r.matchedKeywords ?? []);

    const allEntKeywords = moduleResults
      .filter(r => r.moduleId === 'ent-scorer')
      .flatMap(r => r.matchedKeywords ?? []);

    const allTopicSynonyms = moduleResults
      .filter(r => r.moduleId === 'intent-scorer')
      .flatMap(r => r.matchedKeywords ?? []);

    const allCategories = [
      ...moduleResults.filter(r => r.moduleId === 'edu-scorer').flatMap(r => r.matchedCategories ?? []),
      ...moduleResults.filter(r => r.moduleId === 'ent-scorer').flatMap(r => r.matchedCategories ?? []),
    ] as ContentCategory[];

    const reasons = this.buildReasons(scores, decision, context, negativeSignals, moduleResults);

    const result: ClassificationResult = {
      decision,
      confidence,
      confidenceLabel: toConfidenceLabel(confidence),
      scores,
      moduleResults,
      detectedCategories: [...new Set(allCategories)],
      matchedEduKeywords: allEduKeywords,
      matchedEntKeywords: allEntKeywords,
      matchedTopicSynonyms: allTopicSynonyms,
      negativeSignals,
      reasons,
      appliedProfile: context.activeProfile,
      taxonomyVersion: TAXONOMY_VERSION,
      classifierVersion: EngineVersions.classifier,
      timestamp: Date.now(),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  private aggregate(
    moduleResults: ModuleResult[],
    profile: ScoringProfile,
  ): { scores: ComponentScores; decision: ClassificationDecision; negativeSignals: NegativeSignals } {
    const edu = moduleResults.find(r => r.moduleId === 'edu-scorer')?.score ?? 0;
    const ent = moduleResults.find(r => r.moduleId === 'ent-scorer')?.score ?? 0;
    const topic = moduleResults.find(r => r.moduleId === 'topic-matcher')?.score ?? 0;
    const intent = moduleResults.find(r => r.moduleId === 'intent-scorer')?.score ?? 0;
    const negModule = moduleResults.find(r => r.moduleId === 'negative-detector');
    const negPenalty = negModule?.score ?? 0;

    const negSignals: NegativeSignals = (negModule?.metadata as unknown as NegativeSignals) ?? {
      capsRatio: 0, exclCount: 0, clickbaitHits: [], totalPenalty: 0,
    };

    // Phase 1 formula: net score (each component normalized 0–100)
    // pro signals - con signals
    const netScore = (edu * 0.40) + (topic * 0.35) + (intent * 0.15) - (ent * 0.40) - (negPenalty * 0.50);
    const finalScore = clamp(netScore, -100, 100);

    let decision: ClassificationDecision;
    if (finalScore >= profile.allowThreshold) {
      decision = 'ALLOW';
    } else if (finalScore <= profile.blockThreshold) {
      decision = 'BLOCK';
    } else {
      decision = 'UNCERTAIN';
    }

    const scores: ComponentScores = {
      educational: edu,
      entertainment: ent,
      topic,
      intent,
      negativePenalty: negPenalty,
      final: finalScore,
    };

    return { scores, decision, negativeSignals: negSignals };
  }

  private buildReasons(
    scores: ComponentScores,
    decision: ClassificationDecision,
    ctx: SessionContext,
    neg: NegativeSignals,
    moduleResults: ModuleResult[],
  ): string[] {
    const reasons: string[] = [];

    // Decision summary
    reasons.push(`Decision: ${decision} — Final score: ${scores.final.toFixed(1)} (profile: ${ctx.activeProfile.name})`);

    // Module-level reasons
    for (const mod of moduleResults) {
      if (mod.reasons) reasons.push(...mod.reasons);
    }

    // Negative signals summary
    if (neg.totalPenalty > 0) {
      reasons.push(`Negative penalty applied: ${neg.totalPenalty.toFixed(1)} pts`);
    }

    // Formula breakdown
    reasons.push(
      `Formula: ${scores.educational.toFixed(0)}×0.40 edu + ${scores.topic.toFixed(0)}×0.35 topic + ${scores.intent.toFixed(0)}×0.15 intent - ${scores.entertainment.toFixed(0)}×0.40 ent - ${scores.negativePenalty.toFixed(0)}×0.50 neg = ${scores.final.toFixed(1)}`
    );

    return reasons;
  }

  /** Warms the L1 cache from storage on startup */
  async warmCache(): Promise<void> {
    await this.cache.warmFromStorage();
  }

  /** Clears L1 cache (e.g. when topic changes) */
  invalidateCache(): void {
    this.cache.invalidateMemory();
  }
}
