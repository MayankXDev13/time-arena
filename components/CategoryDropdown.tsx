"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryDropdownProps {
  selectedCategoryId?: string;
  onSelect: (categoryId?: string) => void;
  className?: string;
  autoSelectDefault?: boolean;
}

const COLOR_OPTIONS = [
  { label: "Red", value: "bg-red-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Gray", value: "bg-gray-500" },
];

export function CategoryDropdown({
  selectedCategoryId,
  onSelect,
  className,
  autoSelectDefault = true,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: qk.categories,
    queryFn: api.listCategories,
    enabled: !!user?.id,
  });


  useEffect(() => {
    if (autoSelectDefault && !selectedCategoryId && categories?.length) {
      const otherCategory = categories.find(
        (c: any) => c.name?.toLowerCase() === "other"
      );

      onSelect(otherCategory?.id ?? categories[0].id);
    }
  }, [autoSelectDefault, selectedCategoryId, categories, onSelect]);

  const selectedCategory = categories?.find(
    (cat: any) => cat.id === selectedCategoryId
  );

  const handleSelect = (categoryId?: string) => {
    onSelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <Button
        variant="outline"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full justify-between bg-card hover:bg-accent"
      >
        <div className="flex items-center space-x-2">
          {selectedCategory ? (
            <>
              <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`} />
              <span>{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select category</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
          

          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className="w-full px-3 py-2 text-left hover:bg-accent text-muted-foreground"
          >
            Select category
          </button>

    
          {categories?.map((category: any) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category.id)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span>{category.name}</span>

              {selectedCategoryId === category.id && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}

          {categories?.length === 0 && (
            <div className="px-3 py-2 text-muted-foreground text-sm">
              No categories. Create one in your profile.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { COLOR_OPTIONS };
