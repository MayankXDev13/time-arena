import { useEffect } from 'react';
import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { useAuth } from '@/hooks/useAuth';

export function useTimerSync() {
  const { user } = useAuth();
  const { setTimer } = useTimerStore();

  useEffect(() => {
    if (!user?.id) return;

    const stored = localStorage.getItem(`time-arena-timer-${user.id}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTimer({
          isRunning: data.is_running ?? false,
          elapsed: data.elapsed_seconds ?? 0,
          actualElapsed: data.elapsed_seconds ?? 0,
          mode: (data.mode as TimerMode) ?? 'work',
          workDuration: Math.ceil((data.work_duration_seconds ?? 1500) / 60),
          breakDuration: Math.ceil((data.break_duration_seconds ?? 300) / 60),
          targetDuration: data.mode === 'work'
            ? (data.work_duration_seconds ?? 1500)
            : (data.break_duration_seconds ?? 300),
          isCompleted: (data.elapsed_seconds ?? 0) >= (data.mode === 'work' ? (data.work_duration_seconds ?? 1500) : (data.break_duration_seconds ?? 300)),
        });
      } catch (e) {
        console.error('Failed to restore timer state:', e);
      }
    }
  }, [user?.id, setTimer]);

  const restoreFromSupabase = async (): Promise<null> => null;

  return { restoreFromSupabase };
}
