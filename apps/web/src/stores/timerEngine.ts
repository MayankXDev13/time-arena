import type { QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api.js";
import { invalidateSessionData } from "@/lib/query-keys.js";
import { timeArenaEvents } from "@/devtools/time-arena-events.js";
import { useTimerStore, type TimerMode } from "./useTimerStore.js";
import {
  showTimerNotification,
  getCompletedNotification,
  requestNotificationPermission,
} from "@/utils/notifications.js";

/**
 * Timer engine: owns the ticking interval in module scope so it survives
 * component unmounts (page navigation) and reloads (via rehydrateTimer).
 * All state lives in useTimerStore; this module only drives transitions.
 */

let intervalId: ReturnType<typeof setInterval> | null = null;
let elapsedRef = 0;
let notified = false;
let startEpoch = 0;
let starting = false;
let flight = 0;
let queryClient: QueryClient | null = null;
let rehydrated = false;

/** Called once from main.tsx where the QueryClient is created. */
export function bindTimerEngine(client: QueryClient) {
  queryClient = client;
}

function clearEngineInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function invalidate() {
  if (queryClient) void invalidateSessionData(queryClient);
}

function checkCompletion(currentActualElapsed: number, mode: TimerMode, targetDuration: number) {
  if (currentActualElapsed >= targetDuration && !notified) {
    notified = true;
    const notification = getCompletedNotification(mode);
    showTimerNotification(notification.title, notification.body);
  }
}

function tick() {
  const store = useTimerStore.getState();
  const currentActualElapsed = Math.floor((Date.now() - startEpoch) / 1000);
  if (currentActualElapsed === elapsedRef) return;
  elapsedRef = currentActualElapsed;
  const completed = currentActualElapsed >= store.targetDuration;

  checkCompletion(currentActualElapsed, store.mode, store.targetDuration);
  useTimerStore.setState({
    isRunning: true,
    actualElapsed: currentActualElapsed,
    elapsed: currentActualElapsed,
    lastStartTime: startEpoch,
    isCompleted: completed,
  });

  if (completed) {
    clearEngineInterval();
    useTimerStore.setState({ isRunning: false });
  }
}

export async function startTimer(userId: string | undefined) {
  if (!userId || starting) return;
  starting = true;
  const myFlight = ++flight;
  // Pending state only: the clock (and Pause) appears once the server
  // returns the session id. The Start button stays disabled meanwhile.
  useTimerStore.setState({ isStarting: true });

  try {
    clearEngineInterval();
    notified = false;
    elapsedRef = 0;

    const store = useTimerStore.getState();
    const startTime = Date.now();
    const { id: newSessionId } = await api.createSession({
      categoryId: store.selectedCategoryId ?? null,
      start: startTime,
      duration: 0,
      mode: store.mode,
    });

    // Superseded (pause/stop/reset landed mid-flight): abandon this start
    // so it can't resurrect the timer or leak an interval.
    if (myFlight !== flight) return;

    startEpoch = Date.now();

    timeArenaEvents.emit("timer-started", {
      mode: store.mode,
      categoryId: store.selectedCategoryId ?? null,
      targetDuration: store.targetDuration,
    });

    // Session id received: the session is live — show Pause/Stop/Reset now,
    // don't wait for the first tick.
    useTimerStore.setState({
      isRunning: true,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: newSessionId,
      lastStartTime: startEpoch,
      isCompleted: false,
    });

    intervalId = setInterval(tick, 500);
    void requestNotificationPermission();
  } catch (err) {
    // Session never started server-side: unlock the UI again.
    clearEngineInterval();
    useTimerStore.setState({ isRunning: false });
    throw err;
  } finally {
    starting = false;
    useTimerStore.setState({ isStarting: false });
  }
}

export function pauseTimer() {
  flight += 1;
  clearEngineInterval();
  useTimerStore.setState({ isRunning: false, lastStartTime: null });
}

export function resumeTimer() {
  const store = useTimerStore.getState();
  if (store.isRunning || (!store.sessionId && store.actualElapsed <= 0)) return;
  // Kill any live interval first: without this, a double resume orphans
  // a ticking interval that stop()/pause() can never clear, so the
  // timer appears unstoppable.
  clearEngineInterval();
  notified = false;
  startEpoch = Date.now() - store.actualElapsed * 1000;
  elapsedRef = store.actualElapsed;

  intervalId = setInterval(tick, 500);
  void requestNotificationPermission();
}

export async function stopTimer() {
  flight += 1;
  clearEngineInterval();
  notified = false;

  const store = useTimerStore.getState();
  const endTime = Date.now();
  const duration = store.actualElapsed;

  try {
    if (store.sessionId) {
      await api.endSession(store.sessionId, {
        endedAt: endTime,
        duration,
      });
      timeArenaEvents.emit("timer-stopped", { mode: store.mode, duration, completed: false });
      timeArenaEvents.emit("session-saved", { id: store.sessionId, mode: store.mode, duration });
      invalidate();
    }
  } finally {
    // Always reset local state, even if the save failed: otherwise the UI
    // stays stuck in "running" with no ticking interval to stop.
    elapsedRef = 0;
    useTimerStore.setState({
      isRunning: false,
      elapsed: 0,
      actualElapsed: 0,
      sessionId: null,
      lastStartTime: null,
      isCompleted: false,
    });
  }
}

export async function resetTimer() {
  flight += 1;
  clearEngineInterval();
  notified = false;

  // Save current session if it exists and has elapsed time
  const store = useTimerStore.getState();
  if (store.sessionId && store.actualElapsed > 0) {
    const endTime = Date.now();
    await api.endSession(store.sessionId, {
      endedAt: endTime,
      duration: store.actualElapsed,
    });
    invalidate();
  }

  // Reset state
  useTimerStore.setState({
    isRunning: false,
    elapsed: 0,
    actualElapsed: 0,
    sessionId: null,
    lastStartTime: null,
    isCompleted: false,
  });
}

/**
 * Restart ticking after a reload when the persisted store says a round was
 * live. Fast-forwards elapsed from wall-clock; settles as completed when
 * the target passed while away. Runs once per boot (guarded).
 */
export function rehydrateTimer() {
  if (rehydrated) return;
  rehydrated = true;

  const store = useTimerStore.getState();
  if (!store.isRunning) return;

  if (!store.sessionId || store.lastStartTime == null) {
    // Running flag without a resumable session: keep the display, stop the lie.
    useTimerStore.setState({ isRunning: false });
    return;
  }

  const total = Math.floor((Date.now() - store.lastStartTime) / 1000);
  if (total >= store.targetDuration) {
    checkCompletion(total, store.mode, store.targetDuration);
    useTimerStore.setState({
      isRunning: false,
      elapsed: store.targetDuration,
      actualElapsed: store.targetDuration,
      isCompleted: true,
    });
    return;
  }

  startEpoch = store.lastStartTime;
  elapsedRef = total;
  notified = false;
  useTimerStore.setState({ elapsed: total, actualElapsed: total });
  intervalId = setInterval(tick, 500);
}

/** Test-only: drop module state between cases (intervals, guards, boot flag). */
export function __resetEngineForTests() {
  clearEngineInterval();
  elapsedRef = 0;
  notified = false;
  startEpoch = 0;
  starting = false;
  flight = 0;
  rehydrated = false;
}
