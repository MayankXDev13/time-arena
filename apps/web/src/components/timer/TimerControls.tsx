import { Button } from '@/components/ui/button';
import { PiPlayFill, PiPauseFill, PiStopFill, PiArrowCounterClockwiseFill } from 'react-icons/pi';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isRunning: boolean;
  isStarting: boolean;
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
  isStarting,
  elapsed,
  isCompleted,
  start,
  pause,
  resume,
  stop,
  reset,
}: TimerControlsProps) {
  // Stop/Reset exist only once a session has started (running, paused or
  // done) — never while idle or while the create-session request is pending.
  // The fixed min-h below keeps the card height identical in both states.
  const hasSession = isRunning || elapsed > 0 || isCompleted;

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

  const primaryLabel = isStarting
    ? "Starting…"
    : isCompleted
      ? "Start new round"
      : isRunning
        ? "Pause"
        : elapsed === 0
          ? "Start round"
          : "Resume";
  const primaryIcon = isStarting ? (
    <Loader2 className="size-7 animate-spin" aria-hidden />
  ) : isCompleted ? (
    <PiArrowCounterClockwiseFill className="size-7" aria-hidden />
  ) : isRunning ? (
    <PiPauseFill className="size-7" aria-hidden />
  ) : (
    <PiPlayFill className="size-7 translate-x-[2px]" aria-hidden />
  );

  // Stop/Reset exist only once a session has started: never while idle or
  // pending. The fixed min-h below keeps the card height identical anyway.
  return (
    <div className="flex min-h-[144px] flex-col items-center justify-start gap-3">
      <div className="flex items-center justify-center gap-4 sm:gap-5">
        {hasSession && (
          <div className="flex w-[76px] flex-col items-center gap-1.5">
            <Button
              onClick={stop}
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
        )}

        <div className="flex w-[104px] flex-col items-center gap-1.5">
          <Button
            onClick={handleStartPause}
            disabled={isStarting}
            size="lg"
            aria-label={primaryLabel}
            title={isStarting ? primaryLabel : `${primaryLabel} (Space)`}
            aria-busy={isStarting}
            className={cn(
              'size-20 rounded-[26px] bg-primary text-primary-foreground transition-all duration-200',
              'shadow-[0_18px_44px_-12px_var(--arena-ember)]',
              'hover:scale-[1.04] hover:brightness-105 active:scale-95',
              'disabled:cursor-wait disabled:opacity-80 disabled:hover:scale-100'
            )}
          >
            {primaryIcon}
          </Button>
          <span className="text-xs font-semibold text-foreground">{primaryLabel}</span>
        </div>

        {hasSession && (
          <div className="flex w-[76px] flex-col items-center gap-1.5">
            <Button
              onClick={async () => await reset()}
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
        )}
      </div>
      <p className="arena-hide-short text-xs text-muted-foreground">
        Press <kbd className="kbd">Space</kbd> to {isRunning ? "pause" : "start"} · <kbd className="kbd">R</kbd> to reset
      </p>
    </div>
  );
}
