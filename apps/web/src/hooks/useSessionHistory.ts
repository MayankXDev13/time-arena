import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api, type HistoryResult, type SessionItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import {
  invalidateSessionData,
  sessionKeys,
  type SessionHistoryFilters,
} from "@/lib/query-keys";

type ListCache = [readonly unknown[], HistoryResult | undefined][];

function patchLists(
  queryClient: QueryClient,
  patch: (page: HistoryResult) => HistoryResult,
): ListCache {
  const previous = queryClient.getQueriesData<HistoryResult>({
    queryKey: sessionKeys.lists(),
  });
  for (const [key, data] of previous) {
    if (data) queryClient.setQueryData(key, patch(data));
  }
  return previous;
}

function restoreLists(queryClient: QueryClient, previous: ListCache): void {
  for (const [key, data] of previous) {
    queryClient.setQueryData(key, data);
  }
}

export function useSessionHistory(filters: SessionHistoryFilters) {
  const { user } = useAuth();
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => api.getHistory(filters),
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSession,
    // Server mints the id: no honest optimistic row, just refresh.
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      categoryId?: string | null;
      duration?: number;
      mode?: "work" | "break";
    }) => api.updateSession(input.id, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() });
      const previous = patchLists(queryClient, (data) => ({
        ...data,
        page: data.page.map((row: SessionItem) =>
          row.id === input.id ? { ...row, ...input } : row,
        ),
      }));
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context) restoreLists(queryClient, context.previous);
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useEndSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; endedAt: number; duration: number }) =>
      api.endSession(input.id, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() });
      const previous = patchLists(queryClient, (data) => ({
        ...data,
        page: data.page.map((row: SessionItem) =>
          row.id === input.id
            ? { ...row, endedAt: input.endedAt, duration: input.duration }
            : row,
        ),
      }));
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context) restoreLists(queryClient, context.previous);
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: sessionKeys.lists() });
      const previous = patchLists(queryClient, (data) => ({
        ...data,
        page: data.page.filter((row: SessionItem) => row.id !== id),
        totalCount: Math.max(0, data.totalCount - 1),
      }));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context) restoreLists(queryClient, context.previous);
    },
    onSettled: () => invalidateSessionData(queryClient),
  });
}
