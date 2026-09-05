import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),

    queryFn: async () => {
      const response = await api.api.projects[":id"].$get({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load project"),
        );
      }

      return response.json();
    },

    enabled: Boolean(id),
  });
}
