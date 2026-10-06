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

  return (
    <div className="relative flex flex-col items-center">
      <p
        aria-live="polite"
        className={cn(
          "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
          isBreak
            ? "border-[var(--arena-moss)]/30 bg-[var(--arena-moss-soft)] text-[var(--arena-moss)]"
            : "border-[var(--arena-ember)]/30 bg-[var(--arena-ember-soft)] text-[var(--arena-ember)]"
        )}
      >
        <span aria-hidden className={cn("size-1.5 rounded-full", isRunning && "animate-pulse", isBreak ? "bg-[var(--arena-moss)]" : "bg-[var(--arena-ember)]")} />
        {isCompleted ? "Round complete" : isRunning ? (isBreak ? "Resting — stay loose" : "In the arena") : isBreak ? "Break ready" : "Round ready"}
      </p>

      <CircularProgress
        progress={progress}
        size={320}
        strokeWidth={10}
        mode={mode}
        isRunning={isRunning}
        isCompleted={isCompleted}
      >
        <div className="text-center">
          <div
            className={cn(
              "font-numeral text-[64px] md:text-[76px] font-semibold leading-none tabular-nums",
              "text-foreground"
            )}
            aria-live="off"
          >
            {isCompleted ? formatTime(targetDuration) : formatTime(elapsed)}
          </div>
          <div className="font-numeral mt-2 text-sm tabular-nums text-muted-foreground">
            {isCompleted
              ? "Tap reset to go again"
              : `${formatTime(remaining)} left of ${Math.round(targetDuration / 60)}m`}
          </div>
        </div>
      </CircularProgress>

      <div className="mt-5 text-center" aria-live="polite">
        {isCompleted ? (
          <p className="text-sm font-medium text-primary">Session complete. Log it and recover.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isBreak ? "Rest" : "Focus"} · {Math.floor(elapsed / 60)} min in ·{" "}
            {Math.round(progress * 100)}% of round
          </p>
        )}
      </div>
    </div>
  );
}
