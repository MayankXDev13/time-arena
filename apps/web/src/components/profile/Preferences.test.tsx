import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
      return Promise.resolve();
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
});
