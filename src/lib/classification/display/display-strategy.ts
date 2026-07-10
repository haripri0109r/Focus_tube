/**
 * Display Strategy
 *
 * Reads a ClassificationResult and returns the appropriate DisplayTier.
 * Platform-agnostic — no DOM access here.
 *
 * Phase 1: Binary (NORMAL / HIDDEN based on decision)
 * Phase 2+: Tiered (PINNED / NORMAL / COLLAPSED / HIDDEN based on LP)
 */

import { ClassificationResult, DisplayTier, FeatureFlags } from '../types';

export class DisplayStrategy {
  resolve(result: ClassificationResult, flags: FeatureFlags): DisplayTier {
    if (!flags.enableDisplayTiers) {
      // Phase 1: simple binary
      return result.decision === 'BLOCK' ? 'HIDDEN' :
             result.decision === 'UNCERTAIN' ? 'HIDDEN' : 'NORMAL';
    }

    // Phase 2+: Learning Priority tiers
    const lp = result.learningPriority ?? 0;
    const profile = result.appliedProfile;

    if (lp >= 90) return 'PINNED';
    if (lp >= profile.collapseThreshold) return 'NORMAL';
    if (lp >= profile.hideThreshold) return 'COLLAPSED';
    return 'HIDDEN';
  }
}

/**
 * DOM Renderer — browser-specific
 *
 * Takes a DisplayAction (tier + element + result) and applies
 * the appropriate CSS / DOM transformations.
 */
export class DOMRenderer {
  apply(tier: DisplayTier, element: HTMLElement, result: ClassificationResult): void {
    // Reset any previous state
    element.removeAttribute('data-focustube-tier');

    switch (tier) {
      case 'PINNED':    this.pin(element, result);    break;
      case 'NORMAL':    this.show(element);            break;
      case 'COLLAPSED': this.collapse(element);        break;
      case 'HIDDEN':    this.hide(element);            break;
    }
  }

  private pin(el: HTMLElement, result: ClassificationResult): void {
    el.setAttribute('data-focustube-tier', 'pinned');
    el.setAttribute('data-focustube-hidden', 'false');
    el.style.removeProperty('display');
    el.style.removeProperty('opacity');
    el.style.removeProperty('max-height');
    // Inject badge if not already present
    if (!el.querySelector('.ft-pin-badge')) {
      const badge = document.createElement('div');
      badge.className = 'ft-pin-badge';
      badge.title = `FocusTube: Top Match (${result.confidence}% confidence)`;
      badge.textContent = '📚';
      badge.style.cssText = 'position:absolute;top:4px;left:4px;z-index:9999;font-size:18px;pointer-events:none;';
      el.style.position = 'relative';
      el.appendChild(badge);
    }
  }

  private show(el: HTMLElement): void {
    el.setAttribute('data-focustube-tier', 'normal');
    el.setAttribute('data-focustube-hidden', 'false');
    el.style.removeProperty('display');
    el.style.removeProperty('opacity');
    el.style.removeProperty('max-height');
    el.style.removeProperty('overflow');
  }

  private collapse(el: HTMLElement): void {
    el.setAttribute('data-focustube-tier', 'collapsed');
    el.setAttribute('data-focustube-hidden', 'false');
    el.style.removeProperty('display');
    el.style.setProperty('opacity', '0.45', 'important');
    el.style.setProperty('filter', 'grayscale(30%)', 'important');
    el.style.setProperty('transform', 'scale(0.97)', 'important');
    el.style.setProperty('transition', 'opacity 0.2s, filter 0.2s', 'important');
    // Attach hover to un-collapse
    el.addEventListener('mouseenter', () => {
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('filter', 'none', 'important');
    }, { once: false });
    el.addEventListener('mouseleave', () => {
      if (el.getAttribute('data-focustube-tier') === 'collapsed') {
        el.style.setProperty('opacity', '0.45', 'important');
        el.style.setProperty('filter', 'grayscale(30%)', 'important');
      }
    });
  }

  private hide(el: HTMLElement): void {
    el.setAttribute('data-focustube-tier', 'hidden');
    el.setAttribute('data-focustube-hidden', 'true');
    el.style.setProperty('display', 'none', 'important');
  }
}
