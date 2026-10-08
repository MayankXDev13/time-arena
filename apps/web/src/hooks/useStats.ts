import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { sessionKeys } from "@/lib/query-keys";

export function useStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: sessionKeys.stats(),
    queryFn: api.getStats,
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useContributions(year: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: sessionKeys.contributions(year),
    queryFn: () => api.getContributions(year),
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useRecentSessions(limit: number, categoryId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: sessionKeys.recent(limit, categoryId),
    queryFn: () => api.getRecent(limit, categoryId),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}
