export type SessionStatus = 'inactive' | 'active' | 'paused';

export interface SessionState {
  status: SessionStatus;
  topic: string;
  keywords: string[];
  startTime: number;
  pausedDuration: number;
  pauseStartedAt?: number;
  hiddenCount: number;
  shownCount: number;
  isMirror?: boolean;
}

export interface UserPrefs {
  alwaysOn: boolean;
  defaultTopic: string;
  defaultKeywords: string[];
  careerPath: string | null;
  filterHome: boolean;
  filterSearch: boolean;
  filterSidebar: boolean;
  filterShorts: boolean;
}

export interface SessionRecord {
  topic: string;
  keywords: string[];
  durationSeconds: number;
  hiddenCount: number;
  shownCount: number;
  date: string; // YYYY-MM-DD local
}

export interface DailyStats {
  allowed: number;
  blocked: number;
  topics: Record<string, number>; // topic name → blocked count
}

export interface AnalyticsData {
  dailyStats: Record<string, DailyStats>; // "YYYY-MM-DD" → stats
}

export type PageType = 'home' | 'search' | 'watch' | 'shorts' | 'subscriptions' | 'other';
