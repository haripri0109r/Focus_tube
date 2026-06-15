import { SessionState, UserPrefs, SessionRecord, AnalyticsData, DailyStats } from '../types';

export const getSessionKey = (tabId: number) => `session_${tabId}`;

export async function getSession(tabId: number): Promise<SessionState | null> {
  const key = getSessionKey(tabId);
  const data = await chrome.storage.local.get(key);
  return data[key] as SessionState || null;
}

export async function getPrefs(): Promise<UserPrefs> {
  const data = await chrome.storage.local.get('focustube_prefs');
  return (data.focustube_prefs as UserPrefs) || {
    alwaysOn: false, defaultTopic: '', defaultKeywords: [], careerPath: null,
    filterHome: true, filterSearch: true, filterSidebar: true, filterShorts: true
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const data = await chrome.storage.local.get('focustube_analytics');
  return (data.focustube_analytics as AnalyticsData) || { dailyStats: {} };
}

export async function recordDailyStats(
  deltaAllowed: number,
  deltaBlocked: number,
  topicName: string
): Promise<void> {
  const analytics = await getAnalytics();
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { allowed: 0, blocked: 0, topics: {} };
  }
  const day = analytics.dailyStats[today];

  // Additive — caller provides pre-computed deltas
  day.allowed += deltaAllowed;
  day.blocked += deltaBlocked;

  // Per-topic blocked count (supports multiple topics per day)
  if (topicName) {
    day.topics[topicName] = (day.topics[topicName] || 0) + deltaBlocked;
  }

  // Prune entries older than 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toLocaleDateString('en-CA');
  for (const key of Object.keys(analytics.dailyStats)) {
    if (key < cutoffStr) delete analytics.dailyStats[key];
  }

  await chrome.storage.local.set({ focustube_analytics: analytics });
}

