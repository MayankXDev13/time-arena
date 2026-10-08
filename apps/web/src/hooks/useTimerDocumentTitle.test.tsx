import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useTimerStore } from "@/stores/useTimerStore.js";
import { useTimerDocumentTitle } from "./useTimerDocumentTitle.js";

function Probe() {
  useTimerDocumentTitle();
  return null;
}

function setTimerState(partial: Partial<Parameters<typeof useTimerStore.setState>[0]>) {
  act(() => {
    useTimerStore.setState(partial as never);
  });
}

beforeEach(() => {
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
});

afterEach(() => {
  cleanup();
  document.title = "";
});

describe("useTimerDocumentTitle", () => {
  it("shows the live countdown with mode while running", () => {
    render(<Probe />);
    setTimerState({ isRunning: true, elapsed: 8 });

    // 25:00 - 8s = 24:52
    expect(document.title).toBe("24:52 · Focus — Time Arena");
  });

  it("labels break rounds", () => {
    render(<Probe />);
    setTimerState({ isRunning: true, mode: "break", elapsed: 0 });

    expect(document.title).toBe("05:00 · Break — Time Arena");
  });

  it("announces completion and restores the default title when idle", () => {
    render(<Probe />);
    setTimerState({ isCompleted: true });

    expect(document.title).toBe("Round done — Time Arena");

    setTimerState({ isCompleted: false, elapsed: 0 });

    expect(document.title).toBe("Time Arena — Train your focus");
  });

  it("restores the default title on unmount", () => {
    const { unmount } = render(<Probe />);
    setTimerState({ isRunning: true, elapsed: 0 });
    expect(document.title).toContain("25:00");

    unmount();
    expect(document.title).toBe("Time Arena — Train your focus");
  });
});
