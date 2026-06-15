import React, { useState, useEffect } from 'react';
import { UserPrefs, SessionRecord, AnalyticsData, DailyStats } from '../types';
import { CAREER_PATH_PRESETS, CAREER_PATH_NAMES } from '../data/career-paths';
import { ToggleRight, ToggleLeft, Save, GraduationCap, X, Download, Flame, Shield, BarChart3, Target, Briefcase } from 'lucide-react';

export default function App() {
  const [prefs, setPrefs] = useState<UserPrefs>({
    alwaysOn: false,
    defaultTopic: '',
    defaultKeywords: [],
    careerPath: null,
    filterHome: true,
    filterSearch: true,
    filterSidebar: true,
    filterShorts: true
  });
  const [topicInput, setTopicInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ dailyStats: {} });

  useEffect(() => {
    chrome.storage.local.get(['focustube_prefs', 'focustube_history', 'focustube_analytics'], (res) => {
      if (res.focustube_prefs) {
        const p = res.focustube_prefs as UserPrefs;
        setPrefs(p);
        setTopicInput(p.defaultTopic);
      }
      if (res.focustube_history) {
        setHistory(res.focustube_history as SessionRecord[]);
      }
      if (res.focustube_analytics) {
        setAnalytics(res.focustube_analytics as AnalyticsData);
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

  const handleCareerPathChange = async (path: string | null) => {
    const updated = { ...prefs, careerPath: path };
    setPrefs(updated);
    // Save immediately — does NOT modify defaultKeywords
    await chrome.storage.local.set({ focustube_prefs: updated });
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

  // ─── Analytics Helpers ───

  const today = new Date().toLocaleDateString('en-CA');
  const todayStats: DailyStats = (analytics.dailyStats || {})[today] || { allowed: 0, blocked: 0, topics: {} };
  
  const focusScore = (todayStats.allowed + todayStats.blocked) > 0
    ? Math.round((todayStats.blocked / (todayStats.allowed + todayStats.blocked)) * 100)
    : 0;

  // Last 7 days for trend chart
  const getLast7Days = (): { date: string; label: string; stats: DailyStats }[] => {
    const days: { date: string; label: string; stats: DailyStats }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-CA');
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        date: dateStr,
        label,
        stats: (analytics.dailyStats || {})[dateStr] || { allowed: 0, blocked: 0, topics: {} }
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const maxBlocked = Math.max(...last7Days.map(d => d.stats.blocked), 1);

  // Topic distribution from analytics (NOT from history)
  const getTopicDistribution = (): { topic: string; count: number }[] => {
    const topicCounts: Record<string, number> = {};
    for (const day of Object.values(analytics.dailyStats || {}) as DailyStats[]) {
      for (const [topic, count] of Object.entries(day.topics || {})) {
        const val = count as number;
        topicCounts[topic] = (topicCounts[topic] || 0) + val;
      }
    }
    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const topicDistribution = getTopicDistribution();
  const maxTopicCount = Math.max(...topicDistribution.map(t => t.count), 1);

  const handleResetAnalytics = async () => {
    await chrome.storage.local.set({ focustube_analytics: { dailyStats: {} } });
    setAnalytics({ dailyStats: {} });
  };

  // ─── Career Path Preset Keywords (read-only display) ───
  const careerPresetKeywords = prefs.careerPath
    ? (CAREER_PATH_PRESETS[prefs.careerPath] || [])
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">FocusTube Options</h1>
        </div>
        
        {/* ─── Career Path Section ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-violet-500" />
            Career Path
          </h2>
          
          <div className="mb-6">
            <label className="block font-semibold mb-2">Select a Career Path</label>
            <select
              id="career-path-select"
              value={prefs.careerPath || ''}
              onChange={(e) => handleCareerPathChange(e.target.value || null)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 text-base appearance-none cursor-pointer"
            >
              <option value="">None (Custom Keywords Only)</option>
              {CAREER_PATH_NAMES.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-2">
              Career path keywords are supplemental — they merge with your custom keywords at runtime.
            </p>
          </div>

          {prefs.careerPath && careerPresetKeywords.length > 0 && (
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-600 mb-3">
                Preset Keywords for {prefs.careerPath}
              </label>
              <div className="flex flex-wrap gap-2">
                {careerPresetKeywords.map(kw => (
                  <span key={kw} className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-violet-200">
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                These keywords are read-only and not stored in your custom keywords.
              </p>
            </div>
          )}
        </div>

        {/* ─── Always-On Filtering ─── */}
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

        {/* ─── Filter Surfaces ─── */}
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

        {/* ─── Focus History ─── */}
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

        {/* ─── Focus Analytics Dashboard ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Focus Analytics
          </h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{todayStats.allowed}</p>
              <p className="text-sm font-medium text-emerald-600 mt-1">Videos Allowed</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{todayStats.blocked}</p>
              <p className="text-sm font-medium text-red-600 mt-1">Videos Blocked</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-700">{focusScore}%</p>
              <p className="text-sm font-medium text-indigo-600 mt-1">Focus Score</p>
            </div>
          </div>

          {/* 7-Day Trend */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">Weekly Trend (Blocked)</h3>
            <div className="flex items-end gap-2 h-32">
              {last7Days.map((day) => {
                const height = day.stats.blocked > 0
                  ? Math.max((day.stats.blocked / maxBlocked) * 100, 4)
                  : 0;
                const isToday = day.date === today;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">
                      {day.stats.blocked > 0 ? day.stats.blocked : ''}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday ? 'bg-indigo-500' : 'bg-indigo-200'
                      }`}
                      style={{ height: `${height}%`, minHeight: day.stats.blocked > 0 ? '4px' : '0px' }}
                    />
                    <span className={`text-xs ${isToday ? 'font-bold text-indigo-600' : 'text-slate-400'}`}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Distribution */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Topic Distribution
            </h3>
            {topicDistribution.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No topic data yet. Start a focus session to see your topic breakdown.</p>
            ) : (
              <div className="space-y-3">
                {topicDistribution.map(({ topic, count }) => (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 w-28 truncate flex-shrink-0" title={topic}>
                      {topic}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-400 to-violet-500 h-full rounded-full transition-all"
                        style={{ width: `${(count / maxTopicCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 w-10 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reset Analytics */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleResetAnalytics}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              Reset Analytics
            </button>
          </div>
        </div>

        {/* ─── Privacy Policy ─── */}
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
              <li>Focus analytics data (allowed/blocked counts, topic distribution) is stored entirely on your device and never transmitted externally.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
