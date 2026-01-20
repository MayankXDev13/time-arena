"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TAILWIND_COLORS } from "@/components/CategoryDropdown";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const categories = useQuery(api.categories.list, user?.id ? { userId: user.id as any } : "skip");
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(TAILWIND_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = async () => {
    if (!user?.id || !newCategoryName.trim()) return;

    await createCategory({
      userId: user.id as any,
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });

    setNewCategoryName("");
    setNewCategoryColor(TAILWIND_COLORS[0]);
  };

  const handleEdit = (category: any) => {
    setEditingId(category._id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    await updateCategory({
      id: editingId as any,
      name: editName.trim(),
      color: editColor,
    });

    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory({ id: id as any });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">Profile</h1>

        {/* Create New Category */}
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
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
              {TAILWIND_COLORS.map((color) => (
                <option key={color} value={color}>
                  <div className={`inline-block w-4 h-4 rounded-full ${color} mr-2`} />
                  {color}
                </option>
              ))}
            </select>
            <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Your Categories</h2>
          <div className="space-y-3">
            {categories?.map((category: any) => (
              <div key={category._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                {editingId === category._id ? (
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
                      {TAILWIND_COLORS.map((color) => (
                        <option key={color} value={color}>{color}</option>
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
                      <Button size="sm" variant="outline" onClick={() => handleDelete(category._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories?.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No categories yet. Create your first one above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}