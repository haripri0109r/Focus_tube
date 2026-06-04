import { EDUCATIONAL_KEYWORDS, ENTERTAINMENT_KEYWORDS, EDUCATIONAL_CHANNELS } from './constants';

export interface RelevanceScore {
  score: number;
  isEducational: boolean;
  matchesTopic: boolean;
  finalDecision: 'show' | 'hide';
}

export function calculateRelevance(
  title: string,
  channel: string,
  ariaLabel: string,
  topicKeywords: string[]
): RelevanceScore {
  const cleanTitle = title.toLowerCase();
  const cleanChannel = channel.toLowerCase();
  const cleanAria = ariaLabel.toLowerCase();
  const fullText = `${cleanTitle} ${cleanChannel} ${cleanAria}`;

  let score = 0;
  let matchesTopic = false;

  // 1. Topic Match (Essential)
  // If the video doesn't match the user's specific topic at all, it's a weak candidate
  for (const keyword of topicKeywords) {
    if (fullText.includes(keyword.toLowerCase())) {
      score += 50;
      matchesTopic = true;
      break; 
    }
  }

  // 2. Educational Signals (Positive)
  for (const word of EDUCATIONAL_KEYWORDS) {
    if (fullText.includes(word)) {
      score += 15;
    }
  }

  // 3. Known Educational Channels (Strong Positive)
  for (const knownChannel of EDUCATIONAL_CHANNELS) {
    if (cleanChannel.includes(knownChannel)) {
      score += 40;
      break;
    }
  }

  // 4. Entertainment Signals (Negative)
  for (const word of ENTERTAINMENT_KEYWORDS) {
    if (fullText.includes(word)) {
      score -= 30;
    }
  }

  // 5. Contextual Penalties (e.g., specific combinations)
  if (cleanTitle.includes('reaction') && !cleanTitle.includes('chemical reaction')) {
    score -= 40;
  }
  
  if (cleanTitle.includes('official video') || cleanTitle.includes('official audio')) {
    score -= 50;
  }

  // Logic:
  // If it matches the topic AND (score > 30 OR high topic match score)
  // Or if it's a very strong educational match regardless of exact topic
  const isEducational = score > 20; 
  
  let finalDecision: 'show' | 'hide' = 'hide';
  
  // High confidence threshold for showing
  if (matchesTopic && score >= 40) {
    finalDecision = 'show';
  } else if (score >= 70) {
    // Very educational even if not exact topic match (e.g. general dev tips when searching for React)
    finalDecision = 'show';
  }

  return {
    score,
    isEducational,
    matchesTopic,
    finalDecision
  };
}
