export type SessionMode = "work" | "break";

export interface SessionItem {
  id: string;
  userId: string;
  categoryId: string | null;
  start: number;
  endedAt: number | null;
  duration: number;
  mode: SessionMode;
}

export interface CategoryItem {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface SettingsItem {
  userId: string;
  streakThresholdMinutes: number;
  autoStartBreaks: boolean | null;
  soundEnabled: boolean | null;
  defaultTimerMinutes: number | null;
  breakDurationMinutes: number | null;
  theme: string | null;
}
