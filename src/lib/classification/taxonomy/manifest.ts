/**
 * Taxonomy Manifest
 *
 * Metadata about the current taxonomy build.
 * The version is embedded in every ClassificationResult and every cache key.
 * Incrementing this version automatically invalidates all cached results.
 */

export interface TaxonomyManifest {
  version: string;
  releaseDate: string;
  eduCategoryCount: number;
  entCategoryCount: number;
  estimatedKeywordCount: number;
  changelog: string;
}

export const TAXONOMY_VERSION = '1.0.0';

export const manifest: TaxonomyManifest = {
  version: TAXONOMY_VERSION,
  releaseDate: '2025-07-10',
  eduCategoryCount: 9,
  entCategoryCount: 5,
  estimatedKeywordCount: 4500,
  changelog: 'Initial production taxonomy — Phase 1 release',
};
