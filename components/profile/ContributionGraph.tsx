"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTime, formatTotalTime } from "@/lib/constants";
import { format, subDays, isToday, isYesterday } from "date-fns";

interface ContributionData {
  date: string;
  minutes: number;
  sessions: number;
}

interface ContributionGraphProps {
  data: ContributionData[];
}

const INTENSITY_COLORS = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary/80",
  "bg-primary",
];

export function ContributionGraph({ data }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionData | null>(null);

  const weeks = useMemo(() => {
    const today = new Date();
    const days: ContributionData[] = [];

    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = data.find((d) => d.date === dateStr) || {
        date: dateStr,
        minutes: 0,
        sessions: 0,
      };
      days.push(dayData);
    }

    const weekChunks: ContributionData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7));
    }

    return weekChunks;
  }, [data]);

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return 0;
    if (minutes < 30) return 1;
    if (minutes < 60) return 2;
    if (minutes < 120) return 3;
    if (minutes < 180) return 4;
    return 5;
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const totalMinutes = data.reduce((acc, day) => acc + day.minutes, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus Activity</CardTitle>
        <CardDescription>
          Last 365 days - {formatTotalTime(totalMinutes)} total focus time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={cn(
                      "w-3 h-3 rounded-sm cursor-pointer transition-all",
                      "hover:ring-2 hover:ring-primary hover:ring-offset-1",
                      INTENSITY_COLORS[getIntensity(day.minutes)]
                    )}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {hoveredDay && (
            <div className="absolute z-10 bg-popover border rounded-lg shadow-lg p-3 pointer-events-none mt-2">
              <div className="text-sm font-medium">
                {formatDateLabel(hoveredDay.date)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(hoveredDay.minutes)} focused
              </div>
              <div className="text-sm text-muted-foreground">
                {hoveredDay.sessions} session{hoveredDay.sessions !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          {INTENSITY_COLORS.map((color, i) => (
            <div
              key={i}
              className={cn("w-3 h-3 rounded-sm", color)}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
