/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Play, Pause, Square, List, GraduationCap } from 'lucide-react';
import { SessionState, SessionRecord, UserPrefs } from '../types';

export default function App() {
  const [tabId, setTabId] = useState<number | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    // 1. Get current tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const id = tabs[0].id!;
        setTabId(id);
        
        // 2. Fetch session and prefs on load
        chrome.storage.local.get([`session_${id}`, 'focustube_prefs', 'focustube_history'], (res) => {
          if (res[`session_${id}`]) setSession(res[`session_${id}`]);
          if (res.focustube_prefs) setPrefs(res.focustube_prefs);
          if (res.focustube_history) setHistory(res.focustube_history);
        });
      }
    });

    // Subscribe to changes
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (tabId && changes[`session_${tabId}`]) {
        setSession(changes[`session_${tabId}`].newValue as SessionState || null);
      }
      if (changes.focustube_prefs) {
        setPrefs(changes.focustube_prefs.newValue as UserPrefs);
      }
    };
    
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [tabId]);

  const [activeDuration, setActiveDuration] = useState(0);

  useEffect(() => {
    if (session?.status !== 'active') return;
    const interval = setInterval(() => {
      setActiveDuration(Date.now() - session.startTime - session.pausedDuration);
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleStart = (selectedTopic?: string) => {
    if (!tabId) return;
    const val = selectedTopic || topic;
    if (!val.trim()) return;
    chrome.runtime.sendMessage({ type: 'SESSION_START', tabId, topic: val.trim() });
  };

  const handlePause = () => {
    if (!tabId) return;
    chrome.runtime.sendMessage({ type: 'SESSION_PAUSE', tabId });
  };

  const handleResume = () => {
    if (!tabId) return;
    chrome.runtime.sendMessage({ type: 'SESSION_RESUME', tabId });
  };

  const handleEnd = () => {
    if (!tabId) return;
    chrome.runtime.sendMessage({ type: 'SESSION_END', tabId });
  };

  // Format mm:ss
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate top suggestions
  const suggestions: string[] = Array.from(new Set<string>(history.map(h => h.topic))).slice(0, 4);
  if (suggestions.length === 0) suggestions.push('React', 'Literature', 'Chess');

  const alwaysOnActive = prefs?.alwaysOn && !session;
  
  if (alwaysOnActive) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 p-6 font-sans text-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold tracking-tight">FocusTube</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <List className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Always-On Active</h2>
          <p className="text-slate-500 mb-6">Filtering exactly what you want.</p>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm w-full">
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wider mb-2">Current Topic</p>
            <p className="text-lg font-bold text-slate-900">{prefs.defaultTopic}</p>
          </div>
        </div>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="mt-6 w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl transition-colors"
        >
          Options
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold tracking-tight">FocusTube</h1>
      </div>

      {!session || session.status === 'inactive' ? (
        <div className="flex-1 flex flex-col pt-4">
          <h2 className="text-lg font-bold mb-4">What do you want to learn?</h2>
          <input
            type="text"
            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 transition-all"
            placeholder="e.g. Next.js, Algebra"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            autoFocus
          />
          <button
            onClick={() => handleStart()}
            disabled={!topic.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-xl p-4 shadow flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5 fill-current" /> Expand & Start
          </button>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-500 mb-3">Quick Start</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleStart(s)}
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-sm py-2 px-3 rounded-lg shadow-sm transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center mb-6">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">
              Focusing on
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 truncate">{session.topic}</h2>
            
            <div className="text-5xl font-mono font-light tracking-tight text-slate-800 mb-2">
              {session.status === 'paused' 
                ? formatTime(session.pauseStartedAt! - session.startTime - session.pausedDuration)
                : formatTime(activeDuration)}
            </div>
            <p className="text-sm text-slate-500 mb-6">
              {session.hiddenCount} distractions hidden
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {session.keywords.map((kw, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md border border-slate-200">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-auto">
            {session.status === 'active' ? (
              <button
                onClick={handlePause}
                className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
              >
                <Pause className="w-5 h-5 fill-current" /> Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 font-medium rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" /> Resume
              </button>
            )}
            
            <button
              onClick={handleEnd}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
            >
              <Square className="w-5 h-5 fill-current" /> End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
