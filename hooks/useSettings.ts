import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { UserSettings } from '@/types';

export function useSettings() {
  const { settings, setSettings, updateSettings } = useSettingsStore();

  const loadSettings = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load settings:', error);
          return;
        }

        if (data) {
          setSettings({
            userId: data.user_id,
            streakThresholdMinutes: data.streak_threshold_minutes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          } as UserSettings);
        } else {
          const defaultSettings: UserSettings = {
            userId,
            streakThresholdMinutes: 15,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setSettings(defaultSettings);

          if (supabase) {
            const { error: insertError } = await supabase
              .from('user_settings')
              .insert({
                user_id: userId,
                streak_threshold_minutes: 15,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as any);

            if (insertError) {
              console.error('Failed to create default settings:', insertError);
            }
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    },
    [setSettings]
  );

  const updateStreakThreshold = useCallback(
    async (threshold: number) => {
      updateSettings({ streakThresholdMinutes: threshold });

      if (settings?.userId) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { error } = await supabase
              .from('user_settings')
              .update({
                streak_threshold_minutes: threshold,
                updated_at: new Date().toISOString(),
              } as any)
              .eq('user_id', settings.userId);

            if (error) {
              console.error('Failed to update settings in Supabase:', error);
            }
          } catch (err) {
            console.error('Error updating settings:', err);
          }
        }
      }
    },
    [settings?.userId, updateSettings]
  );

  return {
    settings,
    loadSettings,
    updateStreakThreshold,
  };
}
