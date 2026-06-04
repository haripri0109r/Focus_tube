import { SessionState, UserPrefs, SessionRecord } from '../types';

export const getSessionKey = (tabId: number) => `session_${tabId}`;

export async function getSession(tabId: number): Promise<SessionState | null> {
  const key = getSessionKey(tabId);
  const data = await chrome.storage.local.get(key);
  return data[key] as SessionState || null;
}

export async function getPrefs(): Promise<UserPrefs> {
  const data = await chrome.storage.local.get('focustube_prefs');
  return (data.focustube_prefs as UserPrefs) || {
    alwaysOn: false, defaultTopic: '', defaultKeywords: [],
    filterHome: true, filterSearch: true, filterSidebar: true, filterShorts: true
  };
}
