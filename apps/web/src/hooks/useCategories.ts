import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api, type CategoryItem } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { categoryKeys, sessionKeys } from "@/lib/query-keys";

export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: api.listCategories,
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

function patchList(
  queryClient: QueryClient,
  patch: (rows: CategoryItem[]) => CategoryItem[],
) {
  const key = categoryKeys.list();
  const previous = queryClient.getQueryData<CategoryItem[]>(key);
  queryClient.setQueryData<CategoryItem[]>(key, (rows) => (rows ? patch(rows) : rows));
  return { previous };
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    // Server mints the id: refresh instead of guessing.
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.list() }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; name: string; color: string }) =>
      api.updateCategory(input.id, { name: input.name, color: input.color }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.list() });
      const previous = patchList(queryClient, (rows) =>
        rows.map((row) => (row.id === input.id ? { ...row, ...input } : row)),
      );
      return previous;
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoryKeys.list(), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.list() }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.list() });
      const previous = patchList(queryClient, (rows) =>
        rows.filter((row) => row.id !== id),
      );
      return previous;
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(categoryKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      // Sessions referencing the deleted category feed the stats aggregates.
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
  });
}

export function useSeedCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.seedCategories,
    onSettled: () => queryClient.invalidateQueries({ queryKey: categoryKeys.list() }),
  });
}
