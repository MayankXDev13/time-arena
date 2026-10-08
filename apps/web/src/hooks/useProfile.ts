import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { profileKeys, settingsKeys } from "@/lib/query-keys";
import { useUpdateSettings, type SettingsPatch } from "./useSettings.js";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const enabled = !!user?.id;

  const profileQuery = useQuery({
    queryKey: profileKeys.detail(),
    queryFn: api.getProfile,
    enabled,
    staleTime: 60_000,
  });
  const settingsQuery = useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: api.getSettings,
    enabled,
    staleTime: 60_000,
  });

  const bioMutation = useMutation({
    mutationFn: (bio: string) => api.updateProfile({ bio }),
    onMutate: async (bio) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() });
      const previous = queryClient.getQueryData(profileKeys.detail());
      queryClient.setQueryData(profileKeys.detail(), (current: unknown) => {
        if (!current || typeof current !== "object") return current;
        const profile = (current as { profile?: unknown }).profile;
        if (!profile || typeof profile !== "object") return current;
        return { ...(current as object), profile: { ...profile, bio } };
      });
      return { previous };
    },
    onError: (_err, _bio, context) => {
      if (context) queryClient.setQueryData(profileKeys.detail(), context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: profileKeys.detail() }),
  });

  const settingsMutation = useUpdateSettings();

  const updateSettingsAsync = useCallback(
    async (updates: SettingsPatch) => {
      if (!user?.id) return;
      await settingsMutation.mutateAsync(updates);
    },
    [user, settingsMutation],
  );

  const updateBio = useCallback(
    async (bio: string) => {
      if (!user?.id) return;
      await bioMutation.mutateAsync(bio);
    },
    [user, bioMutation],
  );

  return {
    user,
    profile: profileQuery.data?.profile ?? undefined,
    settings: settingsQuery.data ?? undefined,
    updateSettings: updateSettingsAsync,
    updateBio,
    isLoading: profileQuery.isLoading || settingsQuery.isLoading,
    isError: profileQuery.isError || settingsQuery.isError,
    refetch: profileQuery.refetch,
  };
}
