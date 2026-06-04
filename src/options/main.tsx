import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import '../index.css';

// Mock chrome API for local development preview
if (typeof chrome === 'undefined' || !chrome.tabs) {
  (window as any).chrome = {
    tabs: {
      query: (queryInfo: any, callback: any) => {
        callback([{ id: 1, url: 'https://www.youtube.com' }]);
      }
    },
    runtime: {
      sendMessage: async (msg: any) => {
        console.log('Mock sendMessage:', msg);
        return { ok: true, keywords: [] };
      },
      openOptionsPage: () => console.log('Mock openOptionsPage')
    },
    storage: {
      local: {
        get: (keys: any, cb?: any) => {
          const res = {};
          if (cb) cb(res);
          return Promise.resolve(res);
        },
        set: (items: any, cb?: any) => {
          if (cb) cb();
          return Promise.resolve();
        }
      },
      onChanged: {
        addListener: () => {},
        removeListener: () => {}
      }
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
