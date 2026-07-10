/**
 * Whitespace Tokenizer
 *
 * Splits normalized text into individual word tokens.
 * Strips punctuation and filters out very short or stop tokens.
 *
 * Kept deliberately simple — the Aho-Corasick handles phrase matching;
 * the tokenizer only needs to produce single-word stems for intent scoring.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your',
  'his', 'her', 'its', 'our', 'their', 'not', 'no', 'so', 'if', 'as',
]);

export class Tokenizer {
  tokenize(text: string): string[] {
    return text
      .split(/[\s\-_/|]+/)              // split on whitespace and common separators
      .map(w => w.replace(/[^\w]/g, '')) // strip remaining punctuation
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w)); // remove stops + tiny tokens
  }
}
