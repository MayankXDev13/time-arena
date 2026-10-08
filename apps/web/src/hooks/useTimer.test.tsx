import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimerStore } from "@/stores/useTimerStore.js";
import { __resetEngineForTests, pauseTimer, rehydrateTimer } from "@/stores/timerEngine.js";
import { useTimer } from "./useTimer.js";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" }, loading: false, isAuthenticated: true }),
}));

function resetStore() {
  window.localStorage.clear();
  useTimerStore.setState({
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
    selectedCategoryId: undefined,
  });
}

let latest!: ReturnType<typeof useTimer>;
function Probe() {
  latest = useTimer();
  return null;
}

function renderProbe() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const ui: ReactNode = (
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>
  );
  return render(ui);
}

function mockSessionApi() {
  global.fetch = (vi.fn(async (url: unknown, init?: RequestInit) => {
    const u = String(url);
    if (u.endsWith("/api/sessions") && init?.method === "POST") {
      return { ok: true, json: async () => ({ id: "s1" }) };
    }
    if (/\/api\/sessions\/.+/.test(u) && init?.method === "PATCH") {
      return { ok: true, json: async () => ({ success: true }) };
    }
    throw new Error(`unexpected fetch ${u} ${init?.method}`);
  }) as unknown as typeof fetch);
}

beforeEach(() => {
  __resetEngineForTests();
  resetStore();
  vi.useFakeTimers();
  mockSessionApi();
});

afterEach(() => {
  cleanup();
  pauseTimer();
  __resetEngineForTests();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useTimer stop / pause", () => {
  it("stop halts the countdown and resets state", async () => {
    renderProbe();
    await act(async () => {
      await latest.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(useTimerStore.getState().isRunning).toBe(true);
    expect(useTimerStore.getState().elapsed).toBeGreaterThan(0);

    await act(async () => {
      await latest.stop();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.elapsed).toBe(0);
    expect(state.sessionId).toBeNull();
  });

  it("stays stopped after pause + double resume + stop (no orphaned interval)", async () => {
    renderProbe();
    await act(async () => {
      await latest.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      latest.pause();
    });
    // Double resume before the next tick: must not orphan a ticking interval.
    act(() => {
      latest.resume();
      latest.resume();
    });
    await act(async () => {
      await latest.stop();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.elapsed).toBe(0);
  });

  it("pause freezes the countdown", async () => {
    renderProbe();
    await act(async () => {
      await latest.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const frozen = useTimerStore.getState().elapsed;
    expect(frozen).toBeGreaterThan(0);

    act(() => {
      latest.pause();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.elapsed).toBe(frozen);
  });

  it("concurrent starts create only one session (Start disabled while saving)", async () => {
    renderProbe();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    await act(async () => {
      // Double click / double Space before the API resolves.
      await Promise.all([latest.start(), latest.start()]);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const posts = fetchMock.mock.calls.filter(
      ([url, init]) =>
        String(url).endsWith("/api/sessions") && (init as RequestInit)?.method === "POST",
    );
    expect(posts).toHaveLength(1);
    expect(useTimerStore.getState().isRunning).toBe(true);
  });

  it("a failed start unlocks the UI instead of sticking on running", async () => {
    global.fetch = (vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/api/sessions") && init?.method === "POST") {
        return { ok: false, status: 500, json: async () => ({}) };
      }
      throw new Error(`unexpected fetch ${u} ${init?.method}`);
    }) as unknown as typeof fetch);
    renderProbe();

    await act(async () => {
      await expect(latest.start()).rejects.toThrow("500");
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.isStarting).toBe(false);
    expect(state.sessionId).toBeNull();
  });

  it("stays pending (no Pause, no ticking) until the session id lands", async () => {
    let releasePost!: (value: { id: string }) => void;
    const postGate = new Promise<{ id: string }>((resolve) => {
      releasePost = resolve;
    });
    global.fetch = (vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/api/sessions") && init?.method === "POST") {
        const { id } = await postGate;
        return { ok: true, json: async () => ({ id }) };
      }
      if (/\/api\/sessions\/.+/.test(u) && init?.method === "PATCH") {
        return { ok: true, json: async () => ({ success: true }) };
      }
      throw new Error(`unexpected fetch ${u} ${init?.method}`);
    }) as unknown as typeof fetch);
    renderProbe();

    let startPromise!: Promise<void>;
    act(() => {
      startPromise = latest.start();
    });

    // While the POST is in flight: pending lock, clock not running.
    expect(useTimerStore.getState().isStarting).toBe(true);
    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().sessionId).toBeNull();

    await act(async () => {
      releasePost({ id: "s1" });
      await startPromise;
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const state = useTimerStore.getState();
    expect(state.isStarting).toBe(false);
    expect(state.isRunning).toBe(true);
    expect(state.sessionId).toBe("s1");
    expect(state.elapsed).toBeGreaterThan(0);
  });

  it("a stop during the start flight cancels it (no resurrection)", async () => {    let releasePost!: (value: { id: string }) => void;
    const postGate = new Promise<{ id: string }>((resolve) => {
      releasePost = resolve;
    });
    global.fetch = (vi.fn(async (url: unknown, init?: RequestInit) => {
      const u = String(url);
      if (u.endsWith("/api/sessions") && init?.method === "POST") {
        const { id } = await postGate;
        return { ok: true, json: async () => ({ id }) };
      }
      if (/\/api\/sessions\/.+/.test(u) && init?.method === "PATCH") {
        return { ok: true, json: async () => ({ success: true }) };
      }
      throw new Error(`unexpected fetch ${u} ${init?.method}`);
    }) as unknown as typeof fetch);
    renderProbe();

    let startPromise!: Promise<void>;
    act(() => {
      startPromise = latest.start();
    });
    // User bails out (pause/stop) before the server answers.
    act(() => {
      latest.pause();
    });
    await act(async () => {
      releasePost({ id: "s1" });
      await startPromise;
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.elapsed).toBe(0);
  });

  it("keeps ticking across unmount/remount (page navigation)", async () => {
    const first = renderProbe();
    await act(async () => {
      await latest.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(useTimerStore.getState().elapsed).toBeGreaterThan(0);

    // Navigate away: the timer component unmounts.
    first.unmount();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const away = useTimerStore.getState();
    expect(away.isRunning).toBe(true);
    expect(away.elapsed).toBeGreaterThanOrEqual(5);

    // Navigate back: a fresh mount shows the continued round.
    renderProbe();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(useTimerStore.getState().elapsed).toBeGreaterThanOrEqual(7);

    await act(async () => {
      await latest.stop();
    });
    expect(useTimerStore.getState().isRunning).toBe(false);
  });

  it("rehydrates a persisted live round from wall-clock on boot", () => {
    renderProbe();
    // Simulate a reload 100s into a 25-minute round.
    const bootTime = Date.now();
    act(() => {
      useTimerStore.setState({
        isRunning: true,
        elapsed: 90,
        actualElapsed: 90,
        sessionId: "s1",
        lastStartTime: bootTime - 100_000,
        targetDuration: 25 * 60,
        isCompleted: false,
      });
    });

    act(() => {
      rehydrateTimer();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.elapsed).toBeGreaterThanOrEqual(100);
  });
});
