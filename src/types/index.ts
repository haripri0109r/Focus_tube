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
  /** Strict learning mode: only show videos with score >= 90 */
  strictMode?: boolean;
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
  shortsBlocked: number;
  topics: Record<string, number>; // topic name → blocked count
}

export interface AnalyticsData {
  dailyStats: Record<string, DailyStats>; // "YYYY-MM-DD" → stats
}

export type PageType =
  | 'home'
  | 'search'
  | 'watch'
  | 'shorts'
  | 'subscriptions'
  | 'other';

/**
 * Rich metadata extracted from a video card DOM element.
 */
export interface VideoMetadata {
  title: string;
  channel: string;
  ariaLabel: string;
  /** True if the element is a loading skeleton (not yet rendered) */
  isSkeleton: boolean;
  /** True if already marked as processed by a previous filter pass */
  isProcessed: boolean;
}

/**
 * Result from the filtering engine for a single video card.
 */
export interface FilterResult {
  decision: 'show' | 'hide' | 'skip';
  score: number;
  reason: string;
  metadata: VideoMetadata;
}
