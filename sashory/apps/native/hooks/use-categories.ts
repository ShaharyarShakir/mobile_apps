import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCategories(type?: "INCOME" | "EXPENSE") {
  return useQuery({
    queryKey: queryKeys.categories.list(type),
    queryFn: async () => {
      const response = await api.api.categories.$get({
        query: type ? { type } : {},
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load categories"),
        );
      }

      return response.json();
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      const response = await api.api.categories[":id"].$get({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load category"),
        );
      }

      return response.json();
    },
    enabled: Boolean(id),
  });
}

