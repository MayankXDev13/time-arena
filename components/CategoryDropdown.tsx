"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryDropdownProps {
  selectedCategoryId?: string;
  onSelect: (categoryId?: string) => void;
  className?: string;
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

export function CategoryDropdown({ selectedCategoryId, onSelect, className }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const categories = useQuery(api.categories.list, user?.id ? { userId: user.id as any } : "skip");

  const selectedCategory = categories?.find((cat: any) => cat._id === selectedCategoryId);

  const handleSelect = (categoryId?: string) => {
    onSelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
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
          {/* Uncategorized option */}
          <button
            onClick={() => handleSelect(undefined)}
            className="w-full px-3 py-2 text-left hover:bg-accent flex items-center space-x-2"
          >
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Uncategorized</span>
            {!selectedCategoryId && <Check className="w-4 h-4 ml-auto" />}
          </button>

          {/* Categories */}
          {categories?.map((category: any) => (
            <button
              key={category._id}
              onClick={() => handleSelect(category._id)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span>{category.name}</span>
              {selectedCategoryId === category._id && <Check className="w-4 h-4 ml-auto" />}
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