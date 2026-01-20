"use client";

import { cn } from "@/lib/utils";
import type { TimerMode } from "@/stores/useTimerStore";

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  mode: TimerMode;
  isRunning: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
}

export function CircularProgress({
  progress,
  size,
  strokeWidth,
  mode,
  isRunning,
  isCompleted,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const strokeColor = mode === 'work' ? 'stroke-primary' : 'stroke-secondary-foreground';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            strokeColor,
            'transition-all duration-300 ease-out',
            isRunning && 'animate-pulse',
            isCompleted && 'stroke-primary'
          )}
        />
      </svg>
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}