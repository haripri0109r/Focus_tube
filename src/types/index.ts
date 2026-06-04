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
}

export interface UserPrefs {
  alwaysOn: boolean;
  defaultTopic: string;
  defaultKeywords: string[];
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

export type PageType = 'home' | 'search' | 'watch' | 'shorts' | 'other';
