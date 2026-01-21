"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useThemeStore } from "@/stores/useThemeStore";

export function useThemeSync() {
  const { user } = useAuth();
  const { setTheme } = useThemeStore();

  const settings = useQuery(api.users.getSettings, user?.id ? { userId: user.id } : "skip");

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
