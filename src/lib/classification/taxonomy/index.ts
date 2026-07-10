/**
 * Taxonomy Index
 *
 * Loads all category modules, flattens them into TaxonomyEntry arrays,
 * and compiles a single Aho-Corasick automaton for O(N) matching.
 *
 * This module is imported once at content-script startup. The compiled
 * automaton is reused for every video classification.
 */

import { TaxonomyEntry, TaxonomyCategoryModule } from '../types';
import { AhoCorasick } from '../matcher/aho-corasick';
import { TAXONOMY_VERSION } from './manifest';

// --- Education Modules ---
import computerScience from './education/computer-science';
import programming     from './education/programming';
import aiMl           from './education/ai-ml';
import mathematics     from './education/mathematics';
import cybersecurity   from './education/cybersecurity';
import cloudDevops     from './education/cloud-devops';
import finance         from './education/finance';
import examPrep        from './education/exam-prep';
import engineering     from './education/engineering';
import science         from './education/science';
import humanities      from './education/humanities';

// --- Entertainment Modules ---
import gaming          from './entertainment/gaming';
import music           from './entertainment/music';
import vlogs           from './entertainment/vlogs';
import movies          from './entertainment/movies';
import sports          from './entertainment/sports';
import clickbait       from './entertainment/clickbait';

const ALL_MODULES: TaxonomyCategoryModule[] = [
  // Education
  computerScience, programming, aiMl, mathematics, cybersecurity,
  cloudDevops, finance, examPrep, engineering, science, humanities,
  // Entertainment
  gaming, music, vlogs, movies, sports, clickbait,
];

/**
 * Flattens all category modules into a single array of TaxonomyEntry objects.
 */
function flattenModules(modules: TaxonomyCategoryModule[]): TaxonomyEntry[] {
  const entries: TaxonomyEntry[] = [];

  for (const mod of modules) {
    for (const [subtopicName, subtopic] of Object.entries(mod.subtopics)) {
      for (const keyword of subtopic.keywords) {
        entries.push({
          keyword: keyword.toLowerCase(),
          type: mod.type,
          category: mod.category,
          subtopic: subtopicName,
          weight: subtopic.weight,
        });
      }
    }
  }

  return entries;
}

// Compiled once at module load — shared across all classify() calls
let _compiled: AhoCorasick | null = null;
let _entries: TaxonomyEntry[] | null = null;

/**
 * Returns the compiled Aho-Corasick automaton.
 * Lazy-initialized on first call, then cached.
 */
export function getCompiledTaxonomy(): AhoCorasick {
  if (!_compiled) {
    _entries = flattenModules(ALL_MODULES);
    _compiled = new AhoCorasick(_entries);
  }
  return _compiled;
}

/**
 * Returns the raw taxonomy entries (useful for debugging / stats).
 */
export function getTaxonomyEntries(): TaxonomyEntry[] {
  if (!_entries) { getCompiledTaxonomy(); }
  return _entries!;
}

export { TAXONOMY_VERSION };
