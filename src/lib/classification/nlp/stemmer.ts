/**
 * Porter Stemmer (Simplified)
 *
 * Reduces words to their root form so that "Algorithm", "Algorithms",
 * and "Algorithmic" all produce the same stem token.
 *
 * This is a condensed Porter Stemmer implementation with the most
 * impactful rules, optimized for English technical vocabulary.
 * It has zero external dependencies.
 */

export class PorterStemmer {
  /**
   * Returns the stem of a word.
   * Assumes input is already lowercased.
   */
  stem(word: string): string {
    if (word.length <= 2) return word;

    word = this.step1a(word);
    word = this.step1b(word);
    word = this.step1c(word);
    word = this.step2(word);
    word = this.step3(word);
    word = this.step4(word);
    word = this.step5(word);

    return word;
  }

  private hasCVC(str: string): boolean {
    const vowel = /[aeiou]/;
    if (str.length < 3) return false;
    const end = str.slice(-3);
    return !vowel.test(end[0]) && vowel.test(end[1]) && !vowel.test(end[2])
      && end[2] !== 'w' && end[2] !== 'x' && end[2] !== 'y';
  }

  private hasVowel(str: string): boolean {
    return /[aeiou]/.test(str);
  }

  private measure(str: string): number {
    // Count VC sequences (simplified)
    let count = 0;
    let inVowel = false;
    for (const ch of str) {
      const isV = /[aeiou]/.test(ch);
      if (!isV && inVowel) { count++; inVowel = false; }
      else if (isV) inVowel = true;
    }
    return count;
  }

  private step1a(word: string): string {
    if (word.endsWith('sses')) return word.slice(0, -2);
    if (word.endsWith('ies')) return word.slice(0, -2);
    if (word.endsWith('ss')) return word;
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }

  private step1b(word: string): string {
    if (word.endsWith('eed')) {
      const stem = word.slice(0, -3);
      if (this.measure(stem) > 0) return stem + 'ee';
      return word;
    }
    if (word.endsWith('ed')) {
      const stem = word.slice(0, -2);
      if (this.hasVowel(stem)) return this.step1bFix(stem);
    }
    if (word.endsWith('ing')) {
      const stem = word.slice(0, -3);
      if (this.hasVowel(stem)) return this.step1bFix(stem);
    }
    return word;
  }

  private step1bFix(word: string): string {
    if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) return word + 'e';
    if (/([^aeiouylsz])\1$/.test(word)) return word.slice(0, -1);
    if (this.measure(word) === 1 && this.hasCVC(word)) return word + 'e';
    return word;
  }

  private step1c(word: string): string {
    if (word.endsWith('y') && this.hasVowel(word.slice(0, -1))) {
      return word.slice(0, -1) + 'i';
    }
    return word;
  }

  private step2(word: string): string {
    const replacements: [string, string][] = [
      ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
      ['izer', 'ize'], ['abli', 'able'], ['alli', 'al'], ['entli', 'ent'],
      ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
      ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
      ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble'],
    ];
    for (const [suffix, replacement] of replacements) {
      if (word.endsWith(suffix)) {
        const stem = word.slice(0, -suffix.length);
        if (this.measure(stem) > 0) return stem + replacement;
      }
    }
    return word;
  }

  private step3(word: string): string {
    const replacements: [string, string][] = [
      ['icate', 'ic'], ['ative', ''], ['alize', 'al'], ['iciti', 'ic'],
      ['ical', 'ic'], ['ful', ''], ['ness', ''],
    ];
    for (const [suffix, replacement] of replacements) {
      if (word.endsWith(suffix)) {
        const stem = word.slice(0, -suffix.length);
        if (this.measure(stem) > 0) return stem + replacement;
      }
    }
    return word;
  }

  private step4(word: string): string {
    const suffixes = [
      'ement', 'ment', 'ance', 'ence', 'able', 'ible', 'ant', 'ent',
      'ion', 'ism', 'ate', 'iti', 'ous', 'ive', 'ize', 'al', 'er', 'ic',
    ];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix)) {
        const stem = word.slice(0, -suffix.length);
        if (this.measure(stem) > 1) {
          // For 'ion', stem must end in 's' or 't'
          if (suffix === 'ion' && !stem.endsWith('s') && !stem.endsWith('t')) continue;
          return stem;
        }
      }
    }
    return word;
  }

  private step5(word: string): string {
    if (word.endsWith('e')) {
      const stem = word.slice(0, -1);
      const m = this.measure(stem);
      if (m > 1 || (m === 1 && !this.hasCVC(stem))) return stem;
    }
    if (word.endsWith('ll') && this.measure(word.slice(0, -1)) > 1) {
      return word.slice(0, -1);
    }
    return word;
  }
}
