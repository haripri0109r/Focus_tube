/**
 * FocusTube Popup
 * 
 * Dark-mode, premium UI with:
 * - Logo section
 * - Topic input with recent topics
 * - Expand & Start CTA
 * - Dashboard button (opens dashboard.html)
 * - Settings button (opens options page)
 * - Quick topic chips
 * - Session status display
 */

import { useState, useEffect } from 'react';
import { SessionState, SessionRecord, UserPrefs } from '../types';

// ─── Icons (inline SVG to avoid import issues in extension context) ──────────

const IconGraduate = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconPause = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IconStop = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

// ─── Quick Topics ─────────────────────────────────────────────────────────────

const QUICK_TOPICS = ['DSA', 'React', 'Python', 'Java', 'Machine Learning', 'System Design', 'DevOps', 'SQL'];

// ─── Time formatter ───────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  wrap: {
    width: 360,
    minHeight: 520,
    background: 'linear-gradient(160deg, #0d0d1a 0%, #111827 60%, #0d0d1a 100%)',
    color: '#e2e8f0',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px',
    gap: 0,
    overflow: 'hidden',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  } as React.CSSProperties,

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  } as React.CSSProperties,

  logoText: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
  } as React.CSSProperties,

  statusDot: (active: boolean) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: active ? '#22c55e' : '#6b7280',
    boxShadow: active ? '0 0 6px #22c55e' : 'none',
  } as React.CSSProperties),

  input: {
    width: '100%',
    background: '#1e2535',
    border: '1px solid #2d3748',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 15,
    outline: 'none',
    marginBottom: 10,
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,

  btnPrimary: {
    width: '100%',
    background: 'linear-gradient(135deg, #3ea6ff 0%, #1d7de8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '13px 20px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 15px rgba(62, 166, 255, 0.35)',
  } as React.CSSProperties,

  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  } as React.CSSProperties,

  btnRow: {
    display: 'flex',
    gap: 8,
    marginTop: 8,
  } as React.CSSProperties,

  btnSecondary: {
    flex: 1,
    background: '#1e2535',
    color: '#e2e8f0',
    border: '1px solid #2d3748',
    borderRadius: 12,
    padding: '11px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'background 0.15s, border-color 0.15s',
  } as React.CSSProperties,

  chip: (selected?: boolean) => ({
    background: selected ? '#1d4ed8' : '#1e2535',
    border: `1px solid ${selected ? '#3ea6ff' : '#2d3748'}`,
    color: selected ? '#93c5fd' : '#9ca3af',
    borderRadius: 20,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties),

  divider: {
    height: 1,
    background: '#1e2535',
    margin: '16px 0',
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 8,
  } as React.CSSProperties,

  sessionCard: {
    background: 'linear-gradient(135deg, #0d1f12 0%, #0f2a1a 100%)',
    border: '1px solid #22c55e33',
    borderRadius: 16,
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: 12,
  } as React.CSSProperties,

  keywordChip: {
    background: '#1a1a2e',
    border: '1px solid #2d2d44',
    color: '#94a3b8',
    borderRadius: 6,
    padding: '3px 8px',
    fontSize: 11,
    display: 'inline-block' as const,
  } as React.CSSProperties,

  actionBtn: (color: string, bg: string) => ({
    flex: 1,
    background: bg,
    color: color,
    border: 'none',
    borderRadius: 10,
    padding: '11px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'opacity 0.15s',
  } as React.CSSProperties),
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  const [tabId, setTabId] = useState<number | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [activeDuration, setActiveDuration] = useState(0);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const id = tabs[0].id!;
      setTabId(id);

      chrome.storage.local.get([`session_${id}`, 'focustube_prefs', 'focustube_history'], (res) => {
        if (res[`session_${id}`]) setSession(res[`session_${id}`] as SessionState);
        if (res.focustube_prefs) setPrefs(res.focustube_prefs as UserPrefs);
        if (res.focustube_history) setHistory(res.focustube_history as SessionRecord[]);
      });
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (tabId && changes[`session_${tabId}`]) {
        setSession((changes[`session_${tabId}`].newValue as SessionState) || null);
      }
      if (changes.focustube_prefs) {
        setPrefs(changes.focustube_prefs.newValue as UserPrefs);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [tabId]);

  // ── Session timer ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (session?.status !== 'active') return;
    const interval = setInterval(() => {
      setActiveDuration(Date.now() - session.startTime - session.pausedDuration);
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleStart = (selectedTopic?: string) => {
    if (!tabId) return;
    const val = (selectedTopic || topic).trim();
    if (!val) return;
    chrome.runtime.sendMessage({ type: 'SESSION_START', tabId, topic: val });
  };

  const handlePause = () => tabId && chrome.runtime.sendMessage({ type: 'SESSION_PAUSE', tabId });
  const handleResume = () => tabId && chrome.runtime.sendMessage({ type: 'SESSION_RESUME', tabId });
  const handleEnd = () => tabId && chrome.runtime.sendMessage({ type: 'SESSION_END', tabId });

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  // ── Computed ───────────────────────────────────────────────────────────────

  const recentTopics = Array.from(new Set(history.map(h => h.topic))).slice(0, 4);
  const isSessionActive = session && session.status !== 'inactive';
  const sessionTime =
    session?.status === 'paused'
      ? formatTime(session.pauseStartedAt! - session.startTime - session.pausedDuration)
      : formatTime(activeDuration);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <span style={{ color: '#3ea6ff' }}><IconGraduate /></span>
          <span style={S.logoText}>FocusTube</span>
        </div>
        <div style={S.statusDot(!!isSessionActive)} title={isSessionActive ? 'Session active' : 'No active session'} />
      </div>

      {/* ── Active Session View ────────────────────────────────────────────── */}
      {isSessionActive ? (
        <>
          <div style={S.sessionCard}>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {session!.status === 'paused' ? '⏸ Paused' : '🔴 Focusing on'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session!.topic}
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, color: '#22c55e', fontFamily: 'monospace', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {sessionTime}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              🚫 {session!.hiddenCount} distractions blocked
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {session!.keywords.slice(0, 8).map((kw, i) => (
                <span key={i} style={S.keywordChip}>{kw}</span>
              ))}
              {session!.keywords.length > 8 && (
                <span style={S.keywordChip}>+{session!.keywords.length - 8} more</span>
              )}
            </div>
          </div>

          <div style={S.btnRow}>
            {session!.status === 'active' ? (
              <button onClick={handlePause} style={S.actionBtn('#f59e0b', '#1f1504')}>
                <IconPause /> Pause
              </button>
            ) : (
              <button onClick={handleResume} style={S.actionBtn('#22c55e', '#0d1f12')}>
                <IconPlay /> Resume
              </button>
            )}
            <button onClick={handleEnd} style={S.actionBtn('#ef4444', '#1f0d0d')}>
              <IconStop /> End
            </button>
          </div>

          <div style={S.divider} />

          {/* Dashboard + Settings when session active */}
          <div style={S.btnRow}>
            <button id="ft-dashboard-btn" onClick={openDashboard} style={S.btnSecondary}>
              <IconChart /> Dashboard
            </button>
            <button id="ft-settings-btn" onClick={openSettings} style={S.btnSecondary}>
              <IconSettings /> Settings
            </button>
          </div>
        </>
      ) : (
        /* ── Idle View ────────────────────────────────────────────────────── */
        <>
          <div style={S.label}>What do you want to learn?</div>
          <input
            type="text"
            id="ft-topic-input"
            style={S.input}
            placeholder="e.g. DSA, React, Machine Learning"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            autoFocus
            onFocus={(e) => (e.target.style.borderColor = '#3ea6ff')}
            onBlur={(e) => (e.target.style.borderColor = '#2d3748')}
          />
          <button
            id="ft-start-btn"
            onClick={() => handleStart()}
            disabled={!topic.trim()}
            style={{
              ...S.btnPrimary,
              ...(topic.trim() ? {} : S.btnDisabled),
            }}
            onMouseEnter={(e) => {
              if (topic.trim()) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(62, 166, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(62, 166, 255, 0.35)';
            }}
          >
            <IconPlay /> Expand &amp; Start
          </button>

          {/* Dashboard + Settings buttons */}
          <div style={S.btnRow}>
            <button id="ft-dashboard-btn" onClick={openDashboard} style={S.btnSecondary}
              onMouseEnter={e => (e.currentTarget.style.background = '#253048')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1e2535')}
            >
              <IconChart /> Dashboard
            </button>
            <button id="ft-settings-btn" onClick={openSettings} style={S.btnSecondary}
              onMouseEnter={e => (e.currentTarget.style.background = '#253048')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1e2535')}
            >
              <IconSettings /> Settings
            </button>
          </div>

          <div style={S.divider} />

          {/* Quick Topics */}
          <div style={S.label}>Quick Topics</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {QUICK_TOPICS.map((t) => (
              <button
                key={t}
                id={`ft-quick-${t.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => handleStart(t)}
                style={S.chip(topic === t)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3ea6ff';
                  (e.currentTarget as HTMLElement).style.color = '#93c5fd';
                }}
                onMouseLeave={e => {
                  if (topic !== t) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2d3748';
                    (e.currentTarget as HTMLElement).style.color = '#9ca3af';
                  }
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Recent Topics */}
          {recentTopics.length > 0 && (
            <>
              <div style={S.label}>Recent Topics</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {recentTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleStart(t)}
                    style={{
                      ...S.chip(),
                      background: '#0f1729',
                      borderColor: '#1e2535',
                      color: '#64748b',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                      (e.currentTarget as HTMLElement).style.borderColor = '#3d4f6b';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.color = '#64748b';
                      (e.currentTarget as HTMLElement).style.borderColor = '#1e2535';
                    }}
                  >
                    ↩ {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #4b5563; }
        button:active { transform: scale(0.97) !important; }
      `}</style>
    </div>
  );
}
