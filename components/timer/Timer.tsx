"use client";

import { useEffect } from "react";
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerModeSelector } from './TimerModeSelector';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { useTimer } from '@/hooks/useTimer';
import { useTimerStore } from '@/stores/useTimerStore';
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

function DurationStepper({
  label,
  value,
  onChange,
  disabled,
  min = 1,
  max = 180,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="font-numeral text-xs tabular-nums text-muted-foreground">{value} min per round</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 5))}
          className="size-8 rounded-lg"
        >
          <Minus className="size-4" />
        </Button>
        <span className="font-numeral w-10 text-center text-sm font-semibold tabular-nums">{value}m</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 5))}
          className="size-8 rounded-lg"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function Timer() {
  const { start, pause, resume, stop, reset } = useTimer();
  const {
    isRunning, elapsed, isCompleted, mode,
    workDuration, breakDuration,
    selectedCategoryId, setSelectedCategoryId,
    setWorkDuration, setBreakDuration,
  } = useTimerStore();

  const handleStop = async () => {
    await stop();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (isCompleted) void reset();
        else if (isRunning) pause();
        else if (elapsed === 0) void start();
        else resume();
      } else if (e.key === "r" || e.key === "R") {
        void reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, isCompleted, elapsed, start, pause, resume, reset]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <TimerModeSelector />

      <TimerDisplay
        elapsed={elapsed}
        isRunning={isRunning}
        isCompleted={isCompleted}
        mode={mode}
        workDuration={workDuration}
        breakDuration={breakDuration}
      />

      <div className="grid w-full max-w-[420px] gap-2.5">
        <div>
          <p id="timer-category-label" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Fighting for
          </p>
          <CategoryDropdown
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:max-w-none">
          <DurationStepper
            label="Focus"
            value={workDuration}
            onChange={setWorkDuration}
            disabled={isRunning}
          />
          <DurationStepper
            label="Break"
            value={breakDuration}
            onChange={setBreakDuration}
            disabled={isRunning}
            min={1}
            max={60}
          />
        </div>
        {isRunning && (
          <p className="text-center text-xs text-muted-foreground">
            Round length locks while the clock runs.
          </p>
        )}
      </div>

      <TimerControls
        isRunning={isRunning}
        elapsed={elapsed}
        isCompleted={isCompleted}
        start={start}
        pause={pause}
        resume={resume}
        stop={handleStop}
        reset={reset}
      />
    </div>
  );
}
