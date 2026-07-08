import seedData from '../data/keyword-seeds.json';
import { TOPIC_SYNONYM_MAP } from '../lib/relevance/constants';

/**
 * Expands a user-typed topic into a rich set of search keywords.
 *
 * Strategy:
 * 1. Exact match against built-in seed data (keyword-seeds.json)
 * 2. Partial/substring match against seed keys
 * 3. Synonym expansion via TOPIC_SYNONYM_MAP
 * 4. User-defined custom keywords from storage
 * 5. Fallback: the topic itself as a single keyword
 *
 * All keywords are lowercased and deduplicated.
 */
export async function expandKeywords(topic: string): Promise<string[]> {
  if (!topic?.trim()) return [];

  const seeds = seedData as Record<string, string[]>;
  const topicLower = topic.toLowerCase().trim();
  const result = new Set<string>();

  // 1. Exact match in seed data (case-insensitive)
  for (const [key, keywords] of Object.entries(seeds)) {
    if (topicLower === key.toLowerCase()) {
      keywords.forEach(k => result.add(k.toLowerCase()));
      break;
    }
  }

  // 2. Partial match in seed data — topic contains key OR key contains topic
  if (result.size === 0) {
    for (const [key, keywords] of Object.entries(seeds)) {
      const keyLower = key.toLowerCase();
      if (topicLower.includes(keyLower) || keyLower.includes(topicLower)) {
        keywords.forEach(k => result.add(k.toLowerCase()));
      }
    }
  }

  // 3. Synonym map expansion — exact and partial
  for (const [mapKey, synonyms] of Object.entries(TOPIC_SYNONYM_MAP)) {
    const mapKeyLower = mapKey.toLowerCase();
    if (
      topicLower === mapKeyLower ||
      topicLower.includes(mapKeyLower) ||
      mapKeyLower.includes(topicLower)
    ) {
      synonyms.forEach(s => result.add(s.toLowerCase()));
    }
  }

  // Also check if the topic matches any of the synonym values
  for (const [mapKey, synonyms] of Object.entries(TOPIC_SYNONYM_MAP)) {
    for (const syn of synonyms) {
      if (topicLower === syn.toLowerCase()) {
        // Add the parent key's full expansion
        const parentExpanded = TOPIC_SYNONYM_MAP[mapKey];
        if (parentExpanded) parentExpanded.forEach(s => result.add(s.toLowerCase()));
        // Also add the seed data for the parent key
        for (const [seedKey, keywords] of Object.entries(seeds)) {
          if (seedKey.toLowerCase() === mapKey.toLowerCase()) {
            keywords.forEach(k => result.add(k.toLowerCase()));
          }
        }
        break;
      }
    }
  }

  // 4. User-defined custom keywords from storage
  try {
    const data = await chrome.storage.local.get('focustube_keywords');
    if (data.focustube_keywords && data.focustube_keywords[topic]) {
      const custom = data.focustube_keywords[topic] as string[];
      custom.forEach(k => result.add(k.toLowerCase()));
    }
    // Also check case-insensitive custom keywords
    if (data.focustube_keywords) {
      for (const [key, keywords] of Object.entries(data.focustube_keywords as Record<string, string[]>)) {
        if (key.toLowerCase() === topicLower) {
          keywords.forEach(k => result.add(k.toLowerCase()));
        }
      }
    }
  } catch {
    // Storage errors are non-fatal
  }

  // 5. Always include the topic itself as a fallback keyword
  result.add(topicLower);

  // Also add the topic split by spaces as individual words (if multi-word)
  if (topicLower.includes(' ')) {
    topicLower.split(' ').filter(w => w.length >= 3).forEach(w => result.add(w));
  }

  return Array.from(result);
}
