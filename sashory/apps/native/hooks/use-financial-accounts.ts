import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export type FinancialAccountFilters = {
  type?: "ASSET" | "LIABILITY";
  isActive?: boolean;
};

export function useFinancialAccounts(filters?: FinancialAccountFilters) {
  return useQuery({
    queryKey: queryKeys.accounts.list(filters),
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (filters?.type) {
        queryParams.type = filters.type;
      }
      if (filters?.isActive !== undefined) {
        queryParams.isActive = String(filters.isActive);
      }

      const response = await api.api.accounts.$get({
        query: queryParams,
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load accounts"),
        );
      }

      return response.json();
    },
  });
}

export function useFinancialAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: async () => {
      const response = await api.api.accounts[":id"].$get({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to load account"),
        );
      }

      return response.json();
    },
    enabled: Boolean(id),
  });
}

