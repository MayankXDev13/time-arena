import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { PiPlayFill, PiPauseFill, PiStopFill, PiArrowCounterClockwiseFill } from 'react-icons/pi';

export function TimerControls() {
  const { isRunning, start, pause, resume, stop, reset, elapsed } = useTimer();

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else if (elapsed === 0) {
      start();
    } else {
      resume();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        onClick={stop}
        disabled={!isRunning && elapsed === 0}
        variant="outline"
        size="lg"
        className="border-zinc-700 hover:bg-zinc-800 hover:text-orange-500 transition-colors"
      >
        <PiStopFill className="w-6 h-6" />
      </Button>

      <Button
        onClick={handleStartPause}
        size="lg"
        className="w-20 h-20 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25"
      >
        {isRunning ? (
          <PiPauseFill className="w-8 h-8" />
        ) : (
          <PiPlayFill className="w-8 h-8 ml-1" />
        )}
      </Button>

      <Button
        onClick={reset}
        disabled={!isRunning && elapsed === 0}
        variant="outline"
        size="lg"
        className="border-zinc-700 hover:bg-zinc-800 hover:text-orange-500 transition-colors"
      >
        <PiArrowCounterClockwiseFill className="w-6 h-6" />
      </Button>
    </div>
  );
}
