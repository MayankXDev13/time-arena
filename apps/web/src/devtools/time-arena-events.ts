import { EventClient } from "@tanstack/devtools-event-client";

export interface TimerStartedPayload {
  mode: "work" | "break";
  categoryId: string | null;
  targetDuration: number;
}

export interface TimerStoppedPayload {
  mode: "work" | "break";
  duration: number;
  completed: boolean;
}

export interface SessionSavedPayload {
  id: string;
  mode: "work" | "break";
  duration: number;
}

export type TimeArenaEvents = {
  "timer-started": TimerStartedPayload;
  "timer-stopped": TimerStoppedPayload;
  "session-saved": SessionSavedPayload;
};

class TimeArenaEventClient extends EventClient<TimeArenaEvents> {
  constructor() {
    // Gated to dev: without a bus the client would pointlessly retry its
    // connection loop in production. Disabled clients are fully inert.
    super({ pluginId: "time-arena", enabled: import.meta.env.DEV });
  }
}

/** Module-level singleton: one client per pluginId per the event-bus contract. */
export const timeArenaEvents = new TimeArenaEventClient();
