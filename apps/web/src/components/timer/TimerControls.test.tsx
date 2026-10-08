import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimerControls } from "./TimerControls.js";

const noopAsync = () => Promise.resolve();
const noop = () => {};

afterEach(() => {
  cleanup();
});

function renderControls(props?: Partial<React.ComponentProps<typeof TimerControls>>) {
  return render(
    <TimerControls
      isRunning={false}
      isStarting={false}
      elapsed={0}
      isCompleted={false}
      start={noopAsync}
      pause={noop}
      resume={noop}
      stop={noopAsync}
      reset={noopAsync}
      {...props}
    />,
  );
}

describe("TimerControls starting state", () => {
  it("disables Start and shows a pending label while the session is created", () => {
    renderControls({ isStarting: true });

    const button = screen.getByRole("button", { name: "Starting…" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    // Same bell geometry as every other state: no layout shift.
    expect(button.className).toContain("size-20");
  });

  it("shows an enabled Pause button while running", () => {
    renderControls({ isRunning: true, elapsed: 5 });

    const button = screen.getByRole("button", { name: "Pause" });
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it("renders no Stop/Reset while idle (only once a session started)", () => {
    renderControls();

    expect(screen.queryByRole("button", { name: /stop and save/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reset timer/i })).toBeNull();
    // Just the Start bell.
    expect(screen.getByRole("button", { name: "Start round" })).not.toBeNull();
  });
});
