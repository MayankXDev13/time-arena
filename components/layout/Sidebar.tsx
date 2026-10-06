"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import {
  Clock,
  BarChart3,
  User,
  Folder,
  LogOut,
  ChevronLeft,
  History,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isOpen, toggle } = useSidebarStore();

  const navItems = [
    { href: "/", label: "Timer", hint: "Enter the arena", icon: Clock },
    { href: "/categories", label: "Categories", hint: "Training grounds", icon: Folder },
    { href: "/sessions", label: "Sessions", hint: "Bout history", icon: History },
    { href: "/stats", label: "Stats", hint: "Fight record", icon: BarChart3 },
    { href: "/profile", label: "Profile", hint: "Fighter card", icon: User },
  ];

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "hidden md:flex h-screen flex-col bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40 transition-all duration-300",
        isOpen ? "w-72" : "w-20"
      )}
    >
      {/* Floating edge toggle — vertically centered, outside the sidebar */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggle}
        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={isOpen}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="absolute top-1/2 -right-4 z-50 size-8 -translate-y-1/2 rounded-full border-sidebar-border bg-sidebar text-muted-foreground shadow-md transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ChevronLeft
          className={cn("size-4 transition-transform duration-300", !isOpen && "rotate-180")}
        />
      </Button>

      <div
        className={cn(
          "flex items-center gap-3 p-5 border-b border-sidebar-border",
          !isOpen && "justify-center px-0"
        )}
      >
        <div
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--arena-ember)]"
        >
          <Timer className="size-5" strokeWidth={2.5} />
        </div>
        {isOpen && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-[17px] font-bold leading-none text-sidebar-foreground">
              Time Arena
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Train your focus
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {isOpen && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Arena
          </p>
        )}
        {navItems.map(({ href, label, hint, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={!isOpen ? label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-ring",
                active
                  ? "bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--arena-ember)_25%,transparent)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !isOpen && "justify-center px-0"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary transition-all",
                  active ? "opacity-100 scale-100" : "opacity-0 scale-50"
                )}
              />
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {isOpen && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate leading-none">{label}</span>
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                    {hint}
                  </span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        {isOpen && user && (
          <p className="truncate px-3 pt-1 text-xs text-muted-foreground" title={user.email ?? undefined}>
            {user.name ?? user.email ?? "Fighter"}
          </p>
        )}
        <div className={cn("flex gap-2", isOpen ? "flex-row" : "flex-col items-center")}>
          <DarkModeToggle />
          <Button
            variant="ghost"
            onClick={() => signOut()}
            aria-label="Log out"
            title={!isOpen ? "Log out" : undefined}
            className={cn(isOpen ? "flex-1 justify-start" : "size-9 justify-center px-0")}
          >
            <LogOut className="size-4 shrink-0" />
            {isOpen && "Log out"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
