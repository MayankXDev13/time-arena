import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TimerMode = "work" | "break";

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

    taskName: string;

    setTimer: (state: Partial<TimerStore>) => void;
    reset: () => void;

    setMode: (mode: TimerMode) => void;
    setWorkDuration: (minutes: number) => void;
    setBreakDuration: (minutes: number) => void;

    startTimer: (taskName: string) => void;
    stopTimer: () => void;
}

export const useTimerStore = create<TimerStore>()(
    persist(
        (set, get) => ({
            isRunning: false,
            elapsed: 0,
            actualElapsed: 0,
            sessionId: null,
            lastStartTime: null,

            mode: "work",
            workDuration: 25,
            breakDuration: 5,
            targetDuration: 25 * 60,

            isCompleted: false,

            taskName: "",

            setTimer: (state) => set((prev) => ({ ...prev, ...state })),

            reset: () =>
                set({
                    isRunning: false,
                    elapsed: 0,
                    actualElapsed: 0,
                    sessionId: null,
                    lastStartTime: null,
                    isCompleted: false,
                    taskName: "",
                }),

            setMode: (mode) =>
                set((state) => ({
                    mode,
                    targetDuration:
                        mode === "work" ? state.workDuration * 60 : state.breakDuration * 60,
                    elapsed: 0,
                    actualElapsed: 0,
                    isCompleted: false,
                })),

            setWorkDuration: (workDuration) =>
                set((state) => ({
                    workDuration,
                    targetDuration: state.mode === "work" ? workDuration * 60 : state.targetDuration,
                })),

            setBreakDuration: (breakDuration) =>
                set((state) => ({
                    breakDuration,
                    targetDuration: state.mode === "break" ? breakDuration * 60 : state.targetDuration,
                })),


            startTimer: (taskName) => {
                if (!taskName.trim()) return;

                const state = get();
                if (state.isRunning) return;

                set({
                    isRunning: true,
                    lastStartTime: Date.now(),
                    taskName,
                });
            },


            stopTimer: () => {
                const state = get();
                if (!state.isRunning || !state.lastStartTime) return;

                const elapsedNow = Math.floor((Date.now() - state.lastStartTime) / 1000);

                set({
                    isRunning: false,
                    lastStartTime: null,
                    actualElapsed: state.actualElapsed + elapsedNow,
                });
            },
        }),
        {
            name: "timer-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
