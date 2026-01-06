import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { calculateStreak, hasQualifiedToday } from '@/utils/streak';
import type { Streak } from '@/types';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastQualifiedDate: string | null;
  qualifiedToday: boolean;
  loading: boolean;
}

export function useStreak() {
  const [streakState, setStreakState] = useState<StreakState>({
    currentStreak: 0,
    longestStreak: 0,
    lastQualifiedDate: null,
    qualifiedToday: false,
    loading: true,
  });

  const sessions = useSessionStore((state) => state.sessions);
  const { settings, updateSettings } = useSettingsStore();

  const calculate = useCallback(() => {
    const threshold = settings?.streakThresholdMinutes ?? 15;

    const result = calculateStreak(
      sessions,
      streakState.currentStreak,
      streakState.longestStreak,
      streakState.lastQualifiedDate,
      threshold
    );

    const qualified = hasQualifiedToday(sessions, threshold);

    setStreakState({
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      lastQualifiedDate: result.lastQualifiedDate,
      qualifiedToday: qualified,
      loading: false,
    });
  }, [sessions, settings?.streakThresholdMinutes, streakState]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const updateStreak = useCallback(
    (streak: Partial<Streak>) => {
      setStreakState((prev) => ({
        ...prev,
        currentStreak: streak.currentStreak ?? prev.currentStreak,
        longestStreak: streak.longestStreak ?? prev.longestStreak,
        lastQualifiedDate: streak.lastQualifiedDate ?? prev.lastQualifiedDate,
      }));
    },
    []
  );

  return {
    ...streakState,
    updateStreak,
    recalculate: calculate,
  };
}
