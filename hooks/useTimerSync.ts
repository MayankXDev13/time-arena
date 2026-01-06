import { useCallback, useEffect, useRef } from 'react';
import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase/client';

interface TimerStateData {
  user_id: string;
  is_running: boolean;
  elapsed_seconds: number;
  mode: TimerMode;
  work_duration_seconds: number;
  break_duration_seconds: number;
  last_updated: string;
}

export function useTimerSync() {
  const { user } = useAuth();
  const { isRunning, elapsed, mode, workDuration, breakDuration } = useTimerStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncToSupabase = useCallback(async (data: Partial<TimerStateData>) => {
    if (!user?.id) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('timer_states')
        .upsert({
          user_id: user.id,
          ...data,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to sync timer state:', error);
      }
    } catch (err) {
      console.error('Error syncing timer state:', err);
    }
  }, [user?.id]);

  const debouncedSync = useCallback((data: Partial<TimerStateData>) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToSupabase(data);
    }, 1000);
  }, [syncToSupabase]);

  useEffect(() => {
    if (!user?.id) return;

    debouncedSync({
      is_running: isRunning,
      elapsed_seconds: elapsed,
      mode,
      work_duration_seconds: workDuration * 60,
      break_duration_seconds: breakDuration * 60,
    });
  }, [isRunning, elapsed, mode, workDuration, breakDuration, user?.id, debouncedSync]);

  const restoreFromSupabase = useCallback(async (): Promise<Partial<TimerStateData> | null> => {
    if (!user?.id) return null;

    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('timer_states')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        is_running: data.is_running,
        elapsed_seconds: data.elapsed_seconds,
        mode: data.mode,
        work_duration_seconds: data.work_duration_seconds,
        break_duration_seconds: data.break_duration_seconds,
      };
    } catch (err) {
      console.error('Error restoring timer state:', err);
      return null;
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return { restoreFromSupabase };
}
