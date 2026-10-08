"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { PageHeader } from "@/components/layout/PageHeader";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CategoryStatsCard } from "@/components/CategoryStatsCard";

export default function StatsPage() {
  const { user } = useAuth();
  const { isOpen } = useSidebarStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedMode, setSelectedMode] = useState<"all" | "work" | "break">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | undefined>();

  const queryClient = useQueryClient();
  const { data: sessions } = useQuery({
    queryKey: qk.recent(50, selectedCategoryId),
    queryFn: () => api.getRecent(50, selectedCategoryId),
    enabled: !!user?.id,
  });
  const { data: categories } = useQuery({
    queryKey: qk.categories,
    queryFn: api.listCategories,
    enabled: !!user?.id,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["recent"] });
    queryClient.invalidateQueries({ queryKey: ["history"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  };
  const updateSession = useMutation({
    mutationFn: (input: { id: string; categoryId?: string }) =>
      api.updateSession(input.id, { categoryId: input.categoryId ?? null }),
    onSuccess: invalidate,
  });
  const deleteSession = useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: invalidate,
  });
  const { data: stats } = useQuery({
    queryKey: qk.stats,
    queryFn: api.getStats,
    enabled: !!user?.id,
  });

  const handleEdit = (session: any) => {
    setEditingId(session.id);
    setEditCategoryId(session.categoryId ?? undefined);
  };

  const handleSave = async () => {
    if (!editingId) return;

    await updateSession.mutateAsync({
      id: editingId,
      categoryId: editCategoryId,
    });

    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const getCategoryName = (categoryId?: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories?.find((cat: any) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (selectedMode === "all") return sessions;
    return sessions.filter((session: any) => session.mode === selectedMode);
  }, [sessions, selectedMode]);

  const clearFilters = () => {
    setSelectedCategoryId(undefined);
    setSelectedMode("all");
  };

  const hasActiveFilters = selectedCategoryId !== undefined || selectedMode !== "all";

  const activeDays = stats?.dailyMinutes?.filter((day: any) => day.minutes > 0) || [];
  const maxMinutes = Math.max(...(stats?.dailyMinutes?.map((d: any) => d.minutes) || [1]));

  function calculateYAxisMax(max: number): number {
    if (max <= 10) return 10;
    if (max <= 15) return 15;
    if (max <= 30) return 30;
    if (max <= 45) return 45;
    if (max <= 60) return 60;
    if (max <= 90) return 90;
    if (max <= 120) return 120;
    return Math.ceil(max / 30) * 30;
  }

  function getYTicks(max: number): number[] {
    const step = max / 3;
    return [0, Math.round(step), Math.round(step * 2), max];
  }

  const chartData = useMemo(() => {
    if (!stats?.dailyMinutes) return [];
    const today = new Date().toISOString().split('T')[0];
    return stats.dailyMinutes.map((day: any) => ({
      ...day,
      dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      formattedDate: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      isToday: day.date === today,
    }));
  }, [stats]);

  const yAxisMax = useMemo(() => calculateYAxisMax(maxMinutes), [maxMinutes]);

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { formattedDate: string; minutes: number } }> }) {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-xl px-3 py-2">
        <p className="text-xs text-muted-foreground">{data.formattedDate}</p>
        <p className="text-base font-semibold text-foreground">{data.minutes} min</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${isOpen ? "md:pl-72" : "md:pl-20"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          eyebrow="Fight record"
          title="Statistics"
          description="Your last 7 days, best grounds, and every saved bout. Filter to see what earned it."
          className="mb-8"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Today&apos;s focus</h3>
            <p className="font-numeral text-2xl font-semibold tabular-nums text-foreground">{stats?.todayMinutes || 0}<span className="text-sm font-medium text-muted-foreground">m</span></p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Win streak</h3>
            <p className="font-numeral text-2xl font-semibold tabular-nums text-foreground">{stats?.currentStreak || 0} <span className="text-sm font-medium text-muted-foreground">days</span></p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">This week</h3>
            <p className="font-numeral text-2xl font-semibold tabular-nums text-foreground">{stats?.weeklyMinutes || 0}<span className="text-sm font-medium text-muted-foreground">m</span></p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total focus</h3>
            <p className="font-numeral text-2xl font-semibold tabular-nums text-foreground">{stats?.totalMinutes || 0}<span className="text-sm font-medium text-muted-foreground">m</span></p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                Last 7 Days
              </h3>

              <p className="text-xs text-muted-foreground">
                {activeDays.length} active days
              </p>
            </div>

            {stats?.dailyMinutes && stats.dailyMinutes.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="arenaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#c2410c" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />

                    <YAxis
                      domain={[0, yAxisMax]}
                      ticks={getYTicks(yAxisMax)}
                      tickFormatter={(v) => `${v}m`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      width={40}
                    />

                    <XAxis
                      dataKey="dayName"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      dy={10}
                    />

                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                      content={<CustomTooltip />}
                      isAnimationActive={true}
                      animationDuration={200}
                    />

                    <Bar dataKey="minutes" barSize={40} radius={[10, 10, 0, 0]} fill="url(#arenaGradient)">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.date}
                          style={{
                            opacity: entry.minutes === 0 ? 0.15 : 1,
                            filter: entry.isToday
                              ? "drop-shadow(0 0 12px rgba(194, 65, 12, 0.55))"
                              : "none",
                            animationDelay: `${index * 60}ms`,
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">
                No focus time recorded in the last 7 days
              </div>
            )}
          </div>
        </div>


        {stats?.categoryStats && stats.categoryStats.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">By Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const sortedCategories = [...stats.categoryStats]
                  .sort((a, b) => b.thisWeek - a.thisWeek)
                  .slice(0, 8);

                return sortedCategories.map((categoryStat, index) => {
                  const category = categories?.find((cat: any) => cat.id === categoryStat.categoryId);
                  if (!category) return null;

                  return (
                    <CategoryStatsCard
                      key={categoryStat.categoryId}
                      category={category}
                      stats={categoryStat}
                      totalMinutes={stats.totalCategoryMinutes || 0}
                      rank={index + 1}
                    />
                  );
                });
              })()}
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Sessions</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Filters:</span>
              <CategoryDropdown
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategoryId}
                className="w-40"
              />
              <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
                <Button
                  variant={selectedMode === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMode("all")}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={selectedMode === "work" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMode("work")}
                  className="text-xs"
                >
                  Work
                </Button>
                <Button
                  variant={selectedMode === "break" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedMode("break")}
                  className="text-xs"
                >
                  Break
                </Button>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="divide-y divide-border">
            {filteredSessions?.map((session: any) => (
              <div key={session.id} className="p-4">
                {editingId === session.id ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(session.start)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${session.mode === "work" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {session.mode}
                      </span>
                      <span className="text-sm font-medium">{formatDuration(session.duration)}</span>
                      <CategoryDropdown
                        selectedCategoryId={editCategoryId}
                        onSelect={setEditCategoryId}
                        className="w-48"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(session.start)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${session.mode === "work" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {session.mode}
                      </span>
                      <span className="text-sm font-medium">{formatDuration(session.duration)}</span>
                      <span className="text-sm text-muted-foreground">
                        {getCategoryName(session.categoryId)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(session)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteSession.mutateAsync(session.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredSessions?.length === 0 && (
              <div className="p-8 text-center">
                <p className="font-medium text-foreground">No bouts match these filters</p>
                <p className="mt-1 text-sm text-muted-foreground">Clear the filters, or start a round on the timer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
