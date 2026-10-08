import { useEffect } from "react";
import { useTimerStore } from "@/stores/useTimerStore.js";
import { formatTime } from "@/utils/helpers.js";

const DEFAULT_TITLE = "Time Arena — Train your focus";

// Mirrors the live countdown into the browser tab title so the round stays
// visible when the tab is in the background.
export function useTimerDocumentTitle() {
  const mode = useTimerStore((s) => s.mode);
  const isRunning = useTimerStore((s) => s.isRunning);
  const elapsed = useTimerStore((s) => s.elapsed);
  const isCompleted = useTimerStore((s) => s.isCompleted);
  const workDuration = useTimerStore((s) => s.workDuration);
  const breakDuration = useTimerStore((s) => s.breakDuration);

  useEffect(() => {
    if (isRunning) {
      const target = (mode === "work" ? workDuration : breakDuration) * 60;
      const remaining = Math.max(0, target - elapsed);
      document.title = `${formatTime(remaining)} · ${mode === "work" ? "Focus" : "Break"} — Time Arena`;
    } else if (isCompleted) {
      document.title = "Round done — Time Arena";
    } else {
      document.title = DEFAULT_TITLE;
    }
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [isRunning, elapsed, isCompleted, mode, workDuration, breakDuration]);
}
