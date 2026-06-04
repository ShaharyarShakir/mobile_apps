import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useAuthSession() {
    return useQuery({
        queryKey: queryKeys.auth.session,
        queryFn: () => authClient.getSession(),
        staleTime: 1000 * 60 * 5,
    })
}