/**
 * Text Normalizer
 *
 * Converts raw video metadata into a clean, lowercased string
 * suitable for Aho-Corasick matching and stem comparison.
 *
 * Also detects negative signals (caps ratio, exclamation marks)
 * before any taxonomy-based scoring occurs.
 */

import { ClassificationVideoMetadata, NormalizedMetadata } from '../types';
import { Tokenizer } from './tokenizer';
import { PorterStemmer } from './stemmer';

const tokenizer = new Tokenizer();
const stemmer = new PorterStemmer();

const EMOJI_REGEX = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
const PUNCTUATION_REGEX = /[^\w\s]/g;

/**
 * Normalizes all available video metadata into a single
 * searchable string and pre-computed token/stem arrays.
 */
export function normalize(meta: ClassificationVideoMetadata): NormalizedMetadata {
  const originalTitle = meta.title ?? '';
  const channel = meta.channel ?? '';
  const description = meta.description ?? '';
  const tags = meta.tags ?? [];
  const hashtags = meta.hashtags ?? [];
  const autoTopics = meta.autoTopics ?? [];
  const accessibilityLabel = meta.accessibilityLabel ?? '';

  // --- Negative signal detection (on raw title before lowercasing) ---
  const exclCount = (originalTitle.match(/!/g) ?? []).length;
  const alphaChars = originalTitle.replace(/[^a-zA-Z]/g, '');
  const upperChars = originalTitle.replace(/[^A-Z]/g, '');
  const capsRatio = alphaChars.length > 0 ? upperChars.length / alphaChars.length : 0;

  // --- Build combined text for matching ---
  // Priority order: title → channel → tags → hashtags → auto-topics → description (truncated)
  const parts = [
    originalTitle,
    channel,
    ...tags,
    ...hashtags,
    ...autoTopics,
    accessibilityLabel,
    description.substring(0, 300), // limit description to first 300 chars
  ];

  const combined = parts.join(' ');

  // --- Normalize ---
  const lowered = combined.toLowerCase();
  const emojiStripped = lowered.replace(EMOJI_REGEX, ' ');
  const normalizedText = emojiStripped.replace(/\s+/g, ' ').trim();

  // --- Tokenize and stem ---
  const rawTokens = tokenizer.tokenize(normalizedText);
  const tokens = rawTokens.map(t => stemmer.stem(t));

  return {
    normalizedText,
    title: originalTitle,
    channel,
    tags,
    tokens,
    capsRatio,
    exclCount,
    wordCount: rawTokens.length,
  };
}
