import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useProjects(limit = 20, offset = 0) {
  return useQuery({
    queryKey: [
      ...queryKeys.projects.list,
      { limit, offset },
    ],
    queryFn: async () => {
      const response = await api.api.projects.$get({
        query: {
          limit: String(limit),
          offset: String(offset),
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load projects"),
        );
      }

      return response.json();
    },
  });
}
