import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { ChevronDown, Check, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryDropdownProps {
  selectedCategoryId?: string;
  onSelect: (categoryId?: string) => void;
  className?: string;
  autoSelectDefault?: boolean;
  disabled?: boolean;
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
  disabled = false,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories } = useCategories();


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
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className="h-11 w-full justify-between rounded-xl border-border bg-muted/50 px-3.5 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex items-center gap-2.5">
          <Target className="size-[18px] shrink-0 text-foreground" strokeWidth={2.25} aria-hidden />
          {selectedCategory ? (
            <>
              <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`} />
              <span className="text-sm font-medium">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Select category</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={() => handleSelect(undefined)}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Select category
          </button>

          {categories?.map((category: any) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleSelect(category.id)}
              aria-pressed={selectedCategoryId === category.id}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
            >
              <div className={`size-3 shrink-0 rounded-full ring-1 ring-black/10 ${category.color}`} />
              <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>

              {selectedCategoryId === category.id && (
                <Check className="size-4 shrink-0 text-primary" />
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
