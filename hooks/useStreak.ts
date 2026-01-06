import { useState, useEffect, useCallback, useRef } from 'react';
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
  const { settings } = useSettingsStore();

  const currentStreakRef = useRef(0);
  const longestStreakRef = useRef(0);
  const lastQualifiedDateRef = useRef<string | null>(null);

  const calculate = useCallback(() => {
    const threshold = settings?.streakThresholdMinutes ?? 15;

    const result = calculateStreak(
      sessions,
      currentStreakRef.current,
      longestStreakRef.current,
      lastQualifiedDateRef.current,
      threshold
    );

    currentStreakRef.current = result.currentStreak;
    longestStreakRef.current = result.longestStreak;
    lastQualifiedDateRef.current = result.lastQualifiedDate;

    const qualified = hasQualifiedToday(sessions, threshold);

    setStreakState({
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      lastQualifiedDate: result.lastQualifiedDate,
      qualifiedToday: qualified,
      loading: false,
    });
  }, [sessions, settings?.streakThresholdMinutes]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const updateStreak = useCallback(
    (streak: Partial<Streak>) => {
      setStreakState((prev) => {
        const newStreak = {
          ...prev,
          currentStreak: streak.currentStreak ?? prev.currentStreak,
          longestStreak: streak.longestStreak ?? prev.longestStreak,
          lastQualifiedDate: streak.lastQualifiedDate ?? prev.lastQualifiedDate,
        };
        currentStreakRef.current = newStreak.currentStreak;
        longestStreakRef.current = newStreak.longestStreak;
        lastQualifiedDateRef.current = newStreak.lastQualifiedDate;
        return newStreak;
      });
    },
    []
  );

  return {
    ...streakState,
    updateStreak,
    recalculate: calculate,
  };
}
