"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/useThemeStore";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-full justify-center"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}