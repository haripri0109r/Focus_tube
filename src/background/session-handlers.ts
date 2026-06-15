import { SessionState, SessionRecord } from '../types';
import { expandKeywords } from './keyword-expansion';
import { recordDailyStats, getPrefs } from '../lib/storage';

export async function handleSessionMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (res: any) => void) {
  const { type, tabId } = message;
  
  // if from popup, they pass tabId. if from content, we use sender.tab.id (should be rare for SESSION_ except overlay start)
  const targetTabId = tabId ?? sender.tab?.id;
  
  if (!targetTabId) {
    sendResponse({ error: 'No tabId provided or derived' });
    return;
  }

  const sessionKey = `session_${targetTabId}`;

  try {
    if (type === 'SESSION_START') {
      let { topic, keywords } = message;
      if (!keywords || keywords.length === 0) {
        keywords = await expandKeywords(topic);
      }
      
      const session: SessionState = {
        status: 'active',
        topic,
        keywords,
        startTime: Date.now(),
        pausedDuration: 0,
        hiddenCount: 0,
        shownCount: 0
      };
      await chrome.storage.local.set({ [sessionKey]: session });
      sendResponse({ ok: true, session });
    }
    
    else if (type === 'SESSION_PAUSE') {
      const data = await chrome.storage.local.get(sessionKey);
      const session = data[sessionKey] as SessionState;
      if (session && session.status === 'active') {
        session.status = 'paused';
        session.pauseStartedAt = Date.now();
        await chrome.storage.local.set({ [sessionKey]: session });
      }
      sendResponse({ ok: true });
    }
    
    else if (type === 'SESSION_RESUME') {
      const data = await chrome.storage.local.get(sessionKey);
      const session = data[sessionKey] as SessionState;
      if (session && session.status === 'paused' && session.pauseStartedAt) {
        session.status = 'active';
        session.pausedDuration += Date.now() - session.pauseStartedAt;
        session.pauseStartedAt = undefined;
        await chrome.storage.local.set({ [sessionKey]: session });
      }
      sendResponse({ ok: true });
    }
    
    else if (type === 'SESSION_END') {
      const data = await chrome.storage.local.get(sessionKey);
      const session = data[sessionKey] as SessionState;
      if (session) {
        await endSession(targetTabId, session);
      }
      sendResponse({ ok: true });
    }
    
    else if (type === 'SESSION_FLUSH_STATS') {
      const { hiddenCount, shownCount } = message;
      const data = await chrome.storage.local.get(sessionKey);
      const session = data[sessionKey] as SessionState;
      if (session) {
        // Capture previous cumulative values BEFORE update
        const prevHidden = session.hiddenCount;
        const prevShown = session.shownCount;

        // Existing update (unchanged — Math.max for cumulative totals)
        session.hiddenCount = Math.max(session.hiddenCount, hiddenCount || 0);
        session.shownCount = Math.max(session.shownCount, shownCount || 0);
        await chrome.storage.local.set({ [sessionKey]: session });

        // Compute deltas for analytics (always >= 0 due to monotonic values)
        const deltaBlocked = session.hiddenCount - prevHidden;
        const deltaAllowed = session.shownCount - prevShown;
        if (deltaBlocked > 0 || deltaAllowed > 0) {
          await recordDailyStats(deltaAllowed, deltaBlocked, session.topic);
        }
      } else {
        // No active session — Always-On stats tracking fallback
        const alwaysOnKey = `alwayson_${targetTabId}`;
        const alwaysOnData = await chrome.storage.local.get(alwaysOnKey);
        const record = (alwaysOnData[alwaysOnKey] as { hiddenCount?: number; shownCount?: number } | undefined) || { hiddenCount: 0, shownCount: 0 };

        const prevHidden = record.hiddenCount || 0;
        const prevShown = record.shownCount || 0;

        const updatedRecord = {
          hiddenCount: Math.max(prevHidden, hiddenCount || 0),
          shownCount: Math.max(prevShown, shownCount || 0)
        };
        await chrome.storage.local.set({ [alwaysOnKey]: updatedRecord });

        const deltaBlocked = updatedRecord.hiddenCount - prevHidden;
        const deltaAllowed = updatedRecord.shownCount - prevShown;
        if (deltaBlocked > 0 || deltaAllowed > 0) {
          const prefs = await getPrefs();
          const topicName = prefs.careerPath || prefs.defaultTopic || 'Always-On';
          await recordDailyStats(deltaAllowed, deltaBlocked, topicName);
        }
      }
      sendResponse({ ok: true });
    }
    
    else {
      sendResponse({ error: 'Unknown session message type' });
    }
  } catch (err: any) {
    sendResponse({ error: err.message });
  }
}

export async function endSession(tabId: number, session: SessionState) {
  const sessionKey = `session_${tabId}`;
  
  // Calculate duration
  let endTime = Date.now();
  if (session.status === 'paused' && session.pauseStartedAt) {
    endTime = session.pauseStartedAt;
  }
  
  const durationMs = endTime - session.startTime - session.pausedDuration;
  const durationSeconds = Math.floor(durationMs / 1000);
  
  // Only record if duration >= 1 second
  if (durationSeconds >= 1) {
    const record: SessionRecord = {
      topic: session.topic,
      keywords: session.keywords,
      durationSeconds,
      hiddenCount: session.hiddenCount,
      shownCount: session.shownCount,
      date: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local approx
    };
    
    const data = await chrome.storage.local.get('focustube_history');
    let history: SessionRecord[] = (data.focustube_history as SessionRecord[]) || [];
    history.push(record);
    if (history.length > 365) history = history.slice(-365);
    
    await chrome.storage.local.set({ focustube_history: history });
  }
  
  await chrome.storage.local.remove(sessionKey);
}
