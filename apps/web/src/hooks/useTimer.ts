import { useCallback } from 'react';
import { useTimerStore } from '@/stores/useTimerStore';
import { useAuth } from '@/hooks/useAuth';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  resetTimer,
} from '@/stores/timerEngine';

/**
 * Thin React binding over the store-level timer engine.
 * The engine owns the interval in module scope, so this hook adds no
 * lifecycle of its own: mounting/unmounting (page navigation) never
 * affects the running clock.
 */
export function useTimer() {
  const {
    isRunning,
    isStarting,
    elapsed,
    actualElapsed,
    sessionId,
    mode,
    workDuration,
    breakDuration,
    targetDuration,
    isCompleted,
    selectedCategoryId,
  } = useTimerStore();
  const { user } = useAuth();

  const start = useCallback(() => startTimer(user?.id), [user?.id]);

  // Reset saves the current round and immediately opens the next one
  // (powers "Start new round" and the R shortcut).
  const reset = useCallback(async () => {
    await resetTimer();
    await startTimer(user?.id);
  }, [user?.id]);

  return {
    isRunning,
    isStarting,
    elapsed,
    actualElapsed,
    sessionId,
    mode,
    workDuration,
    breakDuration,
    targetDuration,
    isCompleted,
    selectedCategoryId,
    start,
    pause: pauseTimer,
    resume: resumeTimer,
    stop: stopTimer,
    reset,
  };
}
