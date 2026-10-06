"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, qk } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = !!user?.id;

  const profileQuery = useQuery({
    queryKey: qk.profile,
    queryFn: api.getProfile,
    enabled,
  });
  const settingsQuery = useQuery({
    queryKey: qk.settings,
    queryFn: api.getSettings,
    enabled,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: qk.profile });
    queryClient.invalidateQueries({ queryKey: qk.settings });
  }, [queryClient]);

  const settingsMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: invalidate,
  });
  const bioMutation = useMutation({
    mutationFn: (bio: string) => api.updateProfile({ bio }),
    onSuccess: invalidate,
  });

  const updateSettingsAsync = useCallback(
    async (updates: {
      streakThresholdMinutes?: number;
      autoStartBreaks?: boolean;
      soundEnabled?: boolean;
      defaultTimerMinutes?: number;
      breakDurationMinutes?: number;
      theme?: string;
    }) => {
      if (!user?.id) return;
      await settingsMutation.mutateAsync(updates);
    },
    [user, settingsMutation]
  );

  const updateBio = useCallback(
    async (bio: string) => {
      if (!user?.id) return;
      await bioMutation.mutateAsync(bio);
    },
    [user, bioMutation]
  );

  return {
    user,
    profile: profileQuery.data?.profile ?? undefined,
    settings: settingsQuery.data ?? undefined,
    updateSettings: updateSettingsAsync,
    updateBio,
    isLoading: profileQuery.isLoading || settingsQuery.isLoading,
  };
}
