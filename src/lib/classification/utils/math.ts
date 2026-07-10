/** Clamps a number between min and max (inclusive) */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalizes a raw score to 0–100 given a saturation ceiling */
export function normalize(raw: number, saturation: number): number {
  return clamp((raw / saturation) * 100, 0, 100);
}

/**
 * Levenshtein edit distance between two strings.
 * Used for fuzzy matching in intent scoring.
 * Capped at maxDist for performance (returns Infinity if exceeded).
 */
export function levenshtein(a: string, b: string, maxDist = 3): number {
  if (Math.abs(a.length - b.length) > maxDist) return Infinity;
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
    // Early exit if current row min already exceeds maxDist
    if (Math.min(...dp) > maxDist) return Infinity;
  }
  return dp[n];
}
