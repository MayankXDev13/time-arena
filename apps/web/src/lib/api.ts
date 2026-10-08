
export type SessionMode = "work" | "break";

export interface SessionItem {
  id: string;
  userId: string;
  categoryId: string | null;
  start: number;
  endedAt: number | null;
  duration: number;
  mode: SessionMode;
}

export interface HistoryResult {
  page: SessionItem[];
  nextCursor?: string;
  hasMore: boolean;
  totalPages: number;
  totalCount: number;
}

export interface CategoryItem {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface SettingsItem {
  userId: string;
  streakThresholdMinutes: number;
  autoStartBreaks: boolean | null;
  soundEnabled: boolean | null;
  defaultTimerMinutes: number | null;
  breakDurationMinutes: number | null;
  theme: string | null;
}

export interface ProfileResult {
  profile: { userId: string; email: string | null; bio: string | null } | null;
  settings: SettingsItem;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? "";
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${path}`);
  return (await res.json()) as T;
}

function withParams(path: string, params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export const api = {
  getHistory(params: {
    limit: number;
    cursor?: string;
    categoryId?: string;
    mode?: SessionMode;
    startDate?: number;
    endDate?: number;
  }): Promise<HistoryResult> {
    return req(withParams("/api/sessions", params));
  },

  getRecent(limit: number, categoryId?: string): Promise<SessionItem[]> {
    return req(withParams("/api/sessions/recent", { limit, categoryId }));
  },

  getStats(): Promise<{
    todayMinutes: number;
    weeklyMinutes: number;
    currentStreak: number;
    totalSessions: number;
    totalMinutes: number;
    longestSession: number;
    workMinutes: number;
    breakMinutes: number;
    dailyMinutes: { date: string; minutes: number }[];
    categoryMinutes: Record<string, number>;
    categoryStats: {
      categoryId: string;
      thisWeek: number;
      prevWeek: number;
      sessionCount: number;
      trendPercent: number;
    }[];
    totalCategoryMinutes: number;
  }> {
    return req("/api/sessions/stats");
  },

  getContributions(year?: number): Promise<
    { date: string; minutes: number; sessions: number }[]
  > {
    return req(withParams("/api/sessions/contributions", { year }));
  },

  createSession(input: {
    categoryId?: string | null;
    start: number;
    duration: number;
    mode: SessionMode;
  }): Promise<{ id: string }> {
    return req("/api/sessions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateSession(
    id: string,
    patch: { categoryId?: string | null; duration?: number; mode?: SessionMode },
  ): Promise<{ success: boolean }> {
    return req(`/api/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  endSession(
    id: string,
    input: { endedAt: number; duration: number },
  ): Promise<{ success: boolean }> {
    return req(`/api/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteSession(id: string): Promise<{ success: boolean }> {
    return req(`/api/sessions/${id}`, { method: "DELETE" });
  },

  listCategories(): Promise<CategoryItem[]> {
    return req("/api/categories");
  },

  createCategory(input: { name: string; color: string }): Promise<{ id: string }> {
    return req("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  seedCategories(): Promise<{ seeded: boolean }> {
    return req("/api/categories/seed", { method: "POST" });
  },

  updateCategory(
    id: string,
    input: { name: string; color: string },
  ): Promise<{ success: boolean }> {
    return req(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteCategory(id: string): Promise<{ success: boolean }> {
    return req(`/api/categories/${id}`, { method: "DELETE" });
  },

  getSettings(): Promise<SettingsItem> {
    return req("/api/settings");
  },

  updateSettings(
    patch: Partial<Omit<SettingsItem, "userId">>,
  ): Promise<{ success: boolean }> {
    return req("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  getProfile(): Promise<ProfileResult> {
    return req("/api/profile");
  },

  updateProfile(patch: { bio?: string }): Promise<{ success: boolean }> {
    return req("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
};
