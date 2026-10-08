import { Button } from '@/components/ui/button';
import { PiPlayFill, PiPauseFill, PiStopFill, PiArrowCounterClockwiseFill } from 'react-icons/pi';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  elapsed: number;
  isCompleted: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  reset: () => Promise<void>;
}

export function TimerControls({
  isRunning,
  elapsed,
  isCompleted,
  start,
  pause,
  resume,
  stop,
  reset,
}: TimerControlsProps) {
  const idle = !isRunning && elapsed === 0 && !isCompleted;

  const handleStartPause = async () => {
    if (isCompleted) {
      await reset();
    } else if (isRunning) {
      pause();
    } else if (elapsed === 0) {
      await start();
    } else {
      resume();
    }
  };

  const primaryLabel = isCompleted ? "Start new round" : isRunning ? "Pause" : elapsed === 0 ? "Start Round" : "Resume";

  if (idle) {
    return (
      <div className="flex flex-col items-center">
        <Button
          onClick={handleStartPause}
          size="lg"
          aria-label="Start round"
          title="Start round (Space)"
          className={cn(
            'h-12 rounded-xl bg-primary px-8 text-[15px] font-bold text-primary-foreground transition-all duration-200',
            'shadow-[0_18px_44px_-12px_var(--arena-ember)]',
            'hover:scale-[1.03] hover:brightness-105 active:scale-95'
          )}
        >
          <PiPlayFill className="size-4 translate-x-[1px]" aria-hidden />
          Start Round
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-4 sm:gap-5">
        <div className="flex w-[76px] flex-col items-center gap-1.5">
          <Button
            onClick={stop}
            disabled={idle}
            size="lg"
            variant="secondary"
            aria-label="Stop and save session"
            title="Stop and save"
            className={cn(
              'size-14 rounded-2xl border transition-all duration-200',
              'hover:scale-[1.04] active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-45'
            )}
          >
            <PiStopFill className="size-5" aria-hidden />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">Stop</span>
        </div>

        <div className="flex w-[104px] flex-col items-center gap-1.5">
          <Button
            onClick={handleStartPause}
            size="lg"
            aria-label={primaryLabel}
            title={`${primaryLabel} (Space)`}
            className={cn(
              'size-20 rounded-[26px] bg-primary text-primary-foreground transition-all duration-200',
              'shadow-[0_18px_44px_-12px_var(--arena-ember)]',
              'hover:scale-[1.04] hover:brightness-105 active:scale-95'
            )}
          >
            {isCompleted ? (
              <PiArrowCounterClockwiseFill className="size-7" aria-hidden />
            ) : isRunning ? (
              <PiPauseFill className="size-7" aria-hidden />
            ) : (
              <PiPlayFill className="size-7 translate-x-[2px]" aria-hidden />
            )}
          </Button>
          <span className="text-xs font-semibold text-foreground">{primaryLabel}</span>
        </div>

        <div className="flex w-[76px] flex-col items-center gap-1.5">
          <Button
            onClick={async () => await reset()}
            disabled={idle}
            size="lg"
            variant="secondary"
            aria-label="Reset timer"
            title="Reset"
            className={cn(
              'size-14 rounded-2xl border transition-all duration-200',
              'hover:scale-[1.04] active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-45'
            )}
          >
            <PiArrowCounterClockwiseFill className="size-5" aria-hidden />
          </Button>
          <span className="text-xs font-medium text-muted-foreground">Reset</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Press <kbd className="font-numeral rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px]">Space</kbd> to {isRunning ? "pause" : "start"} · <kbd className="font-numeral rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px]">R</kbd> to reset
      </p>
    </div>
  );
}
