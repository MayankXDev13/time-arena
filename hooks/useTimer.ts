"use client"
import { useCallback, useRef, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
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
    selectedCategoryId,
    setTimer,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const { user } = useAuth();
  const createSessionMutation = useMutation(api.sessions.create);
  const updateSessionMutation = useMutation(api.sessions.update);
  const endSessionMutation = useMutation(api.sessions.endSession);
  const { restoreFromSupabase } = useTimerSync();

  useEffect(() => {
    restoreFromSupabase();
  }, [restoreFromSupabase]);

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
    if (!user?.id) return;

    clearIntervalRef();
    notifiedRef.current = false;

    const startTime = Date.now();
    const sessionId = await createSessionMutation({
      userId: user.id as any,
      categoryId: selectedCategoryId as any,
      start: startTime,
      duration: 0,
      mode,
    });

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const currentActualElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const completed = currentActualElapsed >= targetDuration;

      checkCompletion(currentActualElapsed);
        setTimer({
          isRunning: true,
          actualElapsed: currentActualElapsed,
          elapsed: currentActualElapsed,
          sessionId,
          lastStartTime: startTimeRef.current,
          isCompleted: completed,
        });

      if (completed) {
        clearIntervalRef();
        setTimer({ isRunning: false });
      }
    }, 100);

    requestNotificationPermission();
  }, [user?.id, selectedCategoryId, mode, createSessionMutation, setTimer, clearIntervalRef, checkCompletion, targetDuration]);

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
        const completed = currentActualElapsed >= targetDuration;

        checkCompletion(currentActualElapsed);
        setTimer({
          isRunning: true,
          actualElapsed: currentActualElapsed,
          elapsed: currentActualElapsed,
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

    const endTime = Date.now();
    const duration = actualElapsed;

    if (sessionId) {
      await endSessionMutation({
        id: sessionId as any,
        endedAt: endTime,
        duration,
      });
    }

    setTimer({
      isRunning: false,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: null,
      lastStartTime: null,
      isCompleted: false,
    });
  }, [sessionId, actualElapsed, endSessionMutation, setTimer, clearIntervalRef]);

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