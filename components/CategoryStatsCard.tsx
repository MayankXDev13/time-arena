"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";

interface CategoryStatsCardProps {
  category: {
    _id: string;
    name: string;
    color: string;
  };
  stats: {
    thisWeek: number;
    prevWeek: number;
    sessionCount: number;
    trendPercent: number;
  };
  totalMinutes: number;
  rank?: number;
  className?: string;
}

function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function getProgressColor(colorClass: string): string {
  const colorMap: Record<string, string> = {
    "bg-red-500": "bg-red-500",
    "bg-yellow-500": "bg-yellow-500",
    "bg-green-500": "bg-green-500",
    "bg-blue-500": "bg-blue-500",
    "bg-indigo-500": "bg-indigo-500",
    "bg-purple-500": "bg-purple-500",
    "bg-pink-500": "bg-pink-500",
    "bg-gray-500": "bg-gray-500",
  };
  return colorMap[colorClass] || "bg-rose-500";
}

function getTrendColor(trendPercent: number): string {
  if (trendPercent > 0) return "text-emerald-400";
  if (trendPercent < 0) return "text-rose-400";
  return "text-muted-foreground";
}

function getTrendBg(trendPercent: number): string {
  if (trendPercent > 0) return "bg-emerald-500/10 border-emerald-500/20";
  if (trendPercent < 0) return "bg-rose-500/10 border-rose-500/20";
  return "bg-muted/10 border-border/50";
}

function getTrendIcon(trendPercent: number) {
  if (trendPercent > 0) return <TrendingUp className="w-3 h-3" />;
  if (trendPercent < 0) return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
}

function getRankBadge(rank: number | undefined) {
  if (!rank || rank > 3) return null;

  const badgeColors = [
    "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800",
    "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950",
  ];

  const badges = ["1st", "2nd", "3rd"];

  return (
    <div
      className={cn(
        "absolute -top-2 -right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold shadow-md",
        badgeColors[rank - 1]
      )}
    >
      <Trophy className="w-3 h-3" />
      {badges[rank - 1]}
    </div>
  );
}

export function CategoryStatsCard({
  category,
  stats,
  totalMinutes,
  rank,
  className,
}: CategoryStatsCardProps) {
  const percentOfTotal = totalMinutes > 0
    ? Math.round((stats.thisWeek / totalMinutes) * 100)
    : 0;

  const progressColor = getProgressColor(category.color);

  return (
    <div
      className={cn(
        "relative group bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm p-4",
        "transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-card/90",
        "hover:shadow-[0_0_20px_rgba(225,29,72,0.15)]",
        className
      )}
    >
      {getRankBadge(rank)}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-3 h-3 rounded-full shrink-0 shadow-sm",
              category.color
            )}
          />
          <span className="text-sm font-medium text-card-foreground truncate">
            {category.name}
          </span>
        </div>

        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
            getTrendBg(stats.trendPercent)
          )}
        >
          {getTrendIcon(stats.trendPercent)}
          <span className={cn("whitespace-nowrap", getTrendColor(stats.trendPercent))}>
            {stats.trendPercent > 0 ? "+" : ""}
            {stats.trendPercent}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-primary">
          {formatTime(stats.thisWeek)}
        </span>
        <span className="text-xs text-muted-foreground">
          sessions: {stats.sessionCount}
        </span>
      </div>

      <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
            progressColor
          )}
          style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-muted-foreground">
          {percentOfTotal}% of total
        </span>
      </div>
    </div>
  );
}
