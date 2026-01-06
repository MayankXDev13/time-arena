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

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        onClick={stop}
        disabled={!isRunning && elapsed === 0 && !isCompleted}
        variant="outline"
        size="lg"
        className="border-zinc-700 hover:bg-zinc-800 hover:text-orange-500 transition-colors"
      >
        <PiStopFill className="w-6 h-6" />
      </Button>

      <Button
        onClick={handleStartPause}
        size="lg"
        className={cn(
          'w-20 h-20 rounded-full text-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg',
          isCompleted
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : isRunning
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
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
        variant="outline"
        size="lg"
        className="border-zinc-700 hover:bg-zinc-800 hover:text-orange-500 transition-colors"
      >
        <PiArrowCounterClockwiseFill className="w-6 h-6" />
      </Button>
    </div>
  );
}
