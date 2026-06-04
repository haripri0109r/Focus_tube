import seedData from '../data/keyword-seeds.json';

export async function expandKeywords(topic: string): Promise<string[]> {
  const seeds = seedData as Record<string, string[]>;
  let result: string[] = [];
  
  for (const [key, keywords] of Object.entries(seeds)) {
    if (topic.toLowerCase() === key.toLowerCase()) {
      result = [...keywords];
      break;
    }
  }
  
  // also get from user defined focustube_keywords
  try {
    const data = await chrome.storage.local.get('focustube_keywords');
    if (data.focustube_keywords && data.focustube_keywords[topic]) {
      result = Array.from(new Set([...result, ...data.focustube_keywords[topic]]));
    }
  } catch (err) {
    // ignore storage errors here
  }
  
  if (result.length === 0) {
    result = [topic.toLowerCase()];
  }
  
  return result;
}
