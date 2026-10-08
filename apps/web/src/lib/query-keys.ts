import type { QueryClient } from "@tanstack/react-query";
import type { HistoryResult } from "./api.js";

export interface SessionHistoryFilters {
  limit: number;
  cursor?: string;
  categoryId?: string;
  mode?: "work" | "break";
  startDate?: number;
  endDate?: number;
}

/** Domain-shaped key factories. Lists are prefix-invalidated via the *lists() parents. */
export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (filters: SessionHistoryFilters) =>
    [...sessionKeys.lists(), filters] as const,
  recents: () => [...sessionKeys.all, "recent"] as const,
  recent: (limit: number, categoryId?: string) =>
    [...sessionKeys.recents(), { limit, categoryId: categoryId ?? null }] as const,
  stats: () => [...sessionKeys.all, "stats"] as const,
  graphs: () => [...sessionKeys.all, "contributions"] as const,
  contributions: (year?: number) =>
    [...sessionKeys.graphs(), { year: year ?? null }] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
};

export const settingsKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

export const accountKeys = {
  all: ["linkedAccounts"] as const,
  list: () => [...accountKeys.all, "list"] as const,
};

/**
 * Targeted write-through: every session write changes aggregates, so lists,
 * recents, stats, and contribution graphs all refresh together. One call
 * site (mutations) instead of magic strings scattered across the app.
 */
export function invalidateSessionData(queryClient: QueryClient): Promise<void[]> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: sessionKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: sessionKeys.recents() }),
    queryClient.invalidateQueries({ queryKey: sessionKeys.stats() }),
    queryClient.invalidateQueries({ queryKey: sessionKeys.graphs() }),
  ]);
}

export type { HistoryResult };
