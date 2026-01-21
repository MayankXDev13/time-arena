"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BADGES, calculateLevel, formatTime, type BadgeCheckStats } from "@/lib/constants";

interface AchievementsProps {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    sessionsByHour?: { [hour: number]: number };
  };
}

export function Achievements({ stats }: AchievementsProps) {
  const { level, xp, xpForNextLevel } = calculateLevel(stats.totalMinutes);
  const progress = (xp / xpForNextLevel) * 100;

  const sessionsByHour = stats.sessionsByHour || {};

  const badgeCheckStats: BadgeCheckStats = {
    totalMinutes: stats.totalMinutes,
    totalSessions: stats.totalSessions,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    sessionsByHour,
  };

  const earnedBadges = BADGES.filter((badge) => badge.check(badgeCheckStats));
  const totalBadges = BADGES.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Your progress and milestones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Current Level</div>
              <div className="text-4xl font-bold">{level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">XP Progress</div>
              <div className="text-2xl font-bold">
                {xp} / {xpForNextLevel} XP
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {formatTime(xpForNextLevel - xp)} to reach next level
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</div>
            <div className="text-sm text-muted-foreground">Total Focus</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Badges</h4>
            <span className="text-sm text-muted-foreground">
              {earnedBadges.length} / {totalBadges} earned
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {BADGES.map((badge) => {
              const earned = badge.check(badgeCheckStats);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg text-center transition-all",
                    earned
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50 opacity-50"
                  )}
                  title={badge.description}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium line-clamp-1">{badge.name}</div>
                  {earned && (
                    <div className="text-[10px] text-primary mt-1">Earned!</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
