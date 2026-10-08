
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useSeedCategories,
  useUpdateCategory,
} from "@/hooks/useCategories";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { COLOR_OPTIONS } from "@/components/CategoryDropdown";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { isOpen } = useSidebarStore();
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const seedCategories = useSeedCategories();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  // Synchronous guard: flips the instant seeding starts, so re-runs of
  // this effect (mutation-state churn, StrictMode, HMR) can't fan out
  // into duplicate seed batches while the first request is in flight.
  const seedStarted = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    if (categories === undefined) return;
    if (categories.length > 0) return;
    if (seedStarted.current) return;
    seedStarted.current = true;

    seedCategories.mutate(undefined, {
      onError: (err) => {
        // Genuine failure: allow a later run to retry.
        seedStarted.current = false;
        console.error("Failed to seed default categories:", err);
      },
    });
  }, [user?.id, categories, seedCategories]);

  const handleCreate = async () => {
    if (!user?.id || !newCategoryName.trim()) return;

    await createCategory.mutateAsync({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });

    setNewCategoryName("");
    setNewCategoryColor(COLOR_OPTIONS[0].value);
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    await updateCategory.mutateAsync({
      id: editingId,
      name: editName.trim(),
      color: editColor,
    });

    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory.mutateAsync(id);
  };

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${
      isOpen ? "md:pl-72" : "md:pl-20"
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PageHeader
          eyebrow="Training grounds"
          title="Categories"
          description="Group rounds by craft — work, study, training. Colors mark each ground on your record."
          className="mb-8"
        />

        <div className="mb-6 rounded-[20px] border border-border/70 bg-card p-6 shadow-[0_16px_44px_-28px_color-mix(in_srgb,var(--arena-ember)_40%,transparent)]">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-card-foreground">New ground</h2>
          <p className="mt-1 text-sm text-muted-foreground">Name it like a craft — the color marks it on your record.</p>
          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
            <input
              type="text"
              placeholder="Category name — e.g. Deep work"
              value={newCategoryName}
              onChange={(e: any) => setNewCategoryName(e.target.value)}
              aria-label="Category name"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1.5" role="radiogroup" aria-label="Category color">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={newCategoryColor === option.value}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setNewCategoryColor(option.value)}
                    className={`size-7 shrink-0 rounded-full transition-transform hover:scale-110 ${option.value} ${newCategoryColor === option.value ? "ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--card)]" : "ring-1 ring-black/10"}`}
                  />
                ))}
              </div>
              <Button onClick={handleCreate} disabled={!newCategoryName.trim()} className="h-11 shrink-0">
                <Plus className="w-4 h-4 mr-1.5" />
                Create
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-border/70 bg-card p-6 shadow-[0_16px_44px_-28px_color-mix(in_srgb,var(--arena-ember)_40%,transparent)]">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-card-foreground">Your grounds</h2>
          <div className="mt-4 space-y-2.5">
            {categories?.map((category: any) => (
              <div key={category.id} className="card-lift flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
                {editingId === category.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e: any) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="px-2 py-1 border border-border rounded"
                    >
                      {COLOR_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`size-4 shrink-0 rounded-full ring-1 ring-black/10 ${category.color}`} />
                      <span className="truncate text-[15px] font-semibold text-card-foreground">{category.name}</span>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)} aria-label={`Edit ${category.name}`}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)} aria-label={`Delete ${category.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories?.length === 0 && (
              <div className="py-6 text-center">
                <p className="font-medium text-foreground">No grounds yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create your first one above — it becomes the default for new rounds.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
