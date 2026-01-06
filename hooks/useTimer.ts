import { useState, useCallback, useRef, useEffect } from 'react';
import { useSessions } from './useSessions';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Session } from '@/types';

interface TimerState {
  isRunning: boolean;
  elapsed: number;
  sessionId: string | null;
}

export function useTimer() {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    elapsed: 0,
    sessionId: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const { createSession, endSession } = useSessions();
  const { getStreakThreshold } = useSettingsStore();

  const start = useCallback(async () => {
    const threshold = getStreakThreshold();
    const startTime = new Date();

    const session = await createSession({
      userId: '',
      start: startTime,
      endedAt: null,
      duration: 0,
    });

    startTimeRef.current = Date.now();
    setTimer({
      isRunning: true,
      elapsed: 0,
      sessionId: session.id,
    });

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimer((prev) => ({ ...prev, elapsed }));
    }, 1000);
  }, [createSession, getStreakThreshold]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimer((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    if (!timer.isRunning && timer.sessionId) {
      startTimeRef.current = Date.now() - timer.elapsed * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimer((prev) => ({ ...prev, elapsed }));
      }, 1000);
      setTimer((prev) => ({ ...prev, isRunning: true }));
    }
  }, [timer.isRunning, timer.sessionId, timer.elapsed]);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const endTime = new Date();
    const duration = timer.elapsed;

    if (timer.sessionId) {
      await endSession(timer.sessionId, endTime, duration);
    }

    setTimer({
      isRunning: false,
      elapsed: 0,
      sessionId: null,
    });
  }, [timer.sessionId, timer.elapsed, endSession]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimer({
      isRunning: false,
      elapsed: 0,
      sessionId: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...timer,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
