"use client";

import { useMemo, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addDays,
  getMonth,
  isToday,
} from "date-fns";

import { formatTime } from "@/lib/constants";

interface HeatmapData {
  date: string; // "yyyy-MM-dd"
  minutes: number;
  sessions: number;
}

interface FocusHeatmapProps {
  data: HeatmapData[];
  onYearChange?: (year: number) => void;
}

const INTENSITY_COLORS = [
  "bg-muted/40 border border-border/60",
  "bg-rose-300/70 border border-rose-300/30",
  "bg-rose-400/80 border border-rose-400/30",
  "bg-rose-500/90 border border-rose-500/30",
  "bg-rose-600 border border-rose-600/30",
];

const THRESHOLDS = [0, 30, 60, 120, 240];

function getIntensity(minutes: number) {
  if (minutes <= 0) return 0;
  if (minutes < THRESHOLDS[1]) return 1;
  if (minutes < THRESHOLDS[2]) return 2;
  if (minutes < THRESHOLDS[3]) return 3;
  return 4;
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

// ✅ Monday-first mapping
const GITHUB_DAY_LABELS = [
  { row: 0, label: "Mon" },
  { row: 2, label: "Wed" },
  { row: 4, label: "Fri" },
];

const TILE = 11;
const GAP = 3;

export function FocusHeatmap({ data, onYearChange }: FocusHeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearOptions = [currentYear - 1, currentYear];

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  const { weeks, monthLabels, totalMinutes, totalSessions } = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));

    // ✅ Monday start
    const gridStart = startOfWeek(yearStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(yearEnd, { weekStartsOn: 1 });

    const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const dataMap = new Map<string, HeatmapData>();
    for (const d of data) dataMap.set(d.date, d);

    const weekCount = Math.ceil(allDays.length / 7);

    const weeks: HeatmapData[][] = Array.from({ length: weekCount }, (_, w) => {
      const weekStart = addDays(gridStart, w * 7);

      // ✅ rows = Mon..Sun
      return Array.from({ length: 7 }, (_, row) => {
        const date = addDays(weekStart, row);
        const dateStr = format(date, "yyyy-MM-dd");

        return (
          dataMap.get(dateStr) || {
            date: dateStr,
            minutes: 0,
            sessions: 0,
          }
        );
      });
    });

    // ✅ month markers (first in-year day in each week)
    const monthLabels: { index: number; label: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks.length; w++) {
      const week = weeks[w];

      const firstInYear = week.find((d) => {
        const dt = new Date(d.date);
        return dt.getFullYear() === selectedYear;
      });

      if (!firstInYear) continue;

      const m = getMonth(new Date(firstInYear.date));
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({
          index: w,
          label: format(new Date(firstInYear.date), "MMM"),
        });
      }
    }

    let totalMinutes = 0;
    let totalSessions = 0;
    for (const d of data) {
      totalMinutes += d.minutes;
      totalSessions += d.sessions;
    }

    return { weeks, monthLabels, totalMinutes, totalSessions };
  }, [data, selectedYear]);

  const gridHeight = 7 * TILE + 6 * GAP;
  const gridWidth = weeks.length * (TILE + GAP);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Focus Activity</CardTitle>
            <CardDescription className="text-xs">
              {totalSessions} sessions • {formatTime(totalMinutes)} in{" "}
              {selectedYear}
            </CardDescription>
          </div>

          <div className="flex gap-1">
            {yearOptions.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => handleYearChange(year)}
                className="h-7 px-3 text-xs"
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tooltip.Provider delayDuration={120}>
          <div className="overflow-x-auto heatmap-scroll">
            {/* ✅ wrapper */}
            <div className="inline-flex w-fit flex-col">
              {/* ✅ Month labels row (aligned with grid) */}
              <div className="flex">
                {/* left spacer same width as day labels */}
                <div className="w-10" />

                <div
                  className="relative h-4"
                  style={{
                    width: gridWidth,
                  }}
                >
                  {monthLabels.map((m) => (
                    <span
                      key={m.index}
                      className="absolute text-[10px] text-muted-foreground"
                      style={{
                        left: m.index * (TILE + GAP),
                      }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* ✅ Day labels + Grid */}
              <div className="flex">
                {/* day labels */}
                <div className="relative w-10">
                  <div style={{ height: gridHeight }}>
                    {GITHUB_DAY_LABELS.map((d) => (
                      <div
                        key={d.row}
                        className="absolute left-0 text-[10px] text-muted-foreground"
                        style={{
                          top: d.row * (TILE + GAP) - 1,
                        }}
                      >
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* heatmap */}
                <div className="flex" style={{ gap: `${GAP}px` }}>
                  {weeks.map((week, weekIndex) => (
                    <div
                      key={weekIndex}
                      className="flex flex-col"
                      style={{ gap: `${GAP}px` }}
                    >
                      {week.map((cell, rowIndex) => {
                        const intensity = getIntensity(cell.minutes);

                        return (
                          <Tooltip.Root key={`${weekIndex}-${rowIndex}`}>
                            <Tooltip.Trigger asChild>
                              <button
                                className={cn(
                                  "rounded-[2px]",
                                  "transition-transform duration-150",
                                  "hover:scale-[1.08]",
                                  "focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-background",
                                  INTENSITY_COLORS[intensity]
                                )}
                                style={{
                                  width: TILE,
                                  height: TILE,
                                }}
                              />
                            </Tooltip.Trigger>

                            <Tooltip.Portal>
                              <Tooltip.Content
                                side="top"
                                sideOffset={8}
                                className={cn(
                                  "z-50 rounded-lg border bg-popover px-3 py-2 shadow-xl",
                                  "animate-in fade-in zoom-in-95 duration-150"
                                )}
                              >
                                <div className="space-y-1">
                                  <div className="text-xs font-medium">
                                    {formatDateLabel(cell.date)}
                                  </div>

                                  <div className="text-[11px] text-muted-foreground">
                                    {formatMinutes(cell.minutes)} •{" "}
                                    {cell.sessions} session
                                    {cell.sessions !== 1 ? "s" : ""}
                                  </div>
                                </div>
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

          {/* Legend */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
            <span className="text-[11px] text-muted-foreground">Less</span>
            {INTENSITY_COLORS.map((c, i) => (
              <div
                key={i}
                className={cn("rounded-[2px]", c)}
                style={{ width: TILE, height: TILE }}
              />
            ))}
            <span className="text-[11px] text-muted-foreground">More</span>
          </div>
        </Tooltip.Provider>

        <style jsx global>{`
          .heatmap-scroll::-webkit-scrollbar {
            height: 0px;
          }
          .heatmap-scroll {
            scrollbar-width: none;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
