"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/stores/useTimerStore";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  mode: TimerMode;
  isRunning: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

const TICKS = 60;

export function CircularProgress({
  progress,
  size = 320,
  strokeWidth = 12,
  mode,
  isRunning,
  isCompleted,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2 - 14;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - Math.min(1, Math.max(0, progress)) * circumference;

  const ticks = useMemo(() => {
    return Array.from({ length: TICKS }, (_, i) => {
      const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
      const isQuarter = i % 15 === 0;
      const isFive = i % 5 === 0;
      const inner = isQuarter ? 14 : isFive ? 10 : 7;
      const outer = 2;
      const cx = size / 2;
      const cy = size / 2;
      const rOuter = size / 2 - outer;
      const rInner = rOuter - inner;
      return {
        x1: cx + rInner * Math.cos(angle),
        y1: cy + rInner * Math.sin(angle),
        x2: cx + rOuter * Math.cos(angle),
        y2: cy + rOuter * Math.sin(angle),
        lit: i / TICKS <= progress,
        isQuarter,
      };
    });
  }, [progress, size]);

  const isBreak = mode === "break";
  const glow = isCompleted
    ? "drop-shadow(0 0 28px color-mix(in srgb, var(--arena-ember) 55%, transparent))"
    : isRunning
      ? isBreak
        ? "drop-shadow(0 0 24px color-mix(in srgb, var(--arena-moss) 50%, transparent))"
        : "drop-shadow(0 0 24px color-mix(in srgb, var(--arena-ember) 50%, transparent))"
      : "none";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, filter: glow }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label={isBreak ? "Break progress" : "Focus progress"}
    >
      <svg
        width={size}
        height={size}
        className={cn("-rotate-0", isRunning && !isCompleted && "animate-arena-breathe")}
        aria-hidden
      >
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="currentColor"
            strokeWidth={t.isQuarter ? 3 : 2}
            strokeLinecap="round"
            className={cn(
              "transition-colors duration-300",
              t.lit
                ? isBreak
                  ? "text-[var(--arena-moss)]"
                  : "text-[var(--arena-ember)]"
                : "text-muted-foreground/25"
            )}
            opacity={t.lit ? 1 : 0.7}
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn(
            "transition-all duration-500 ease-out",
            isBreak ? "text-[var(--arena-moss)]" : "text-[var(--arena-ember)]"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
