"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Timer } from "@/components/timer/Timer";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { Flame, CalendarCheck, Hourglass } from "lucide-react";

function StatPill({
  icon: Icon,
  value,
  label,
  href,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  value: string;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="font-numeral block text-[17px] font-semibold tabular-nums text-foreground">{value}</span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
    </Link>
  );
}

export default function Home() {
  const { isOpen } = useSidebarStore();
  const { user } = useAuth();
  const mode = useTimerStore((s) => s.mode);
  const { data: stats } = useQuery({
    queryKey: qk.stats,
    queryFn: api.getStats,
    enabled: !!user?.id,
  });

  return (
    <div
      className={`arena-backdrop min-h-screen transition-all duration-300 ${
        isOpen ? "md:pl-72" : "md:pl-20"
      }`}
      data-mode={mode}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:px-8 md:pt-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-label="Focus timer" className="min-w-0">
            <div className="animate-arena-rise mx-auto max-w-[560px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {mode === "work" ? "Round ready — focus" : "Corner time — break"}
              </p>
              <h1 className="font-display mt-2 text-[28px] font-bold leading-tight tracking-tight text-foreground md:text-4xl">
                Step in. One round, one task.
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Pick where this round counts, set the bell, and start. We save
                every finished bout to your record.
              </p>
            </div>

            <div className="animate-arena-rise-1 mt-6 rounded-[28px] border border-border/70 bg-card/80 px-4 py-8 shadow-[0_24px_70px_-30px_color-mix(in_srgb,var(--arena-ember)_45%,transparent)] backdrop-blur-sm md:px-8">
              <Timer />
            </div>
          </section>

          <aside aria-label="Today in the arena" className="grid gap-3 lg:sticky lg:top-6">
            <div className="animate-arena-rise-2">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Today in the arena
              </h2>
              <div className="grid gap-2.5">
                <StatPill icon={CalendarCheck} value={`${stats?.todayMinutes ?? 0}m`} label="Focused today" href="/stats" />
                <StatPill icon={Flame} value={stats?.currentStreak ? `${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}` : "—"} label="Win streak" href="/profile" />
                <StatPill icon={Hourglass} value={`${stats?.weeklyMinutes ?? 0}m`} label="This week" href="/stats" />
              </div>
            </div>

            <div className="animate-arena-rise-3 rounded-2xl border border-dashed border-border bg-card/70 p-4">
              <h3 className="font-display text-sm font-semibold text-foreground">How a round works</h3>
              <ol className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
                <li><span className="font-semibold text-foreground">1.</span> Choose a category for this round.</li>
                <li><span className="font-semibold text-foreground">2.</span> Start the bell — 25m focus, 5m rest.</li>
                <li><span className="font-semibold text-foreground">3.</span> Stop saves the bout to your record.</li>
              </ol>
              <Link href="/stats" className="mt-3 inline-block text-[13px] font-semibold text-primary hover:underline">
                See your fight record →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
