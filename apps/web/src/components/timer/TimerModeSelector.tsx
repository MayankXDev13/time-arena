import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { cn } from '@/lib/utils';
import { Timer, Coffee } from 'lucide-react';

export function TimerModeSelector() {
  const { mode, setMode, isRunning, workDuration, breakDuration } = useTimerStore();

  const handleModeChange = (newMode: TimerMode) => {
    if (!isRunning) {
      setMode(newMode);
    }
  };

  const modes = [
    { key: 'work' as TimerMode, label: 'Focus', duration: workDuration, icon: Timer },
    { key: 'break' as TimerMode, label: 'Break', duration: breakDuration, icon: Coffee },
  ];

  return (
    <div
      role="tablist"
      aria-label="Timer mode"
      className="relative mx-auto grid w-full max-w-[400px] grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/60 p-1.5"
    >
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.key;
        return (
          <button
            key={m.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleModeChange(m.key)}
            disabled={isRunning}
            className={cn(
              'relative flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'focus-visible:outline-2 focus-visible:outline-ring',
              isActive
                ? 'bg-primary text-primary-foreground shadow-[0_10px_28px_-10px_var(--arena-ember)]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-bold">{m.label}</span>
              <span className={cn("font-numeral block text-xs tabular-nums", isActive ? "opacity-85" : "opacity-70")}>
                {m.duration}m round
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
