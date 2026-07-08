import { SessionState, UserPrefs, SessionRecord, AnalyticsData, DailyStats } from '../types';

export const getSessionKey = (tabId: number) => `session_${tabId}`;

export async function getSession(tabId: number): Promise<SessionState | null> {
  const key = getSessionKey(tabId);
  const data = await chrome.storage.local.get(key);
  return (data[key] as SessionState) || null;
}

export async function getPrefs(): Promise<UserPrefs> {
  const data = await chrome.storage.local.get('focustube_prefs');
  return (data.focustube_prefs as UserPrefs) || {
    alwaysOn: false,
    defaultTopic: '',
    defaultKeywords: [],
    careerPath: null,
    filterHome: true,
    filterSearch: true,
    filterSidebar: true,
    filterShorts: true,
    strictMode: false,
  };
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const data = await chrome.storage.local.get('focustube_analytics');
  return (data.focustube_analytics as AnalyticsData) || { dailyStats: {} };
}

/**
 * Records incremental stats for the current day.
 * @param deltaAllowed  - Number of new videos allowed since last flush
 * @param deltaBlocked  - Number of new videos blocked since last flush
 * @param topicName     - The active learning topic name
 * @param deltaShorts   - Number of Shorts blocked since last flush
 */
export async function recordDailyStats(
  deltaAllowed: number,
  deltaBlocked: number,
  topicName: string,
  deltaShorts = 0,
): Promise<void> {
  const analytics = await getAnalytics();
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { allowed: 0, blocked: 0, shortsBlocked: 0, topics: {} };
  }
  const day = analytics.dailyStats[today];

  // Migrate old records that don't have shortsBlocked
  if (day.shortsBlocked === undefined) day.shortsBlocked = 0;

  day.allowed += deltaAllowed;
  day.blocked += deltaBlocked;
  day.shortsBlocked += deltaShorts;

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

/**
 * Returns the total all-time stats aggregated across all daily records.
 */
export async function getTotalStats(): Promise<DailyStats> {
  const analytics = await getAnalytics();
  const totals: DailyStats = { allowed: 0, blocked: 0, shortsBlocked: 0, topics: {} };

  for (const day of Object.values(analytics.dailyStats)) {
    totals.allowed += day.allowed || 0;
    totals.blocked += day.blocked || 0;
    totals.shortsBlocked += day.shortsBlocked || 0;
    for (const [topic, count] of Object.entries(day.topics || {})) {
      totals.topics[topic] = (totals.topics[topic] || 0) + count;
    }
  }

  return totals;
}
