import { calculateRelevance } from './relevance/scorer';

export function shouldHide(title: string, channel: string, ariaLabel: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;
  
  const textContent = `${title} ${channel} ${ariaLabel}`.toLowerCase();
  
  // if completely empty, be permissive and show (maybe a parsing error)
  if (!textContent.trim()) return false;
  
  const relevance = calculateRelevance(title, channel, ariaLabel, keywords);
  
  return relevance.finalDecision === 'hide';
}
