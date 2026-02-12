"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useThemeSync } from "@/hooks/useThemeSync";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "@/components/CategoryDropdown";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Filter, 
  Pencil,
  Clock,
  CalendarDays,
  Focus,
  Coffee
} from "lucide-react";
import { formatTime } from "@/lib/constants";

interface Session {
  _id: string;
  start: number;
  duration: number;
  mode: "work" | "break";
  categoryId?: string;
}

export default function SessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isOpen } = useSidebarStore();
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<string | undefined>();
  const [editDuration, setEditDuration] = useState<number>(0);
  const [editMode, setEditMode] = useState<"work" | "break">("work");
  
  useThemeSync();

  const sessions = useQuery(
    api.sessions.getHistory,
    user?.id
      ? {
          userId: user.id,
          limit: 10,
          cursor: cursors[page],
          categoryId: categoryFilter as any,
        }
      : "skip"
  );

  // Update cursors when we get new data
  useEffect(() => {
    if (sessions?.nextCursor && !cursors.includes(sessions.nextCursor)) {
      setCursors(prev => [...prev, sessions.nextCursor]);
    }
  }, [sessions?.nextCursor]);

  const deleteSession = useMutation(api.sessions.remove);
  const updateSession = useMutation(api.sessions.update);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeOnly = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (sessionId: string) => {
    await deleteSession({ id: sessionId as any });
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setEditCategoryId(session.categoryId);
    setEditDuration(Math.floor(session.duration / 60));
    setEditMode(session.mode);
  };

  const handleUpdate = async () => {
    if (!editingSession) return;
    
    await updateSession({
      id: editingSession._id as any,
      categoryId: editCategoryId as any,
      duration: editDuration * 60,
      mode: editMode,
    });
    
    setEditingSession(null);
  };

  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (sessions?.hasMore) {
      setPage(page + 1);
    }
  };

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
                  setCursors([undefined]);
                }}
                className="w-56"
                autoSelectDefault={false}
              />
            </div>

            <div className="space-y-2">
              {sessions?.page && sessions.page.length > 0 ? (
                sessions.page.map((session: any) => (
                  <div 
                    key={session._id} 
                    className="group grid grid-cols-[110px_100px_100px_1fr_auto] items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Date & Time */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <CalendarDays className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{formatDate(session.start)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatTimeOnly(session.start)}</span>
                      </div>
                    </div>

                    {/* Mode Badge */}
                    <Badge
                      variant={session.mode === "work" ? "default" : "secondary"}
                      className="flex items-center justify-center gap-1 px-2 py-1 w-fit"
                    >
                      {session.mode === "work" ? (
                        <>
                          <Focus className="w-3 h-3" />
                          <span className="hidden sm:inline">Focus</span>
                          <span className="sm:hidden">Work</span>
                        </>
                      ) : (
                        <>
                          <Coffee className="w-3 h-3" />
                          <span>Break</span>
                        </>
                      )}
                    </Badge>

                    {/* Duration */}
                    <div className="flex items-center gap-1 font-semibold text-foreground text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {formatTime(Math.floor(session.duration / 60))}
                    </div>

                    {/* Category */}
                    <div className="min-w-0 overflow-hidden">
                      <CategoryBadge categoryId={session.categoryId} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(session)}
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(session._id)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <History className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg font-medium">No sessions found</p>
                  <p className="text-sm text-muted-foreground mt-1">Start your first timer session!</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {sessions?.page && sessions.page.length > 0 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={handlePrevious}
                  className="h-9 px-4"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!sessions?.hasMore}
                  onClick={handleNext}
                  className="h-9 px-4"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSession} onOpenChange={() => setEditingSession(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update the details of your session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <CategoryDropdown
                selectedCategoryId={editCategoryId}
                onSelect={setEditCategoryId}
                className="w-full"
                autoSelectDefault={false}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                id="duration"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setEditDuration(value === "" ? 0 : parseInt(value));
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={editMode} onValueChange={(value: "work" | "break") => setEditMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Focus</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSession(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryBadge({ categoryId }: { categoryId?: string }) {
  const { user } = useAuth();
  const categories = useQuery(api.categories.list, user?.id ? { userId: user.id as any } : "skip");

  if (!categories) return <span className="text-sm text-muted-foreground">-</span>;

  if (!categoryId) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 w-fit">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="text-sm text-muted-foreground">Uncategorized</span>
      </div>
    );
  }

  const category = categories.find((cat: any) => cat._id === categoryId);
  if (!category) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 w-fit">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="text-sm text-muted-foreground">Unknown</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted w-fit max-w-full">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: category.color.replace("bg-", "").replace("-500", "") }}
      />
      <span className="text-sm font-medium truncate">{category.name}</span>
    </div>
  );
}
