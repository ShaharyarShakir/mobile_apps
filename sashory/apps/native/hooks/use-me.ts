import { useQuery } from "@tanstack/react-query";
import { api, getApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.user.me,
    queryFn: async () => {
      const response = await api.api.me.$get();

      if (!response.ok) {
        throw await getApiError(response);
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

