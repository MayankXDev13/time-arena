export interface Session {
  id: string;
  userId: string;
  categoryId?: string;
  start: Date;
  endedAt: Date | null;
  duration: number;
  mode: "work" | "break";
  createdAt: Date;
}

export interface UserSettings {
  userId: string;
  streakThresholdMinutes: number;
  autoStartBreaks?: boolean;
  soundEnabled?: boolean;
  defaultTimerMinutes?: number;
  breakDurationMinutes?: number;
  theme?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionInput = Omit<Session, 'id' | 'createdAt'>;

export type StreakCalculationResult = {
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  qualifiedToday: boolean;
};

export type TimeFormat = {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
};