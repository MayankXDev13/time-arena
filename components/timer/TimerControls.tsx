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
  reset: () => void;
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
  const handleStartPause = () => {
    if (isCompleted) {
      reset();
    } else if (isRunning) {
      pause();
    } else if (elapsed === 0 || isCompleted) {
      start();
    } else {
      resume();
    }
  };

  const getPlayButtonStyle = () => {
    if (isCompleted) {
      return 'bg-green-500 text-white';
    }
    if (isRunning) {
      return 'bg-orange-500 text-white';
    }
    return 'bg-orange-500 text-white';
  };

  return (
    <div className="flex items-center justify-center gap-6 mt-12">
      <Button
        onClick={stop}
        disabled={!isRunning && elapsed === 0 && !isCompleted}
        size="lg"
        className={cn(
          'w-16 h-16 rounded-full border-2 transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <PiStopFill className="w-6 h-6 text-zinc-400" />
      </Button>

      <Button
        onClick={handleStartPause}
        size="lg"
        className={cn(
          'w-20 h-20 rounded-full transition-all duration-300 shadow-xl',
          'hover:scale-110 active:scale-95',
          getPlayButtonStyle()
        )}
      >
        {isCompleted ? (
          <PiArrowCounterClockwiseFill className="w-8 h-8" />
        ) : isRunning ? (
          <PiPauseFill className="w-8 h-8" />
        ) : (
          <PiPlayFill className="w-8 h-8 ml-1" />
        )}
      </Button>

      <Button
        onClick={reset}
        disabled={!isRunning && elapsed === 0 && !isCompleted}
        size="lg"
        className={cn(
          'w-16 h-16 rounded-full border-2 transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <PiArrowCounterClockwiseFill className="w-6 h-6 text-zinc-400" />
      </Button>
    </div>
  );
}