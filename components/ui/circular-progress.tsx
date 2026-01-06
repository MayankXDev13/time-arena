'use client';

import { cn } from '@/lib/utils';
import type { TimerMode } from '@/stores/useTimerStore';

interface CircularProgressProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  mode?: TimerMode;
  isRunning?: boolean;
  isCompleted?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 8,
  mode = 'work',
  isRunning = false,
  isCompleted = false,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const colors = {
    work: {
      track: 'stroke-zinc-800',
      progress: 'stroke-orange-500',
      glow: 'drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]',
    },
    break: {
      track: 'stroke-zinc-800',
      progress: 'stroke-green-500',
      glow: 'drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    },
    completed: {
      track: 'stroke-zinc-800',
      progress: 'stroke-orange-500',
      glow: 'drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]',
    },
  };

  const colorScheme = isCompleted ? colors.completed : colors[mode];

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={cn(
          'transform -rotate-90 transition-all duration-500',
          isRunning && 'scale-105',
          colorScheme.glow
        )}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colorScheme.track}
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
            colorScheme.progress,
            'transition-all duration-500 ease-out',
            isRunning && 'animate-pulse'
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
