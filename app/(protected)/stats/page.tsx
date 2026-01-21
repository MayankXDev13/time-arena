"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Edit2, Save, X, Trash2 } from "lucide-react";

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

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${
      isOpen ? "md:pl-64" : "md:pl-0"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Statistics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Today's Focus</h3>
            <p className="text-3xl font-bold text-primary">{stats?.todayMinutes || 0}m</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-primary">{stats?.currentStreak || 0} days</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">This Week</h3>
            <p className="text-3xl font-bold text-primary">{stats?.weeklyMinutes || 0}m</p>
          </div>
        </div>

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
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.mode === "work" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        session.mode === "work" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
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
