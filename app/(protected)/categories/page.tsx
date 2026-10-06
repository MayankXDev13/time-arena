"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { Button } from "@/components/ui/button";
import { COLOR_OPTIONS } from "@/components/CategoryDropdown";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { isOpen } = useSidebarStore();
  const queryClient = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: qk.categories,
    queryFn: api.listCategories,
    enabled: !!user?.id,
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qk.categories });
  const createCategory = useMutation({
    mutationFn: (input: { name: string; color: string }) =>
      api.createCategory(input),
    onSuccess: invalidate,
  });
  const updateCategory = useMutation({
    mutationFn: (input: { id: string; name: string; color: string }) =>
      api.updateCategory(input.id, { name: input.name, color: input.color }),
    onSuccess: invalidate,
  });
  const deleteCategory = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: invalidate,
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [defaultsCreated, setDefaultsCreated] = useState(false);


  useEffect(() => {
    if (!user?.id) return;
    if (categories === undefined) return;
    if (categories.length > 0) return;
    if (defaultsCreated) return;

    const createDefaults = async () => {
      try {
        const defaults = [
          { name: "Other", color: "bg-gray-500" },
          { name: "Work", color: "bg-blue-500" },
          { name: "Study", color: "bg-green-500" },
        ];

        for (const cat of defaults) {
          await createCategory.mutateAsync({
            name: cat.name,
            color: cat.color,
          });
        }

        setDefaultsCreated(true);
      } catch (err) {
        console.error("Failed to create default categories:", err);
      }
    };

    createDefaults();
  }, [user?.id, categories, defaultsCreated, createCategory]);

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

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Create New Category</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e: any) => setNewCategoryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
            <select
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {COLOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Your Categories</h2>
          <div className="space-y-3">
            {categories?.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${category.color}`} />
                      <span className="text-card-foreground">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)}>
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
