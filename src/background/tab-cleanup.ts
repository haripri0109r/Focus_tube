import { endSession } from './session-handlers';
import { SessionState } from '../types';

export function setupTabCleanup() {
  chrome.tabs.onRemoved.addListener(async (tabId) => {
    const sessionKey = `session_${tabId}`;
    const data = await chrome.storage.local.get(sessionKey);
    const session = data[sessionKey] as SessionState;
    
    if (session && (session.status === 'active' || session.status === 'paused')) {
      await endSession(tabId, session);
    } else if (session) {
      await chrome.storage.local.remove(sessionKey);
    }
  });
}

export async function performStartupSweep() {
  const tabs = await chrome.tabs.query({});
  const activeTabIds = new Set(tabs.map(t => t.id));
  
  const allData = await chrome.storage.local.get(null);
  const keysToRemove: string[] = [];
  
  for (const key of Object.keys(allData)) {
    if (key.startsWith('session_')) {
      const tabIdStr = key.replace('session_', '');
      const tabId = parseInt(tabIdStr, 10);
      
      if (!isNaN(tabId) && !activeTabIds.has(tabId)) {
        keysToRemove.push(key);
      }
    }
  }
  
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
}
