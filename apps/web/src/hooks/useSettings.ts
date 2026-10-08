import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, type SettingsItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { profileKeys, settingsKeys } from "@/lib/query-keys";

export type SettingsPatch = Partial<Omit<SettingsItem, "userId">>;

export function useSettingsQuery() {
  const { user } = useAuth();
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: api.getSettings,
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) => api.updateSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.detail() });
      const previous = queryClient.getQueryData<SettingsItem>(settingsKeys.detail());
      queryClient.setQueryData<SettingsItem>(settingsKeys.detail(), (current) =>
        current ? { ...current, ...patch } : current,
      );
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.detail(), context.previous);
      }
    },
    onSettled: () => {
      // The profile payload embeds a settings snapshot: refresh both.
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
}
