import Link from "next/link";
import { Timer } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="arena-backdrop grid min-h-screen md:grid-cols-[minmax(0,1fr)_minmax(0,480px)]" data-mode="work">
      <div className="relative hidden overflow-hidden border-r border-border md:block">
        <div className="flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Timer className="size-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold text-foreground">Time Arena</span>
          </Link>
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Training ground for attention
            </p>
            <p className="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-foreground">
              One round.
              <br />
              One task.
              <br />
              Full crowd.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              {[
                ["25m", "Focus rounds"],
                ["5m", "Corner rests"],
                ["7d", "Fight record"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-border bg-card/80 p-3 backdrop-blur-sm">
                  <p className="font-numeral text-lg font-semibold tabular-nums text-foreground">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Free to start. Your record stays yours.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <Link href="/" className="flex items-center gap-2.5 md:hidden">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Timer className="size-4" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-bold">Time Arena</span>
            </Link>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary md:mt-0">
              {eyebrow}
            </p>
            <h1 className="font-display mt-1.5 text-[28px] font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
