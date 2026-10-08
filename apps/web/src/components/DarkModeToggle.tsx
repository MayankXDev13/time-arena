
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/useThemeStore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateSettings } from "@/hooks/useSettings";

export function DarkModeToggle() {
  const { user } = useAuth();
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const updateSettings = useUpdateSettings();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (user?.id) {
      updateSettings.mutate({ theme: newTheme });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark" : "Switch to light"}
      title={theme === "light" ? "Switch to dark" : "Switch to light"}
      className="size-9 shrink-0"
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