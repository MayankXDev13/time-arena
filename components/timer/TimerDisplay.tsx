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
        size={300}
        strokeWidth={12}
        mode={mode}
        isRunning={isRunning}
        isCompleted={isCompleted}
      >
        <div className="relative text-center">
          <div
            className={cn(
              "font-numeral text-[60px] md:text-[68px] font-bold leading-none tabular-nums",
              "text-foreground"
            )}
          >
            {formatTime(remaining)}
          </div>
          <div className="absolute inset-x-0 top-full mt-2 whitespace-nowrap text-sm text-muted-foreground">
            {isBreak ? "Break Time" : "Focus Round"}
          </div>
        </div>
      </CircularProgress>
    </div>
  );
}
