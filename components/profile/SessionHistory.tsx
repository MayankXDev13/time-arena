"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/constants";

export function SessionHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [modeFilter, setModeFilter] = useState<"all" | "work" | "break">("all");

  const sessions = useQuery(
    api.sessions.getHistory,
    user?.id
      ? {
          userId: user.id,
          limit: 20,
          cursor: undefined,
          categoryId: categoryFilter as any,
          mode: modeFilter === "all" ? undefined : modeFilter,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>Browse and manage your past sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <CategoryDropdown
            selectedCategoryId={categoryFilter}
            onSelect={(id) => {
              setCategoryFilter(id);
              setPage(0);
            }}
            className="w-48"
          />
          <Select
            value={modeFilter}
            onValueChange={(value: "all" | "work" | "break") => {
              setModeFilter(value);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="work">Focus</SelectItem>
              <SelectItem value="break">Break</SelectItem>
            </SelectContent>
          </Select>
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
