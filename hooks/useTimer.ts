import { useCallback, useRef, useEffect } from 'react';
import { useSessions } from './useSessions';
import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { showTimerNotification, getCompletedNotification, requestNotificationPermission } from '@/utils/notifications';
import { useTimerSync } from './useTimerSync';

export function useTimer() {
  const {
    isRunning,
    elapsed,
    actualElapsed,
    sessionId,
    lastStartTime,
    mode,
    workDuration,
    breakDuration,
    targetDuration,
    isCompleted,
    setTimer,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const { createSession, endSession } = useSessions();
  const { restoreFromSupabase } = useTimerSync();

  useEffect(() => {
    const restore = async () => {
      const saved = await restoreFromSupabase();
      if (saved && saved.elapsed_seconds !== undefined) {
        setTimer({
          isRunning: saved.is_running || false,
          elapsed: saved.elapsed_seconds,
          actualElapsed: saved.elapsed_seconds,
          mode: saved.mode || 'work',
          workDuration: Math.ceil((saved.work_duration_seconds || 1500) / 60),
          breakDuration: Math.ceil((saved.break_duration_seconds || 300) / 60),
          targetDuration: saved.mode === 'work'
            ? (saved.work_duration_seconds || 1500)
            : (saved.break_duration_seconds || 300),
          isCompleted: saved.elapsed_seconds >= (saved.mode === 'work' ? (saved.work_duration_seconds || 1500) : (saved.break_duration_seconds || 300)),
        });
      }
    };
    restore();
  }, [restoreFromSupabase, setTimer]);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkCompletion = useCallback((currentActualElapsed: number) => {
    if (currentActualElapsed >= targetDuration && !notifiedRef.current) {
      notifiedRef.current = true;
      const notification = getCompletedNotification(mode);
      showTimerNotification(notification.title, notification.body);
    }
  }, [mode, targetDuration]);

  const start = useCallback(async () => {
    clearIntervalRef();
    notifiedRef.current = false;

    const startTime = new Date();
    const newSession = await createSession({
      userId: '',
      start: startTime,
      endedAt: null,
      duration: 0,
    });

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const currentActualElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, targetDuration - currentActualElapsed);
      const completed = currentActualElapsed >= targetDuration;

      checkCompletion(currentActualElapsed);
      setTimer({
        isRunning: true,
        actualElapsed: currentActualElapsed,
        elapsed: remaining,
        sessionId: newSession.id,
        lastStartTime: startTimeRef.current,
        isCompleted: completed,
      });

      if (completed) {
        clearIntervalRef();
        setTimer({ isRunning: false });
      }
    }, 100);

    requestNotificationPermission();
  }, [createSession, setTimer, clearIntervalRef, checkCompletion, targetDuration]);

  const pause = useCallback(() => {
    clearIntervalRef();
    setTimer({ isRunning: false, lastStartTime: null });
  }, [setTimer, clearIntervalRef]);

  const resume = useCallback(() => {
    if (!isRunning && (sessionId || actualElapsed > 0)) {
      notifiedRef.current = false;
      startTimeRef.current = Date.now() - actualElapsed * 1000;

      intervalRef.current = setInterval(() => {
        const currentActualElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, targetDuration - currentActualElapsed);
        const completed = currentActualElapsed >= targetDuration;

        checkCompletion(currentActualElapsed);
        setTimer({
          isRunning: true,
          actualElapsed: currentActualElapsed,
          elapsed: remaining,
          lastStartTime: startTimeRef.current,
          isCompleted: completed,
        });

        if (completed) {
          clearIntervalRef();
          setTimer({ isRunning: false });
        }
      }, 100);

      requestNotificationPermission();
    }
  }, [isRunning, sessionId, actualElapsed, setTimer, checkCompletion, targetDuration]);

  const stop = useCallback(async () => {
    clearIntervalRef();
    notifiedRef.current = false;

    const endTime = new Date();
    const duration = actualElapsed;

    if (sessionId) {
      await endSession(sessionId, endTime, duration);
    }

    setTimer({
      isRunning: false,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: null,
      lastStartTime: null,
      isCompleted: false,
    });
  }, [sessionId, actualElapsed, endSession, setTimer, clearIntervalRef]);

  const reset = useCallback(() => {
    clearIntervalRef();
    notifiedRef.current = false;
    setTimer({
      isRunning: false,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: null,
      lastStartTime: null,
      isCompleted: false,
    });
  }, [setTimer, clearIntervalRef]);

  useEffect(() => {
    return () => {
      clearIntervalRef();
    };
  }, [clearIntervalRef]);

  return {
    isRunning,
    elapsed,
    actualElapsed,
    sessionId,
    isCompleted,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
