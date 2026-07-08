import { useState, useEffect, useCallback } from 'react';
import { AnalyticsData, DailyStats, SessionRecord, UserPrefs } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-CA'));
  }
  return days;
}

function dayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ─── Mini SVG Bar Chart ──────────────────────────────────────────────────────

function BarChart({
  data,
  color = '#3ea6ff',
}: {
  data: { label: string; value: number; value2?: number }[];
  color?: string;
}) {
  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1);
  const W = 40;
  const GAP = 8;
  const H = 80;
  const totalWidth = data.length * (W + GAP);

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${H + 24}`}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
    >
      {data.map((d, i) => {
        const x = i * (W + GAP);
        const barH = Math.max(2, (d.value / maxVal) * H);
        const bar2H = d.value2 != null ? Math.max(2, (d.value2 / maxVal) * H) : 0;
        return (
          <g key={d.label}>
            {/* Background */}
            <rect x={x} y={0} width={W} height={H} fill="#1e1e2e" rx={4} />
            {/* Secondary bar (allowed) */}
            {d.value2 != null && (
              <rect
                x={x + W / 2}
                y={H - bar2H}
                width={W / 2}
                height={bar2H}
                fill="#22c55e"
                rx={2}
                opacity={0.7}
              />
            )}
            {/* Primary bar (blocked) */}
            <rect
              x={x}
              y={H - barH}
              width={d.value2 != null ? W / 2 : W}
              height={barH}
              fill={color}
              rx={2}
            />
            {/* Value label */}
            <text
              x={x + W / 2}
              y={H - barH - 4}
              textAnchor="middle"
              fontSize={9}
              fill="#aaa"
            >
              {d.value > 0 ? d.value : ''}
            </text>
            {/* Day label */}
            <text
              x={x + W / 2}
              y={H + 14}
              textAnchor="middle"
              fontSize={10}
              fill="#888"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = '#3ea6ff',
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1e1e2e 0%, #16213e 100%)',
        border: '1px solid #2d2d44',
        borderRadius: 16,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: '#888', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ color: accent, fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ color: '#666', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

// ─── Focus Score Ring ────────────────────────────────────────────────────────

function FocusRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="#2d2d44" strokeWidth={12} />
        <circle
          cx={65}
          cy={65}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
        />
        <text x={65} y={60} textAnchor="middle" fontSize={26} fontWeight={800} fill={color}>
          {score}%
        </text>
        <text x={65} y={78} textAnchor="middle" fontSize={11} fill="#888">
          Focus Score
        </text>
      </svg>
      <div style={{ fontSize: 13, color: '#888' }}>
        {score >= 80 ? '🏆 Excellent focus!' : score >= 50 ? '📈 Good progress' : '⚠️ Many distractions'}
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function App() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({ dailyStats: {} });
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [activeSession, setActiveSession] = useState<{ topic: string; startTime: number } | null>(null);
  const [now, setNow] = useState(Date.now());

  const loadData = useCallback(() => {
    chrome.storage.local.get(
      ['focustube_analytics', 'focustube_history', 'focustube_prefs'],
      (res) => {
        if (res.focustube_analytics) setAnalytics(res.focustube_analytics as AnalyticsData);
        if (res.focustube_history) setHistory(res.focustube_history as SessionRecord[]);
        if (res.focustube_prefs) setPrefs(res.focustube_prefs as UserPrefs);
      },
    );

    // Find active session
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      if (!tabs.length) return;
      const keys = tabs.map(t => `session_${t.id}`);
      chrome.storage.local.get(keys, (data) => {
        for (const key of keys) {
          const sess = data[key] as { status: string; topic: string; startTime: number } | undefined;
          if (sess?.status === 'active') {
            setActiveSession({ topic: sess.topic, startTime: sess.startTime });
            return;
          }
        }
        setActiveSession(null);
      });
    });
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setNow(Date.now());
      loadData();
    }, 10_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Real-time clock tick for active session
  useEffect(() => {
    if (!activeSession) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activeSession]);

  // ── Computed values ──────────────────────────────────────────────────────

  const today = new Date().toLocaleDateString('en-CA');
  const todayStats: DailyStats = analytics.dailyStats[today] ?? { allowed: 0, blocked: 0, shortsBlocked: 0, topics: {} };

  // All-time totals
  let totalAllowed = 0, totalBlocked = 0, totalShorts = 0, totalLearningSeconds = 0;
  for (const day of Object.values(analytics.dailyStats)) {
    totalAllowed += day.allowed || 0;
    totalBlocked += day.blocked || 0;
    totalShorts += day.shortsBlocked || 0;
  }
  for (const rec of history) {
    totalLearningSeconds += rec.durationSeconds || 0;
  }

  const focusScore =
    totalAllowed + totalBlocked === 0
      ? 0
      : Math.round((totalBlocked / (totalAllowed + totalBlocked)) * 100);

  // Last 7 days chart data
  const last7 = getLast7Days();
  const chartData = last7.map(d => ({
    label: dayLabel(d),
    value: analytics.dailyStats[d]?.blocked ?? 0,
    value2: analytics.dailyStats[d]?.allowed ?? 0,
  }));

  // Top topics
  const topicCounts: Record<string, number> = {};
  for (const day of Object.values(analytics.dailyStats)) {
    for (const [topic, count] of Object.entries(day.topics ?? {})) {
      topicCounts[topic] = (topicCounts[topic] || 0) + count;
    }
  }
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // ── Styles ───────────────────────────────────────────────────────────────

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '0',
    } as React.CSSProperties,
    header: {
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      borderBottom: '1px solid #2d2d44',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as React.CSSProperties,
    main: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '32px 24px',
    } as React.CSSProperties,
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 32,
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#e2e8f0',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    } as React.CSSProperties,
    card: {
      background: 'linear-gradient(135deg, #1e1e2e 0%, #16213e 100%)',
      border: '1px solid #2d2d44',
      borderRadius: 16,
      padding: '24px',
    } as React.CSSProperties,
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: '#1e3a5f',
      color: '#3ea6ff',
      borderRadius: 20,
      padding: '4px 12px',
      fontSize: 13,
      fontWeight: 600,
    } as React.CSSProperties,
    sessionBanner: {
      background: 'linear-gradient(135deg, #0d3321 0%, #0f2a1a 100%)',
      border: '1px solid #22c55e33',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 32,
      gap: 16,
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🎓</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              FocusTube
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>Learning Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            style={{
              background: '#2d2d44',
              color: '#e2e8f0',
              border: '1px solid #3d3d5c',
              borderRadius: 10,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Active Session Banner */}
        {activeSession && (
          <div style={styles.sessionBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  animation: 'pulse 2s infinite',
                }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#22c55e', fontSize: 15 }}>
                  🔴 Active Session
                </div>
                <div style={{ color: '#888', fontSize: 13 }}>Topic: {activeSession.topic}</div>
              </div>
            </div>
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 20, fontFamily: 'monospace' }}>
              {formatTime(Math.floor((now - activeSession.startTime) / 1000))}
            </div>
          </div>
        )}

        {/* Today's Stats */}
        <div style={{ marginBottom: 12 }}>
          <div style={styles.sectionTitle}>
            <span>📊</span> Today's Stats
          </div>
        </div>
        <div style={styles.grid2}>
          <StatCard icon="🚫" label="Blocked Today" value={todayStats.blocked} accent="#ef4444" />
          <StatCard icon="✅" label="Allowed Today" value={todayStats.allowed} accent="#22c55e" />
          <StatCard icon="⚡" label="Shorts Blocked" value={todayStats.shortsBlocked} accent="#f59e0b" />
          <StatCard
            icon="🎯"
            label="Today's Focus"
            value={
              todayStats.blocked + todayStats.allowed === 0
                ? '—'
                : `${Math.round((todayStats.blocked / (todayStats.blocked + todayStats.allowed)) * 100)}%`
            }
            accent="#a855f7"
          />
        </div>

        {/* All-Time Stats + Focus Ring */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div style={{ ...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FocusRing score={focusScore} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            <StatCard
              icon="🏆"
              label="Total Blocked"
              value={totalBlocked.toLocaleString()}
              accent="#ef4444"
            />
            <StatCard
              icon="📚"
              label="Total Allowed"
              value={totalAllowed.toLocaleString()}
              accent="#22c55e"
            />
            <StatCard
              icon="⏱️"
              label="Learning Time"
              value={formatTime(totalLearningSeconds)}
              accent="#3ea6ff"
            />
            <StatCard
              icon="📅"
              label="Sessions"
              value={history.length}
              accent="#a855f7"
            />
            <StatCard
              icon="📵"
              label="Shorts Blocked"
              value={totalShorts.toLocaleString()}
              accent="#f59e0b"
            />
            <StatCard
              icon="🔥"
              label="Current Topic"
              value={prefs?.defaultTopic || activeSession?.topic || '—'}
              accent="#fb923c"
            />
          </div>
        </div>

        {/* Weekly Chart */}
        <div style={{ ...styles.card, marginBottom: 24 }}>
          <div style={styles.sectionTitle}>
            <span>📈</span> Last 7 Days
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 12 }}>
              <span style={{ color: '#3ea6ff' }}>■ Blocked</span>
              <span style={{ color: '#22c55e' }}>■ Allowed</span>
            </span>
          </div>
          <BarChart data={chartData} />
        </div>

        {/* Top Topics */}
        {topTopics.length > 0 && (
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <div style={styles.sectionTitle}><span>🎓</span> Top Topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topTopics.map(([topic, count]) => {
                const maxCount = topTopics[0][1];
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{topic}</span>
                      <span style={{ color: '#888' }}>{count} blocked</span>
                    </div>
                    <div style={{ height: 6, background: '#2d2d44', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #3ea6ff, #a855f7)',
                          borderRadius: 3,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Session History */}
        {history.length > 0 && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}><span>🗂️</span> Recent Sessions</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: '#888', textAlign: 'left' }}>
                    <th style={{ padding: '6px 12px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '6px 12px', fontWeight: 600 }}>Topic</th>
                    <th style={{ padding: '6px 12px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '6px 12px', fontWeight: 600 }}>Blocked</th>
                    <th style={{ padding: '6px 12px', fontWeight: 600 }}>Allowed</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().slice(0, 15).map((rec, i) => (
                    <tr
                      key={i}
                      style={{
                        borderTop: '1px solid #2d2d44',
                        background: i % 2 === 0 ? 'transparent' : '#ffffff05',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#888' }}>{rec.date}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                        <span style={styles.badge}>{rec.topic}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#3ea6ff' }}>
                        {formatTime(rec.durationSeconds)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#ef4444', fontWeight: 700 }}>
                        {rec.hiddenCount}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 700 }}>
                        {rec.shownCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && totalBlocked === 0 && (
          <div
            style={{
              ...styles.card,
              textAlign: 'center',
              padding: '60px 24px',
              color: '#888',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>📖</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
              No sessions yet
            </div>
            <div style={{ maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
              Start a focus session from the FocusTube popup to begin tracking your learning.
            </div>
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1e1e2e; }
        ::-webkit-scrollbar-thumb { background: #3d3d5c; border-radius: 3px; }
      `}</style>
    </div>
  );
}
