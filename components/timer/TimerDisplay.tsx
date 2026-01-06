import { formatTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import type { TimerMode } from '@/stores/useTimerStore';

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
  const targetDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={cn(
          'text-7xl md:text-9xl font-mono font-bold tabular-nums tracking-tight',
          'transition-all duration-300',
          isRunning && 'animate-pulse',
          mode === 'work' ? 'text-white' : 'text-green-400',
          isCompleted && 'text-orange-500'
        )}
      >
        {isCompleted ? '00:00' : formatTime(elapsed)}
      </div>
      {isCompleted && (
        <div className="absolute -inset-4 rounded-full bg-orange-500/20 blur-2xl animate-pulse" />
      )}
      {isRunning && !isCompleted && (
        <div
          className={cn(
            'absolute -inset-4 rounded-full blur-2xl animate-pulse',
            mode === 'work' ? 'bg-orange-500/10' : 'bg-green-500/10'
          )}
        />
      )}
      <div className="mt-4 text-sm text-zinc-500">
        {isCompleted ? (
          <span className="text-orange-500 font-medium">Session Complete!</span>
        ) : (
          <>
            {mode === 'work' ? 'Focus time' : 'Break time'} • {Math.ceil(elapsed / 60)} min remaining
          </>
        )}
      </div>
      {isCompleted && (
        <div className="mt-2 text-xs text-zinc-500">
          Tap reset to start a new session
        </div>
      )}
    </div>
  );
}
