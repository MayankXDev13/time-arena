
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
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-3xl bg-primary ring-1 ring-[color-mix(in_srgb,var(--arena-ember)_40%,transparent)] shadow-[0_16px_40px_-16px_var(--arena-ember)] sm:size-24">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-3xl font-black text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display truncate text-xl font-extrabold tracking-tight">{user?.name}</h2>
          </div>
          <div className="mt-1 flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate text-sm">{user?.email}</span>
            {oauthLabel && (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                {oauthLabel}
              </span>
            )}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-4 border-t border-border pt-4 text-center sm:border-0 sm:pt-0 sm:text-right">
          <div>
            <div className="font-numeral text-xl font-extrabold tabular-nums sm:text-2xl">{formatTime(stats.totalMinutes)}</div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Focus</div>
          </div>
          <div>
            <div className="font-numeral text-xl font-extrabold tabular-nums sm:text-2xl">{stats.totalSessions}</div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Bouts</div>
          </div>
          <div>
            <div className="font-numeral text-xl font-extrabold tabular-nums text-[var(--arena-laurel)] sm:text-2xl">{stats.currentStreak}</div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
