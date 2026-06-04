import React, { useState, useEffect } from 'react';
import { UserPrefs, SessionRecord } from '../types';
import { ToggleRight, ToggleLeft, Save, GraduationCap, X, Download, Flame, Shield } from 'lucide-react';

export default function App() {
  const [prefs, setPrefs] = useState<UserPrefs>({
    alwaysOn: false,
    defaultTopic: '',
    defaultKeywords: [],
    filterHome: true,
    filterSearch: true,
    filterSidebar: true,
    filterShorts: true
  });
  const [topicInput, setTopicInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['focustube_prefs', 'focustube_history'], (res) => {
      if (res.focustube_prefs) {
        const p = res.focustube_prefs as UserPrefs;
        setPrefs(p);
        setTopicInput(p.defaultTopic);
      }
      if (res.focustube_history) {
        setHistory(res.focustube_history as SessionRecord[]);
      }
    });
  }, []);

  const handleChange = (key: keyof UserPrefs, val: any) => {
    setPrefs(p => ({ ...p, [key]: val }));
  };

  const handleRemoveKeyword = (kw: string) => {
    setPrefs(p => ({ ...p, defaultKeywords: p.defaultKeywords.filter(k => k !== kw) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    let toSave = { ...prefs, defaultTopic: topicInput.trim() };
    
    // Expand default keywords if topic changed or words are empty
    if (toSave.defaultTopic && (toSave.defaultTopic !== prefs.defaultTopic || toSave.defaultKeywords.length === 0)) {
      const res = await chrome.runtime.sendMessage({ type: 'EXPAND_KEYWORDS', topic: toSave.defaultTopic });
      if (res?.keywords) {
        // Merge without duplicates
        toSave.defaultKeywords = Array.from(new Set([...toSave.defaultKeywords, ...res.keywords]));
      }
    }
    
    await chrome.storage.local.set({ focustube_prefs: toSave });
    setPrefs(toSave);
    setTimeout(() => setIsSaving(false), 500);
  };
  
  const [newKeyword, setNewKeyword] = useState('');
  
  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      const kw = newKeyword.trim().toLowerCase();
      if (!prefs.defaultKeywords.includes(kw)) {
        setPrefs(p => ({ ...p, defaultKeywords: [...p.defaultKeywords, kw] }));
      }
      setNewKeyword('');
    }
  };

  const calculateStreak = (): number => {
    if (!history.length) return 0;
    const uniqueDates = Array.from(new Set(history.map(h => h.date))).sort().reverse();
    if (!uniqueDates.length) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    // Check if there is activity today or yesterday to start the streak
    const todayStr = currentDate.toLocaleDateString('en-CA');
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = currentDate.toLocaleDateString('en-CA');
    
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0; // Streak broken
    }
    
    let checkDateStr = uniqueDates[0];
    let checkDate = new Date(checkDateStr);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDateStr) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.toLocaleDateString('en-CA');
        } else {
            break;
        }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  const handleDownloadCSV = () => {
    if (!history.length) return;
    const headers = ['Date,Topic,Duration (Seconds),Distractions Hidden'];
    const rows = history.map(h => `${h.date},"${h.topic.replace(/"/g, '""')}",${h.durationSeconds},${h.hiddenCount}`);
    const csvContent = headers.concat(rows).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'focustube-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">FocusTube Options</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Always-On Filtering (No Session Required)</h2>
          
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
            <div>
              <p className="font-semibold text-lg">Enable Always-On</p>
              <p className="text-slate-500">Filter YouTube 24/7 without needing to start a session.</p>
            </div>
            <button onClick={() => handleChange('alwaysOn', !prefs.alwaysOn)} className="text-blue-600">
              {prefs.alwaysOn ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12 text-slate-300" />}
            </button>
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">Default Topic</label>
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. History, Mathematics" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-slate-500 mt-2">Keywords will be generated automatically upon saving, or you can add them below.</p>
          </div>

          <div className="mb-8">
            <label className="block font-semibold mb-3">Expanded Keywords</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {prefs.defaultKeywords.map(kw => (
                <span key={kw} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 border border-blue-200">
                  {kw}
                  <button onClick={() => handleRemoveKeyword(kw)} className="text-blue-400 hover:text-blue-700 ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {prefs.defaultKeywords.length === 0 && (
                <span className="text-slate-500 text-sm italic">No keywords. Add some below or save after entering a topic.</span>
              )}
            </div>
            <input 
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleAddKeyword}
              placeholder="Add keyword and press enter..." 
              className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">Filter Surfaces</h2>
          <div className="space-y-4">
            {[
              { key: 'filterHome', label: 'Homepage Feed', desc: 'Hide unrelated videos on youtube.com' },
              { key: 'filterSearch', label: 'Search Results', desc: 'Hide unrelated search results' },
              { key: 'filterSidebar', label: 'Watch Sidebar', desc: 'Hide unrelated recommendations when watching' },
              { key: 'filterShorts', label: 'Shorts Overlay', desc: 'Block the Shorts player while focusing' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
                <button 
                  onClick={() => handleChange(key as keyof UserPrefs, !prefs[key as keyof UserPrefs])} 
                  className="text-blue-600"
                >
                  {prefs[key as keyof UserPrefs] ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-300" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow flex items-center gap-2 transition-all disabled:opacity-75"
          >
            <Save className="w-5 h-5" /> 
            {isSaving ? 'Saved!' : 'Save Options'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Your Focus History
            </h2>
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {currentStreak} Day Streak 🔥
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-slate-500 text-sm mb-4">
              You have completed {history.length} focus sessions so far. Keep it up!
            </p>
            <button
              onClick={handleDownloadCSV}
              disabled={history.length === 0}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export History to CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-emerald-500" />
            Privacy Policy
          </h2>
          <div className="text-sm text-slate-600 space-y-4">
            <p><strong>FocusTube is designed with privacy as the core principle.</strong></p>
            <ul className="list-disc pl-5 space-y-2 text-slate-500">
              <li>All focus session data (history, duration, stats) is stored <strong>locally on your device</strong> using Chrome Local Storage.</li>
              <li>We do <strong>not</strong> send your data to any remote servers, cloud databases, or third-party analytics services.</li>
              <li>We do <strong>not</strong> track your general browser history. We only process the title of elements dynamically while you are actively on youtube.com to hide distractions.</li>
              <li>Keywords generated for filtering are processed entirely within the extension.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
