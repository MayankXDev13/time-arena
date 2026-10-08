"use client";

import { useAuth } from "@/hooks/useAuth";
import { useLinkedAccounts } from "@/hooks/useLinkedAccounts";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/constants";
import { Mail } from "lucide-react";

interface ProfileHeaderProps {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    currentStreak: number;
  };
}

export function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { oauthProvider } = useLinkedAccounts();

  const oauthLabel =
    oauthProvider === "github"
      ? "GitHub"
      : oauthProvider === "google"
        ? "Google"
        : oauthProvider
          ? oauthProvider[0].toUpperCase() + oauthProvider.slice(1)
          : null;

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold truncate">{user?.name}</h2>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Mail className="w-4 h-4" />
            <span className="text-sm truncate">{user?.email}</span>
            {oauthLabel && (
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                {oauthLabel}
              </span>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-right">
          <div>
            <div className="text-2xl font-bold">{formatTime(stats.totalMinutes)}</div>
            <div className="text-xs text-muted-foreground">Total Focus</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
