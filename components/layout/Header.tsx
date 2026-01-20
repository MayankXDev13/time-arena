"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();
  const stats = useQuery(api.sessions.getStats, user?.id ? { userId: user.id as any } : "skip");

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 md:left-64 right-0 z-30">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-foreground">
        Time Arena
      </Link>

      {/* Stats */}
      <div className="hidden md:flex items-center space-x-6 text-sm">
        <div className="text-center">
          <div className="text-foreground font-medium">{stats?.todayMinutes || 0}m</div>
          <div className="text-muted-foreground">Today</div>
        </div>
        <div className="text-center">
          <div className="text-foreground font-medium">{stats?.currentStreak || 0}</div>
          <div className="text-muted-foreground">Streak</div>
        </div>
        <div className="text-center">
          <div className="text-foreground font-medium">{stats?.weeklyMinutes || 0}m</div>
          <div className="text-muted-foreground">Week</div>
        </div>
      </div>

      {/* Profile & Logout */}
      <div className="flex items-center space-x-2">
        <Link href="/profile">
          <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent">
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}