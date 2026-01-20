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
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40">
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
      </nav>
    </div>
  );
}
