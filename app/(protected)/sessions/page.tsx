"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useThemeSync } from "@/hooks/useThemeSync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronLeft, ChevronRight, History, Filter } from "lucide-react";
import { formatTime } from "@/lib/constants";

export default function SessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isOpen } = useSidebarStore();
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  
  useThemeSync();

  const sessions = useQuery(
    api.sessions.getHistory,
    user?.id
      ? {
          userId: user.id,
          limit: 10,
          cursor: undefined,
          categoryId: categoryFilter as any,
        }
      : "skip"
  );

  const deleteSession = useMutation(api.sessions.remove);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession({ id: sessionId as any });
    }
  };

  const totalPages = sessions?.totalPages ?? 1;

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!sessions) {
    return (
      <div className={`min-h-screen bg-background transition-all duration-300 ${
        isOpen ? "md:pl-64" : "md:pl-0"
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
            <History className="w-8 h-8" />
            Session History
          </h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${
      isOpen ? "md:pl-64" : "md:pl-0"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <History className="w-8 h-8" />
          Session History
        </h1>

        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end gap-3 mb-6">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CategoryDropdown
                selectedCategoryId={categoryFilter}
                onSelect={(id) => {
                  setCategoryFilter(id);
                  setPage(0);
                }}
                className="w-56"
                autoSelectDefault={false}
              />
            </div>

            <div className="divide-y">
              {sessions?.page && sessions.page.length > 0 ? (
                sessions.page.map((session: any) => (
                  <div key={session._id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm text-muted-foreground min-w-[140px]">
                        {formatDate(session.start)}
                      </span>
                      <Badge
                        variant={session.mode === "work" ? "default" : "secondary"}
                      >
                        {session.mode === "work" ? "Focus" : "Break"}
                      </Badge>
                      <span className="font-medium">{formatTime(Math.floor(session.duration / 60))}</span>
                      <CategoryBadge categoryId={session.categoryId} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session._id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No sessions found. Start your first timer session!
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!sessions?.hasMore}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CategoryBadge({ categoryId }: { categoryId?: string }) {
  const { user } = useAuth();
  const categories = useQuery(api.categories.list, user?.id ? { userId: user.id as any } : "skip");

  if (!categoryId || !categories) return null;

  const category = categories.find((cat: any) => cat._id === categoryId);
  if (!category) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: category.color.replace("bg-", "").replace("-500", "") }}
      />
      <span className="text-sm text-muted-foreground">{category.name}</span>
    </div>
  );
}
