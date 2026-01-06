'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Session } from '@/types';
import { cn } from '@/lib/utils';
import { format, startOfYear, endOfYear, eachDayOfInterval, getISOWeek, isSameDay, getMonth } from 'date-fns';
import * as Tooltip from '@radix-ui/react-tooltip';
import { YearSelector } from './YearSelector';

interface ActivityHeatmapProps {
  sessions: Session[];
  className?: string;
}

interface DailyData {
  date: Date;
  dateStr: string;
  minutes: number;
  sessions: Session[];
}

interface WeekData {
  weekNumber: number;
  days: (DailyData | null)[];
  monthLabel?: string;
}

interface YearData {
  year: number;
  weeks: WeekData[];
}

// Subtle activity levels with clear progression (app theme)
const colorLevels = [
  { level: 0, threshold: 0, className: 'bg-zinc-800 hover:bg-zinc-700', label: 'No activity' },
  { level: 1, threshold: 5, className: 'bg-orange-900/40 hover:bg-orange-800/50', label: 'Low activity' },
  { level: 2, threshold: 15, className: 'bg-orange-800/50 hover:bg-orange-700/60', label: 'Light activity' },
  { level: 3, threshold: 30, className: 'bg-orange-700/60 hover:bg-orange-600/70', label: 'Medium activity' },
  { level: 4, threshold: 60, className: 'bg-orange-600/70 hover:bg-orange-500/80', label: 'High activity' },
];

function getColorClass(minutes: number): string {
  for (const level of colorLevels.slice().reverse()) {
    if (minutes >= level.threshold) {
      return level.className;
    }
  }
  return colorLevels[0].className;
}

function getActivityLevel(minutes: number): number {
  for (const level of colorLevels.slice().reverse()) {
    if (minutes >= level.threshold) {
      return level.level;
    }
  }
  return 0;
}

function generateYearData(year: number, sessions: Session[]): YearData {
  const dailyMap = new Map<string, DailyData>();

  for (const session of sessions) {
    if (!session.endedAt) continue;
    const sessionYear = new Date(session.start).getFullYear();
    if (sessionYear !== year) continue;
    
    const dateStr = format(new Date(session.start), 'yyyy-MM-dd');
    const existing = dailyMap.get(dateStr);
    if (existing) {
      existing.minutes += session.duration / 60;
      existing.sessions.push(session);
    } else {
      dailyMap.set(dateStr, {
        date: new Date(session.start),
        dateStr,
        minutes: session.duration / 60,
        sessions: [session],
      });
    }
  }

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  const weeks: WeekData[] = [];
  let currentWeek: WeekData | null = null;
  let currentWeekNumber = -1;
  let lastMonth = -1;

  for (const day of allDays) {
    const weekNumber = getISOWeek(day);
    const month = getMonth(day);

    if (currentWeekNumber !== weekNumber) {
      if (currentWeek) {
        while (currentWeek.days.length < 7) {
          currentWeek.days.push(null);
        }
        weeks.push(currentWeek);
      }
      currentWeek = {
        weekNumber,
        days: [],
        monthLabel: month !== lastMonth ? format(day, 'MMM') : undefined,
      };
      currentWeekNumber = weekNumber;
      lastMonth = month;
    }

    const dateStr = format(day, 'yyyy-MM-dd');
    const dailyData = dailyMap.get(dateStr) || {
      date: day,
      dateStr,
      minutes: 0,
      sessions: [],
    };
    if (currentWeek) {
      currentWeek.days.push(dailyData);
    }
  }

  if (currentWeek) {
    while (currentWeek.days.length < 7) {
      currentWeek.days.push(null);
    }
    weeks.push(currentWeek);
  }

  return { year, weeks };
}

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function HeatmapCell({ day, colorClass, isToday, onClick }: { day: DailyData; colorClass: string; isToday: boolean; onClick: () => void }) {
  const formattedDate = format(new Date(day.dateStr), 'MMM d, yyyy');
  const timeDisplay = day.minutes < 1
    ? `${Math.round(day.minutes * 60)}s`
    : day.minutes < 60
    ? `${Math.round(day.minutes)}m`
    : `${Math.floor(day.minutes / 60)}h ${Math.round(day.minutes % 60)}m`;

  const activityLevel = getActivityLevel(day.minutes);

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'w-3 h-3 rounded-[2px] transition-all duration-150 cursor-pointer',
            'hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-orange-400/50',
            colorClass,
            isToday && 'ring-1 ring-orange-400 ring-offset-1 ring-offset-zinc-900'
          )}
          style={{ width: '12px', height: '12px' }}
          aria-label={`${formattedDate}: ${timeDisplay} of activity`}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="z-50 overflow-hidden rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white shadow-lg border border-zinc-700/50">
          <div className="text-center">
            <div className="font-medium text-zinc-100">{timeDisplay}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{formattedDate}</div>
          </div>
          <Tooltip.Arrow className="fill-zinc-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-zinc-500">Less</span>
      {colorLevels.slice(1).map((level, i) => (
        <div
          key={i}
          className={cn('w-2.5 h-2.5 rounded-[1px]', level.className)}
          title={level.label}
        />
      ))}
      <span className="text-zinc-500 ml-1">More</span>
    </div>
  );
}

function DaySessionsModal({ date, sessions, minutes, onClose }: { date: string; sessions: Session[]; minutes: number; onClose: () => void }) {
  const formattedDate = format(new Date(date), 'EEEE, MMMM d, yyyy');
  const timeDisplay = minutes < 1
    ? `${Math.round(minutes * 60)}s`
    : minutes < 60
    ? `${Math.round(minutes)}m`
    : `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-2">{formattedDate}</h3>
        <p className="text-orange-500 font-medium mb-4">{timeDisplay}</p>
        {sessions.length === 0 ? (
          <p className="text-zinc-500">No sessions recorded</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.map((session) => (
              <div key={session.id} className="flex justify-between text-sm text-zinc-400 p-2 bg-zinc-800 rounded">
                <span>{format(new Date(session.start), 'h:mm a')}</span>
                <span>{Math.round(session.duration / 60)}m</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function ActivityHeatmap({ sessions, className }: ActivityHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  }, []);

  const yearData = useMemo(() => {
    return generateYearData(selectedYear, sessions);
  }, [selectedYear, sessions]);

  const selectedYearMinutes = useMemo(() => {
    return sessions
      .filter(s => s.endedAt && new Date(s.start).getFullYear() === selectedYear)
      .reduce((acc, s) => acc + s.duration / 60, 0);
  }, [sessions, selectedYear]);

  const todayMinutes = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    for (const session of sessions) {
      if (!session.endedAt) continue;
      const dateStr = format(new Date(session.start), 'yyyy-MM-dd');
      if (dateStr === today) {
        return session.duration / 60;
      }
    }
    return 0;
  }, [sessions]);

  const totalMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.duration / 60, 0);
  }, [sessions]);

  return (
    <Tooltip.Provider>
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <YearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              years={years}
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedYear}</h3>
              <p className="text-sm text-zinc-400">
                {Math.round(selectedYearMinutes)} minutes
              </p>
            </div>
          </div>
          <HeatmapLegend />
        </div>

        <div className="space-y-2">
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col justify-between pr-1 py-0.5 min-w-[18px]">
              {dayLabelsShort.map((label, i) => (
                <div
                  key={i}
                  className="h-3 text-[9px] text-zinc-500 flex items-center justify-end font-medium leading-none"
                  style={{ height: '12px' }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5 overflow-x-auto">
              {yearData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.days.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-3 h-3"
                          style={{ width: '12px', height: '12px' }}
                        />
                      );
                    }
                    return (
                      <HeatmapCell
                        key={day.dateStr}
                        day={day}
                        colorClass={getColorClass(day.minutes)}
                        isToday={isSameDay(day.date, new Date()) && day.date.getFullYear() === selectedYear}
                        onClick={() => setSelectedDay(day)}
                      />
                    );
                  })}

                  {/* Month labels */}
                  {weekIndex % 4 === 0 && week.monthLabel && (
                    <div className="text-[10px] text-zinc-500 font-medium text-center pt-2 leading-tight min-h-[16px] flex items-center justify-center">
                      {week.monthLabel}
                    </div>
                  )}
                  {weekIndex % 4 !== 0 && (
                    <div className="min-h-[16px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedDay && (
          <DaySessionsModal
            date={selectedDay.dateStr}
            sessions={selectedDay.sessions}
            minutes={selectedDay.minutes}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </div>
    </Tooltip.Provider>
  );
}
