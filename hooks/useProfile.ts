import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useProfile() {
  const { user } = useAuth();

  const profile = useQuery(api.users.getProfile, user?.id ? { userId: user.id } : "skip");
  const settings = useQuery(api.users.getSettings, user?.id ? { userId: user.id } : "skip");
  const avatarUrl = useQuery(
    api.users.getAvatarUrl,
    profile?.profile?.avatarStorageId ? { storageId: profile.profile.avatarStorageId } : "skip"
  );

  const updateSettings = useMutation(api.users.updateSettings);
  const updateProfile = useMutation(api.users.updateProfile);
  const updateAvatar = useMutation(api.users.updateAvatar);

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
      await updateSettings({ userId: user.id, ...updates });
    },
    [user, updateSettings]
  );

  const updateBio = useCallback(
    async (bio: string) => {
      if (!user?.id) return;
      await updateProfile({ userId: user.id, bio });
    },
    [user, updateProfile]
  );

  const uploadAvatar = useCallback(
    async (storageId: string) => {
      if (!user?.id) return;
      await updateAvatar({ userId: user.id, avatarStorageId: storageId as Id<"_storage"> });
    },
    [user, updateAvatar]
  );

  return {
    user,
    profile,
    settings,
    avatarUrl,
    updateSettings: updateSettingsAsync,
    updateBio,
    uploadAvatar,
    isLoading: profile === undefined || settings === undefined,
  };
}
