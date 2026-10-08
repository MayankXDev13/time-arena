import { describe, expect, it } from "vitest";
import { timeArenaEvents } from "./time-arena-events.js";

describe("time-arena event client", () => {
  it("exposes a stable singleton that emits without a bus", () => {
    expect(timeArenaEvents).toBeDefined();
    expect(() =>
      timeArenaEvents.emit("timer-started", {
        mode: "work",
        categoryId: null,
        targetDuration: 1500,
      }),
    ).not.toThrow();
    expect(() =>
      timeArenaEvents.emit("session-saved", {
        id: "s1",
        mode: "work",
        duration: 1500,
      }),
    ).not.toThrow();
  });
});
