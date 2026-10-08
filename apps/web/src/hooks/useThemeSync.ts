
import { useEffect } from "react";
import { useSettingsQuery } from "@/hooks/useSettings";
import { useThemeStore } from "@/stores/useThemeStore";

export function useThemeSync() {
  const { setTheme } = useThemeStore();

  const { data: settings } = useSettingsQuery();

  useEffect(() => {
    if (settings?.theme) {
      if (settings.theme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setTheme(settings.theme as "light" | "dark");
      }
    }
  }, [settings, setTheme]);
}
