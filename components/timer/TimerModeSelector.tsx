'use client';

import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { cn } from '@/lib/utils';
import { PiClockBold, PiCoffeeBold } from 'react-icons/pi';

export function TimerModeSelector() {
  const { mode, setMode, isRunning, workDuration, breakDuration } = useTimerStore();

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) {
      setMode(newMode);
    }
  };

  const modes = [
    {
      key: 'work' as TimerMode,
      label: 'Focus',
      duration: workDuration,
      icon: PiClockBold,
      colors: {
        active: 'bg-primary text-primary-foreground border-primary',
        inactive: 'bg-secondary text-secondary-foreground border-secondary-foreground/20 hover:bg-secondary/80',
      },
    },
    {
      key: 'break' as TimerMode,
      label: 'Break',
      duration: breakDuration,
      icon: PiCoffeeBold,
      colors: {
        active: 'bg-secondary text-secondary-foreground border-secondary',
        inactive: 'bg-secondary text-secondary-foreground border-secondary-foreground/20 hover:bg-secondary/80',
      },
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.key;

        return (
          <button
            key={m.key}
            onClick={() => handleModeChange(m.key)}
            disabled={isRunning}
            className={cn(
              'flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              'hover:scale-105 active:scale-95',
              isActive ? m.colors.active : m.colors.inactive
            )}
          >
            <Icon className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">{m.label}</div>
              <div className="text-xs opacity-90">{m.duration}m</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}