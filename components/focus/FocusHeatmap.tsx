"use client";

import { useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfYear, endOfYear, eachDayOfInterval, getDay, getMonth, startOfWeek, endOfWeek, isSameMonth, isToday } from "date-fns";
import { formatTime } from "@/lib/constants";

interface HeatmapData {
  date: string;
  minutes: number;
  sessions: number;
}

interface FocusHeatmapProps {
  data: HeatmapData[];
  onFilterChange?: (days: number) => void;
}

const INTENSITY_COLORS = [
  "bg-muted",
  "bg-rose-300",
  "bg-rose-400",
  "bg-rose-500",
  "bg-rose-600",
  "bg-rose-700",
];

const INTENSITY_THRESHOLDS = [0, 30, 60, 120, 180, 300];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0;
  for (let i = INTENSITY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (minutes >= INTENSITY_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  return format(date, "MMM d, yyyy");
}

function formatMinutes(minutes: number): string {
  if (minutes === 0) return "No focus time";
  return formatTime(minutes);
}

export function FocusHeatmap({ data, onFilterChange }: FocusHeatmapProps) {
  const [filterDays, setFilterDays] = useState(365);

  const handleFilterChange = (days: number) => {
    setFilterDays(days);
    onFilterChange?.(days);
  };

  const { gridData, monthLabels, totalMinutes, totalSessions, maxMinutes } = useMemo(() => {
    const today = new Date();
    const startDate = startOfYear(subDays(today, 364));
    const endDate = endOfYear(today);

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const dataMap = new Map<string, HeatmapData>();
    data.forEach((d) => dataMap.set(d.date, d));

    const grid: (HeatmapData | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(Math.ceil(allDays.length / 7)).fill(null));

    const monthLabels: { label: string; index: number }[] = [];

    allDays.forEach((date, i) => {
      const weekIndex = Math.floor(i / 7);
      const dayIndex = getDay(date);
      const dateStr = format(date, "yyyy-MM-dd");

      grid[dayIndex][weekIndex] = dataMap.get(dateStr) || {
        date: dateStr,
        minutes: 0,
        sessions: 0,
      };
    });

    let currentMonth = -1;
    grid[0].forEach((cell, weekIndex) => {
      if (cell) {
        const month = getMonth(new Date(cell.date));
        if (month !== currentMonth) {
          currentMonth = month;
          monthLabels.push({
            label: format(new Date(cell.date), "MMM"),
            index: weekIndex,
          });
        }
      }
    });

    let totalMins = 0;
    let totalSess = 0;
    let maxMins = 0;

    data.forEach((d) => {
      totalMins += d.minutes;
      totalSess += d.sessions;
      if (d.minutes > maxMins) maxMins = d.minutes;
    });

    return {
      gridData: grid,
      monthLabels,
      totalMinutes: totalMins,
      totalSessions: totalSess,
      maxMinutes: maxMins,
    };
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Focus Activity</CardTitle>
            <CardDescription>
              {formatTime(totalMinutes)} across {totalSessions} sessions in the last year
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {[
              { label: "7D", days: 7 },
              { label: "30D", days: 30 },
              { label: "90D", days: 90 },
              { label: "365D", days: 365 },
            ].map(({ label, days }) => (
              <Button
                key={days}
                variant={filterDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(days)}
                className="h-7 px-2 text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tooltip.Provider delayDuration={200}>
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full">
              <div className="flex">
                <div className="flex flex-col justify-between pr-2 pt-5 pb-1">
                  {DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="h-3 text-[10px] text-muted-foreground font-medium"
                      style={{ lineHeight: "12px" }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex mb-1 ml-1">
                    {gridData[0].map((_, weekIndex) => {
                      const monthLabel = monthLabels.find((m) => m.index === weekIndex);
                      return (
                        <div
                          key={weekIndex}
                          className="w-3 text-[10px] text-muted-foreground font-medium text-center"
                          style={{ marginLeft: weekIndex === 0 ? "0" : "0" }}
                        >
                          {monthLabel?.label || ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-[3px]">
                    {gridData[0].map((_, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[3px]">
                        {gridData.map((day) => {
                          const cell = day[weekIndex];
                          const intensity = cell ? getIntensity(cell.minutes) : 0;
                          const date = cell ? new Date(cell.date) : null;

                          return (
                            <Tooltip.Root key={`${weekIndex}-${day[0]?.date || weekIndex}`}>
                              <Tooltip.Trigger asChild>
                                <div
                                  className={cn(
                                    "w-3 h-3 rounded-[2px] cursor-pointer transition-all duration-150",
                                    "hover:ring-2 hover:ring-rose-400 hover:ring-offset-1 hover:ring-offset-background",
                                    INTENSITY_COLORS[intensity]
                                  )}
                                />
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  className={cn(
                                    "z-50 px-3 py-2 rounded-lg shadow-xl border",
                                    "bg-popover text-popover-foreground",
                                    "animate-in fade-in zoom-in-95 duration-150"
                                  )}
                                  sideOffset={5}
                                >
                                  {cell && date && (
                                    <div className="space-y-1">
                                      <div className="text-sm font-semibold">
                                        {formatDateLabel(cell.date)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {formatMinutes(cell.minutes)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {cell.sessions} session{cell.sessions !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  )}
                                  <Tooltip.Arrow className="fill-popover" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div
                key={i}
                className={cn("w-3 h-3 rounded-[2px]", color)}
              />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </Tooltip.Provider>
      </CardContent>
    </Card>
  );
}
