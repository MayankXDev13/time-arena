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
  const handleStartPause = async () => {
    if (isCompleted) {
      await reset();
    } else if (isRunning) {
      pause();
    } else if (elapsed === 0 || isCompleted) {
      await start();
    } else {
      resume();
    }
  };

  const getPlayButtonStyle = () => {
    return 'bg-primary text-primary-foreground hover:bg-primary/90';
  };

  return (
    <div className="flex items-center justify-center gap-6">
      <Button
        onClick={stop}
        disabled={!isRunning && elapsed === 0 && !isCompleted}
        size="lg"
        className={cn(
          'w-16 h-16 rounded-full border-2 transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'bg-secondary border-secondary-foreground/20 hover:bg-secondary/80',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <PiStopFill className="w-6 h-6 text-secondary-foreground" />
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
        onClick={async () => await reset()}
        disabled={!isRunning && elapsed === 0 && !isCompleted}
        size="lg"
        className={cn(
          'w-16 h-16 rounded-full border-2 transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'bg-secondary border-secondary-foreground/20 hover:bg-secondary/80',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <PiArrowCounterClockwiseFill className="w-6 h-6 text-secondary-foreground" />
      </Button>
    </div>
  );
}