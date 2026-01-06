import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TimerMode = 'work' | 'break';

export interface TimerStore {
  isRunning: boolean;
  elapsed: number;
  actualElapsed: number;
  sessionId: string | null;
  lastStartTime: number | null;
  mode: TimerMode;
  workDuration: number;
  breakDuration: number;
  targetDuration: number;
  isCompleted: boolean;

  setTimer: (state: Partial<TimerStore>) => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set) => ({
      isRunning: false,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: null,
      lastStartTime: null,
      mode: 'work',
      workDuration: 25,
      breakDuration: 5,
      targetDuration: 25 * 60,
      isCompleted: false,

      setTimer: (state) => set((prev) => ({ ...prev, ...state })),
      reset: () => set({
        isRunning: false,
        elapsed: 0,
        actualElapsed: 0,
        sessionId: null,
        lastStartTime: null,
        isCompleted: false,
      }),
      setMode: (mode) => set((state) => ({
        mode,
        targetDuration: mode === 'work' ? state.workDuration * 60 : state.breakDuration * 60,
        elapsed: 0,
        actualElapsed: 0,
        isCompleted: false,
      })),
      setWorkDuration: (workDuration) => set((state) => ({
        workDuration,
        targetDuration: state.mode === 'work' ? workDuration * 60 : state.targetDuration,
      })),
      setBreakDuration: (breakDuration) => set((state) => ({
        breakDuration,
        targetDuration: state.mode === 'break' ? breakDuration * 60 : state.targetDuration,
      })),
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function getElapsedFromStore(): number {
  const stored = localStorage.getItem('timer-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const state = parsed.state;
      if (state.isRunning && state.lastStartTime) {
        return Math.floor((Date.now() - state.lastStartTime) / 1000) + state.actualElapsed;
      }
    } catch (e) {
      console.error('Error reading timer from storage:', e);
    }
  }
  return 0;
}
