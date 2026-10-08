import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Preferences } from "./Preferences.js";

vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({
    settings: {
      userId: "u1",
      streakThresholdMinutes: 15,
      autoStartBreaks: true,
      soundEnabled: true,
      defaultTimerMinutes: 25,
      breakDurationMinutes: 5,
      theme: "system",
    },
    updateSettings: (...args: unknown[]) => {
      (globalThis as { __patches?: unknown[][] }).__patches?.push(args);
      // Gated: tests decide when the PATCH settles.
      return new Promise<void>((resolve) => {
        (globalThis as { __releaseSave?: () => void }).__releaseSave = resolve;
      });
    },
    isLoading: false,
  }),
}));

function patches(): unknown[][] {
  return (globalThis as { __patches?: unknown[][] }).__patches ?? [];
}

describe("Preferences debounced settings writes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (globalThis as { __patches?: unknown[][] }).__patches = [];
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    (globalThis as { __releaseSave?: () => void }).__releaseSave?.();
  });

  it("collapses rapid timer edits into a single PATCH", async () => {
    render(<Preferences />);
    const input = screen.getByDisplayValue("25");
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.change(input, { target: { value: "25" } });
    fireEvent.change(input, { target: { value: "250" } });
    expect(patches()).toHaveLength(0);
    vi.advanceTimersByTime(600);
    expect(patches()).toHaveLength(1);
    // Clamped to the hinted 5–120 range before sending.
    expect(patches()[0]).toEqual([{ defaultTimerMinutes: 120 }]);
  });

  it("flushes the pending PATCH on blur", () => {
    render(<Preferences />);
    const input = screen.getByDisplayValue("5");
    fireEvent.change(input, { target: { value: "10" } });
    expect(patches()).toHaveLength(0);
    fireEvent.blur(input);
    expect(patches()).toHaveLength(1);
    expect(patches()[0]).toEqual([{ breakDurationMinutes: 10 }]);
  });

  it("never PATCHes non-numeric input", () => {
    render(<Preferences />);
    const input = screen.getByDisplayValue("25");
    fireEvent.change(input, { target: { value: "" } });
    vi.advanceTimersByTime(10_000);
    expect(patches()).toHaveLength(0);
  });

  it("shows Saving only while the PATCH is in flight", async () => {
    render(<Preferences />);
    expect(screen.queryByText(/Saving…/)).toBeNull();
    const input = screen.getByDisplayValue("25");
    fireEvent.change(input, { target: { value: "50" } });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(patches()).toHaveLength(1);
    expect(screen.getByText(/Saving…/)).toBeDefined();
    await act(async () => {
      (globalThis as { __releaseSave?: () => void }).__releaseSave?.();
    });
    expect(screen.queryByText(/Saving…/)).toBeNull();
  });
});
