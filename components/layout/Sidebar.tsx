"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Clock, BarChart3, User, Folder, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isOpen, toggle } = useSidebarStore();

  const navItems = [
    { href: "/", label: "Timer", icon: Clock },
    { href: "/categories", label: "Categories", icon: Folder },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/stats", label: "Stats", icon: BarChart3 },
  ];

  return (
    <>
      <div
        className={`hidden md:flex h-screen flex-col bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40 overflow-hidden transition-all duration-300 ${
          isOpen ? "w-64" : "w-0"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border whitespace-nowrap">
          <h1 className="text-xl font-bold text-sidebar-foreground">Time Arena</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "secondary" : "ghost"}
                className="w-full justify-start whitespace-nowrap"
              >
                <Icon className="mr-2 h-4 w-4 shrink-0" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 space-y-2 border-t border-sidebar-border">
          <DarkModeToggle />
          <Button
            variant="ghost"
            className="w-full justify-center whitespace-nowrap"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4 shrink-0" />
            Logout
          </Button>
        </div>
      </div>

      <div
        className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isOpen ? "left-64" : "left-0"
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-l-none border-l-0 bg-background shadow-md"
          onClick={toggle}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? "" : "rotate-180"}`} />
        </Button>
      </div>
    </>
  );
}
