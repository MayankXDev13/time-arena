import { useTimer } from '@/hooks/useTimer';
import { formatTime } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { PiPlayFill, PiPauseFill, PiStopFill, PiArrowCounterClockwiseFill } from 'react-icons/pi';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  className?: string;
}

export function TimerDisplay({ className }: TimerDisplayProps) {
  const { elapsed, isRunning } = useTimer();

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'text-7xl md:text-9xl font-mono font-bold tabular-nums tracking-tight',
          'text-white transition-all duration-300',
          isRunning && 'animate-pulse'
        )}
      >
        {formatTime(elapsed)}
      </div>
      {isRunning && (
        <div className="absolute -inset-4 rounded-full bg-orange-500/10 blur-2xl animate-pulse" />
      )}
    </div>
  );
}
