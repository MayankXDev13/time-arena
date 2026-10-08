
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useThemeStore } from "@/stores/useThemeStore";

export function useThemeSync() {
  const { user } = useAuth();
  const { setTheme } = useThemeStore();

  const { data: settings } = useQuery({
    queryKey: qk.settings,
    queryFn: api.getSettings,
    enabled: !!user?.id,
  });

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
