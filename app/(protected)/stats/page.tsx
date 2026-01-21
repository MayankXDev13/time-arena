"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Edit2, Save, X, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function StatsPage() {
  const { user } = useAuth();
  const { isOpen } = useSidebarStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedMode, setSelectedMode] = useState<"all" | "work" | "break">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | undefined>();

  const sessions = useQuery(
    api.sessions.getRecent,
    user?.id
      ? { userId: user.id as any, limit: 50, categoryId: selectedCategoryId as any }
      : "skip"
  );
  const categories = useQuery(api.categories.list, user?.id ? { userId: user.id as any } : "skip");
  const updateSession = useMutation(api.sessions.update);
  const deleteSession = useMutation(api.sessions.remove);
  const stats = useQuery(api.sessions.getStats, user?.id ? { userId: user.id as any } : "skip");

  const handleEdit = (session: any) => {
    setEditingId(session._id);
    setEditCategoryId(session.categoryId);
  };

  const handleSave = async () => {
    if (!editingId) return;

    await updateSession({
      id: editingId as any,
      categoryId: editCategoryId as any,
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

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const category = categories?.find((cat: any) => cat._id === categoryId);
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
    <div className={`min-h-screen bg-background transition-all duration-300 ${isOpen ? "md:pl-64" : "md:pl-0"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Statistics</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Today&apos;s Focus</h3>
            <p className="text-2xl font-bold text-primary">{stats?.todayMinutes || 0}m</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Streak</h3>
            <p className="text-2xl font-bold text-primary">{stats?.currentStreak || 0} days</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">This Week</h3>
            <p className="text-2xl font-bold text-primary">{stats?.weeklyMinutes || 0}m</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Focus Time</h3>
            <p className="text-2xl font-bold text-primary">{stats?.totalMinutes || 0}m</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Last 7 Days</h3>
            {stats?.dailyMinutes && stats.dailyMinutes.length > 0 ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#e11d48" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <YAxis
                      domain={[0, yAxisMax]}
                      ticks={getYTicks(yAxisMax)}
                      tickFormatter={(v) => `${v}m`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      width={36}
                    />
                    <XAxis
                      dataKey="dayName"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                      dy={10}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                      content={<CustomTooltip />}
                      position={{ y: -15 }}
                      isAnimationActive={true}
                      animationDuration={200}
                    />
                    <Bar dataKey="minutes" barSize={28} radius={[6, 6, 0, 0]} fill="url(#roseGradient)">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.date}
                          fill={entry.minutes === 0 ? 'url(#roseGradient)' : 'url(#roseGradient)'}
                          style={{
                            opacity: entry.minutes === 0 ? 0.15 : 1,
                            filter: entry.isToday ? 'drop-shadow(0 0 12px rgba(244, 63, 94, 0.5))' : 'none',
                            animationDelay: `${index * 60}ms`,
                          }}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                No focus time recorded in the last 7 days
              </div>
            )}
          </div>
        </div>

        {Object.keys(stats?.categoryMinutes || {}).length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">By Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(stats?.categoryMinutes || {}).map(([categoryId, minutes]) => {
                const category = categories?.find((cat: any) => cat._id === categoryId);
                return (
                  <div key={categoryId} className="p-4 rounded-lg bg-accent/50">
                    <p className="text-sm text-muted-foreground truncate">{category?.name || "Unknown"}</p>
                    <p className="text-xl font-bold text-primary">{minutes as number}m</p>
                  </div>
                );
              })}
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
              <div key={session._id} className="p-4">
                {editingId === session._id ? (
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
                      <Button size="sm" variant="outline" onClick={() => deleteSession({ id: session._id as any })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredSessions?.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No sessions yet. Start your first timer session!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
