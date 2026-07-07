import { expandKeywords } from './keyword-expansion';
import { handleSessionMessage } from './session-handlers';
import { setupTabCleanup, performStartupSweep } from './tab-cleanup';

// On install or startup, sweep orphaned sessions
chrome.runtime.onInstalled.addListener(performStartupSweep);
chrome.runtime.onStartup.addListener(performStartupSweep);

// Tab cleanup
setupTabCleanup();

// Handle messages from UI or Content Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONTEXT') {
    const tabId = sender.tab?.id;
    const pageUrl = sender.tab?.url;
    
    (async () => {
      if (tabId) {
        const data = await chrome.storage.local.get(null);
        if (!data[`session_${tabId}`]) {
          let activeSession = null;
          for (const key of Object.keys(data)) {
            if (key.startsWith('session_')) {
              const sess = data[key] as any;
              if (sess && sess.status === 'active') {
                activeSession = { ...sess, isMirror: true, hiddenCount: 0, shownCount: 0 };
                break;
              }
            }
          }
          if (activeSession) {
            await chrome.storage.local.set({ [`session_${tabId}`]: activeSession });
          }
        }
      }
      sendResponse({ tabId, pageUrl });
    })();
    return true; // async
  }
  
  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }
  
  if (message.type === 'EXPAND_KEYWORDS') {
    expandKeywords(message.topic).then(keywords => sendResponse({ keywords }));
    return true; // async
  }
  
  if (message.type && message.type.startsWith('SESSION_')) {
    handleSessionMessage(message, sender, sendResponse);
    return true; // async response for session changes
  }
  
  return false;
});
