import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAuthSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

