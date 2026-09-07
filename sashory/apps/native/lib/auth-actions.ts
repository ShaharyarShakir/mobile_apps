import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { authClient } from "@/lib/auth-client";

export async function refreshAuthSession() {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.auth.session,
  });
}

export async function signOut() {
  const result = await authClient.signOut();
  await queryClient.invalidateQueries({
    queryKey: queryKeys.auth.session,
  });
  return result;
}

