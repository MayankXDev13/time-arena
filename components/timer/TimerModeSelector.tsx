'use client';

import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { cn } from '@/lib/utils';

export function TimerModeSelector() {
  const { mode, setMode, isRunning } = useTimerStore();

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) {
      setMode(newMode);
    }
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-zinc-800 rounded-lg">
      <button
        onClick={() => handleModeChange('work')}
        disabled={isRunning}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mode === 'work'
            ? 'bg-orange-500 text-white'
            : 'text-zinc-400 hover:text-white'
        )}
      >
        Work
      </button>
      <button
        onClick={() => handleModeChange('break')}
        disabled={isRunning}
        className={cn(
          'px-4 py-2 rounded-md text-sm font-medium transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          mode === 'break'
            ? 'bg-green-500 text-white'
            : 'text-zinc-400 hover:text-white'
        )}
      >
        Break
      </button>
    </div>
  );
}
