import { useTimerStore, TimerMode } from '@/stores/useTimerStore';
import { cn } from '@/lib/utils';
import { Timer, Coffee } from 'lucide-react';

export function TimerModeSelector() {
  const { mode, setMode, isRunning, isStarting, workDuration, breakDuration } = useTimerStore();
  const locked = isRunning || isStarting;

  const handleModeChange = (newMode: TimerMode) => {
    if (!locked) {
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
      className="relative mx-auto grid w-full max-w-[400px] grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/70 p-1 shadow-[inset_0_1px_0_color-mix(in_srgb,white_40%,transparent)] dark:shadow-none"
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
            disabled={locked}
            className={cn(
              'relative flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-all duration-200',
              'disabled:cursor-not-allowed disabled:opacity-60',
              'focus-visible:outline-2 focus-visible:outline-ring',
              isActive
                ? 'bg-card text-foreground shadow-[0_10px_28px_-12px_color-mix(in_srgb,var(--arena-ember)_60%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--arena-ember)_30%,transparent)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full transition-colors",
                isActive ? (m.key === "break" ? "bg-[var(--arena-moss)]" : "bg-[var(--arena-ember)]") : "bg-muted-foreground/30"
              )}
            />
            <Icon className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
            <span className="text-left leading-tight">
              <span className="font-display block text-[15px] font-extrabold uppercase tracking-tight">{m.label}</span>
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
