import { ConfidenceLabel } from '../types';

/**
 * Converts a numeric confidence score (0–100) to a human-readable label.
 * Used in ClassificationResult.confidenceLabel for UI display.
 */
export function toConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 85) return 'VERY_HIGH';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 30) return 'LOW';
  return 'UNKNOWN';
}

/**
 * Computes a confidence score (0–100) for a classification decision.
 *
 * Confidence is high when:
 * - The winning side has a large margin over the losing side.
 * - Both educational and entertainment signals are present (not ambiguous).
 *
 * Confidence is low when:
 * - Both sides are balanced (genuinely mixed content).
 * - Both sides are near zero (no signals detected).
 */
export function computeConfidence(
  eduScore: number,
  entScore: number,
  topicScore: number,
  intentScore: number,
  negPenalty: number,
): number {
  const proScore = eduScore + topicScore + intentScore;
  const conScore = entScore + negPenalty;
  const total = proScore + conScore;

  if (total < 5) return 0; // insufficient signal

  const delta = Math.abs(proScore - conScore);
  // Confidence scales with the margin relative to total signal
  return Math.min(100, Math.round((delta / total) * 100));
}
