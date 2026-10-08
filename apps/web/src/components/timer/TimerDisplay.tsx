import { useEffect, useState } from "react";
import { formatTime } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/stores/useTimerStore";
import { CircularProgress } from "@/components/ui/circular-progress";

interface TimerDisplayProps {
  elapsed: number;
  isRunning: boolean;
  isCompleted: boolean;
  mode: TimerMode;
  workDuration: number;
  breakDuration: number;
}

// Short viewports (small laptops) get a compact dial so the whole card fits
// without scrolling. Tracks viewport height live.
function useCompactDial() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-height: 820px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-height: 820px)");
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return compact;
}

export function TimerDisplay({
  elapsed,
  isRunning,
  isCompleted,
  mode,
  workDuration,
  breakDuration,
}: TimerDisplayProps) {
  const targetDuration = mode === "work" ? workDuration * 60 : breakDuration * 60;
  const progress = targetDuration > 0 ? Math.min(1, elapsed / targetDuration) : 0;
  const remaining = Math.max(0, targetDuration - elapsed);
  const isBreak = mode === "break";
  const compact = useCompactDial();
  const status = isCompleted
    ? "Bell rung — banked"
    : isRunning
      ? isBreak
        ? "Live — recover"
        : "Live — stay in it"
      : elapsed > 0
        ? "Paused"
        : isBreak
          ? "Breathe"
          : "Touch the bell";

  return (
    <div className="relative flex flex-col items-center">
      <span className="sr-only" aria-live="polite">
        {isCompleted
          ? "Round complete"
          : isRunning
            ? isBreak
              ? "Resting"
              : "Focusing"
            : isBreak
              ? "Break ready"
              : "Round ready"}
        , {formatTime(remaining)} remaining
      </span>

      <CircularProgress
        progress={progress}
        size={compact ? 200 : 300}
        strokeWidth={compact ? 10 : 12}
        mode={mode}
        isRunning={isRunning}
        isCompleted={isCompleted}
      >
        <div className="relative px-6 text-center">
          <p
            className={cn(
              "font-display font-extrabold uppercase tracking-[0.24em]",
              compact ? "text-[10px]" : "text-[11px]",
              isBreak ? "text-[var(--arena-moss)]" : "text-[var(--arena-ember)]"
            )}
          >
            {isBreak ? "Break" : "Focus"}
          </p>
          <div
            className={cn(
              "font-numeral font-extrabold leading-none tabular-nums",
              compact ? "text-[46px]" : "text-[62px] md:text-[70px]",
              "text-foreground"
            )}
          >
            {formatTime(remaining)}
          </div>
          <div className="mx-auto mt-1.5 max-w-[220px] truncate whitespace-nowrap text-[13px] font-medium text-muted-foreground">
            {status}
          </div>
        </div>
      </CircularProgress>
    </div>
  );
}
