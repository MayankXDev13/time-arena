import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Timer, BarChart3, User, History, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = useLocation().pathname;

  const navItems = [
    { href: "/", label: "Timer", icon: Timer },
    { href: "/categories", label: "Areas", icon: LayoutGrid },
    { href: "/sessions", label: "Bouts", icon: History },
    { href: "/stats", label: "Record", icon: BarChart3 },
    { href: "/profile", label: "Card", icon: User },
  ];

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 items-stretch gap-1 px-2 pt-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              to={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[11px] font-semibold transition-all",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
