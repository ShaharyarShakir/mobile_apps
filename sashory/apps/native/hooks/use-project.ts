import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

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
          `Failed to load project: ${response.status}`,
        );
      }

      return response.json();
    },

    enabled: Boolean(id),
  });
}

