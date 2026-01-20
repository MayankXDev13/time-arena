import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { UserSettings } from '@/types';

export function useSettings() {
  const { settings, setSettings, updateSettings } = useSettingsStore();

  const loadSettings = useCallback(
    async (userId: string) => {
      const stored = localStorage.getItem(`time-arena-settings-${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
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
        localStorage.setItem(`time-arena-settings-${userId}`, JSON.stringify({
          user_id: userId,
          streak_threshold_minutes: 15,
          created_at: defaultSettings.createdAt.toISOString(),
          updated_at: defaultSettings.updatedAt.toISOString(),
        }));
      }
    },
    [setSettings]
  );

  const updateStreakThreshold = useCallback(
    async (threshold: number) => {
      updateSettings({ streakThresholdMinutes: threshold });
      if (settings?.userId) {
        const stored = localStorage.getItem(`time-arena-settings-${settings.userId}`);
        if (stored) {
          const data = JSON.parse(stored);
          data.streak_threshold_minutes = threshold;
          data.updated_at = new Date().toISOString();
          localStorage.setItem(`time-arena-settings-${settings.userId}`, JSON.stringify(data));
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
