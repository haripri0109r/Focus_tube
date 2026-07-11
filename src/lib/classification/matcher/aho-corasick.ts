/**
 * Aho-Corasick Multi-Pattern Matcher
 *
 * Compiles a set of string patterns into a finite state machine (trie with
 * failure links). After compilation, any input text can be searched in O(N)
 * time — regardless of the number of patterns.
 *
 * This replaces all per-keyword `.includes()` loops in the old scorer,
 * reducing hot-path complexity from O(K × N) to O(N).
 *
 * Usage:
 *   const ac = new AhoCorasick(patterns);
 *   const hits = ac.search(text);  // returns all matched patterns with positions
 */

import { TaxonomyEntry, TaxonomyHit } from '../types';

interface AhoNode {
  children: Map<string, AhoNode>;
  fail: AhoNode | null;
  outputs: TaxonomyEntry[];
  isRoot: boolean;
}

function makeNode(isRoot = false): AhoNode {
  return { children: new Map(), fail: null, outputs: [], isRoot };
}

export class AhoCorasick {
  private root: AhoNode;
  private compiled = false;

  constructor(entries: TaxonomyEntry[]) {
    this.root = makeNode(true);
    for (const entry of entries) {
      this.insert(entry);
    }
    this.buildFailureLinks();
    this.compiled = true;
  }

  private insert(entry: TaxonomyEntry): void {
    let node = this.root;
    for (const ch of entry.keyword) {
      if (!node.children.has(ch)) {
        node.children.set(ch, makeNode());
      }
      node = node.children.get(ch)!;
    }
    node.outputs.push(entry);
  }

  private buildFailureLinks(): void {
    const queue: AhoNode[] = [];

    // All depth-1 nodes fail to root
    for (const child of this.root.children.values()) {
      child.fail = this.root;
      queue.push(child);
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;

      for (const [ch, child] of curr.children) {
        // Find failure link for child
        let failNode = curr.fail;
        while (failNode && !failNode.children.has(ch) && !failNode.isRoot) {
          failNode = failNode.fail;
        }

        child.fail = (failNode?.children.get(ch) ?? this.root);
        if (child.fail === child) child.fail = this.root; // avoid self-loop

        // Inherit outputs from failure node (dictionary suffix links)
        child.outputs = [...child.outputs, ...(child.fail?.outputs ?? [])];

        queue.push(child);
      }
    }
  }

  /**
   * Searches the text for all taxonomy patterns in O(N) time.
   * Returns every match with position, weight, and category metadata.
   */
  search(text: string): TaxonomyHit[] {
    if (!this.compiled) throw new Error('AhoCorasick not compiled');

    const hits: TaxonomyHit[] = [];
    let node = this.root;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      // Follow failure links until we find a transition or reach root
      while (!node.children.has(ch) && !node.isRoot) {
        node = node.fail!;
      }

      if (node.children.has(ch)) {
        node = node.children.get(ch)!;
      }

      // Collect all outputs at this node
      for (const entry of node.outputs) {
        const start = i - entry.keyword.length + 1;
        const end = i + 1;
        
        // Word boundary validation on the left (only if first char is alphanumeric)
        if (entry.keyword.length > 0 && /\w/.test(entry.keyword[0])) {
          if (start > 0 && /\w/.test(text[start - 1])) {
            continue; // Skip: not a word boundary on the left
          }
        }
        
        // Word boundary validation on the right (only if last char is alphanumeric)
        if (entry.keyword.length > 0 && /\w/.test(entry.keyword[entry.keyword.length - 1])) {
          if (end < text.length && /\w/.test(text[end])) {
            continue; // Skip: not a word boundary on the right
          }
        }

        hits.push({
          keyword: entry.keyword,
          type: entry.type,
          category: entry.category,
          subtopic: entry.subtopic,
          weight: entry.weight,
          position: start,
        });
      }
    }

    return hits;
  }
}
