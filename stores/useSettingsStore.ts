import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserSettings } from '@/types';

interface SettingsState {
  settings: UserSettings | null;
  setSettings: (settings: UserSettings) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  getStreakThreshold: () => number;
}

const defaultSettings: UserSettings = {
  userId: '',
  streakThresholdMinutes: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: null,

      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: state.settings
            ? { ...state.settings, ...updates, updatedAt: new Date() }
            : { ...defaultSettings, ...updates },
        })),

      getStreakThreshold: () => {
        const settings = get().settings;
        return settings?.streakThresholdMinutes ?? 15;
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);