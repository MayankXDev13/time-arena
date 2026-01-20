"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Clock, BarChart3, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const categories = useQuery(
    api.categories.list,
    user?.id ? { userId: user.id } : "skip"
  );

  const recentSessions = useQuery(
    api.sessions.getRecent,
    user?.id ? { userId: user.id, limit: 5 } : "skip"
  );

  const stats = useQuery(
    api.sessions.getStats,
    user?.id ? { userId: user.id } : "skip"
  );

  const navItems = [
    { href: "/", label: "Timer", icon: Clock },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Time Arena</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          </Link>
        ))}

        {/* Categories Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-sidebar-foreground">
              Categories
            </h3>

            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            {categories?.map((category: any) => (
              <div
                key={category._id}
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-sidebar-accent"
              >
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="text-sm text-sidebar-foreground">
                  {category.name}
                </span>
              </div>
            ))}

            {categories?.length === 0 && (
              <p className="text-xs text-sidebar-accent-foreground px-2">
                No categories yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="pt-6">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
            Recent Sessions
          </h3>

          <div className="space-y-2">
            {recentSessions?.map((session: any) => (
              <div
                key={session._id}
                className="text-xs text-sidebar-accent-foreground px-2"
              >
                <div className="flex justify-between">
                  <span>{session.mode === "work" ? "Focus" : "Break"}</span>
                  <span>{Math.floor(session.duration / 60)}m</span>
                </div>

                {session.categoryId && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Category</span>
                  </div>
                )}
              </div>
            ))}

            {recentSessions?.length === 0 && (
              <p className="text-xs text-sidebar-accent-foreground px-2">
                No sessions yet
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-sidebar-border">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
          Quick Stats
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-sidebar-accent-foreground">Today</span>
            <span className="text-sidebar-foreground">
              {stats?.todayMinutes || 0}m
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sidebar-accent-foreground">Streak</span>
            <span className="text-sidebar-foreground">
              {stats?.currentStreak || 0} days
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sidebar-accent-foreground">This Week</span>
            <span className="text-sidebar-foreground">
              {stats?.weeklyMinutes || 0}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
