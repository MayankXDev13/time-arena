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

const colorLevels = [
  { threshold: 0, className: 'bg-zinc-800' },
  { threshold: 15, className: 'bg-orange-900/30' },
  { threshold: 30, className: 'bg-orange-800/50' },
  { threshold: 60, className: 'bg-orange-600/70' },
  { threshold: 120, className: 'bg-orange-500' },
];

function getColorClass(minutes: number): string {
  for (const level of colorLevels.slice().reverse()) {
    if (minutes >= level.threshold) {
      return level.className;
    }
  }
  return colorLevels[0].className;
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

function HeatmapCell({ day, colorClass, isToday, onClick }: { day: DailyData; colorClass: string; isToday: boolean; onClick: () => void }) {
  const formattedDate = format(new Date(day.dateStr), 'MMM d, yyyy');
  const timeDisplay = day.minutes < 1
    ? `${Math.round(day.minutes * 60)}s`
    : day.minutes < 60
    ? `${Math.round(day.minutes)}m`
    : `${Math.floor(day.minutes / 60)}h ${Math.round(day.minutes % 60)}m`;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'w-2 h-2 rounded-[1px] transition-all cursor-pointer hover:ring-1 hover:ring-white hover:ring-offset-0.5 hover:ring-offset-black',
            colorClass,
            isToday && 'ring-1 ring-white ring-offset-0.5 ring-offset-black'
          )}
          style={{ width: '8px', height: '8px' }}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="z-50 overflow-hidden rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white shadow-md border border-zinc-800">
          <div className="text-sm">
            <div className="font-medium">{formattedDate}</div>
            <div className="text-zinc-400">{timeDisplay}</div>
          </div>
          <Tooltip.Arrow className="fill-zinc-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>Less</span>
      {colorLevels.map((level, i) => (
        <div
          key={i}
          className={cn('w-3 h-3 rounded-sm', level.className)}
        />
      ))}
      <span>More</span>
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
              <h3 className="text-lg font-semibold text-white">Activity</h3>
              <p className="text-sm text-zinc-400">
                {Math.round(selectedYearMinutes)}m in {selectedYear} • {Math.round(todayMinutes)}m today
              </p>
            </div>
          </div>
          <HeatmapLegend />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-500">{selectedYear}</h4>
          <div className="flex">
            <div className="flex flex-col justify-between pr-2 py-1">
              {dayLabels.map((label, i) => (
                <div
                  key={i}
                  className="h-2 text-[8px] text-zinc-600 flex items-center"
                  style={{ height: '8px' }}
                >
                  {i % 2 === 0 ? label : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-px overflow-x-auto">
              {yearData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-px">
                  {week.days.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-2 h-2"
                          style={{ width: '8px', height: '8px' }}
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
                  {weekIndex % 4 === 0 && week.monthLabel && (
                    <div className="text-[8px] text-zinc-600 text-center pt-0.5">
                      {week.monthLabel}
                    </div>
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
