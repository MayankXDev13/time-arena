import { formatTime } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import type { TimerMode } from '@/stores/useTimerStore';
import { CircularProgress } from '@/components/ui/circular-progress';

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
  const progress = targetDuration > 0 ? Math.min(1, elapsed / targetDuration) : 0;

  return (
    <div className="relative flex flex-col items-center">
      <CircularProgress
        progress={progress}
        size={320}
        strokeWidth={12}
        mode={mode}
        isRunning={isRunning}
        isCompleted={isCompleted}
      >
        <div className="text-center">
          <div
            className={cn(
              'text-6xl md:text-8xl font-mono font-bold tabular-nums tracking-tight',
              'transition-all duration-300',
              isRunning && 'animate-pulse',
              mode === 'work' ? 'text-white' : 'text-green-400',
              isCompleted && 'text-orange-500'
            )}
          >
            {isCompleted ? formatTime(targetDuration) : formatTime(elapsed)}
          </div>
        </div>
      </CircularProgress>

      {isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-mono font-bold text-orange-500 animate-pulse">
              00:00
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="text-sm text-zinc-500">
          {isCompleted ? (
            <span className="text-orange-500 font-medium">Session Complete!</span>
          ) : (
            <>
              {mode === 'work' ? 'Focus time' : 'Break time'} • {Math.floor(elapsed / 60)} min elapsed
            </>
          )}
        </div>
        {isCompleted && (
          <div className="mt-2 text-xs text-zinc-500">
            Tap reset to start a new session
          </div>
        )}
      </div>
    </div>
  );
}