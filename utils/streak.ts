import { getLocalDateString, isToday, addDays, getDaysBetween } from './date';
import type { Session, StreakCalculationResult } from '@/types';

const DEFAULT_STREAK_THRESHOLD_MINUTES = 15;

export function calculateStreak(
  sessions: Session[],
  currentStreak: number,
  longestStreak: number,
  lastQualifiedDate: string | null,
  thresholdMinutes: number = DEFAULT_STREAK_THRESHOLD_MINUTES
): StreakCalculationResult {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: longestStreak,
      lastQualifiedDate: null,
      qualifiedToday: false,
    };
  }

  const today = getLocalDateString();
  const qualifiedDates = new Set<string>();

  for (const session of sessions) {
    const sessionDate = getLocalDateString(new Date(session.start));
    const durationMinutes = session.duration / 60;

    if (durationMinutes >= thresholdMinutes) {
      qualifiedDates.add(sessionDate);
    }
  }

  const qualifiedToday = qualifiedDates.has(today);

  if (!lastQualifiedDate) {
    if (qualifiedDates.size === 0) {
      return {
        currentStreak: 0,
        longestStreak: longestStreak,
        lastQualifiedDate: null,
        qualifiedToday,
      };
    }

    const sortedDates = Array.from(qualifiedDates).sort();
    let newCurrentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = getDaysBetween(prev, curr);

      if (diff === 1) {
        newCurrentStreak++;
        maxStreak = Math.max(maxStreak, newCurrentStreak);
      } else {
        newCurrentStreak = 1;
      }
    }

    return {
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(longestStreak, maxStreak),
      lastQualifiedDate: today,
      qualifiedToday,
    };
  }

  const lastDate = new Date(lastQualifiedDate);
  const todayDate = new Date(today);
  const daysSinceLast = getDaysBetween(lastDate, todayDate);

  if (daysSinceLast === 0) {
    return {
      currentStreak,
      longestStreak,
      lastQualifiedDate,
      qualifiedToday,
    };
  }

  if (daysSinceLast === 1) {
    if (qualifiedToday) {
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(longestStreak, newStreak),
        lastQualifiedDate: today,
        qualifiedToday: true,
      };
    }
    return {
      currentStreak,
      longestStreak,
      lastQualifiedDate,
      qualifiedToday,
    };
  }

  const sortedDates = Array.from(qualifiedDates).sort();
  let resetCurrent = true;
  let newCurrentStreak = 0;
  let maxStreak = longestStreak;

  for (const date of sortedDates) {
    const dateObj = new Date(date);
    if (dateObj >= lastDate) {
      continue;
    }
  }

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const dateStr = sortedDates[i];
    const dateObj = new Date(dateStr);
    const diff = getDaysBetween(dateObj, todayDate);

    if (diff <= daysSinceLast) {
      if (resetCurrent && diff <= 1) {
        newCurrentStreak = 1;
        resetCurrent = false;
      } else if (!resetCurrent) {
        newCurrentStreak++;
      }
    }
  }

  if (newCurrentStreak === 0 && qualifiedToday) {
    newCurrentStreak = 1;
  }

  return {
    currentStreak: newCurrentStreak,
    longestStreak: maxStreak,
    lastQualifiedDate: qualifiedToday ? today : lastQualifiedDate,
    qualifiedToday,
  };
}

export function hasQualifiedToday(
  sessions: Session[],
  thresholdMinutes: number = DEFAULT_STREAK_THRESHOLD_MINUTES
): boolean {
  const today = getLocalDateString();

  for (const session of sessions) {
    const sessionDate = getLocalDateString(new Date(session.start));
    if (sessionDate === today) {
      const durationMinutes = session.duration / 60;
      if (durationMinutes >= thresholdMinutes) {
        return true;
      }
    }
  }

  return false;
}

export function getTodayTotalTime(sessions: Session[]): number {
  return sessions
    .filter((session) => isToday(new Date(session.start)))
    .reduce((total, session) => total + session.duration, 0);
}
