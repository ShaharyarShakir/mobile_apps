import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCreateFinancialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      type: "ASSET" | "LIABILITY";
      currency?: string;
    }) => {
      const response = await api.api.accounts.$post({
        json: input,
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to create account"),
        );
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.all,
      });
    },
  });
}

export function useUpdateFinancialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      isActive,
    }: {
      id: string;
      name?: string;
      isActive?: boolean;
    }) => {
      const response = await (api.api.accounts[":id"].$patch as any)({
        param: {
          id,
        },
        json: {
          name,
          isActive,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to update account"),
        );
      }

      return response.json();
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useArchiveFinancialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.api.accounts[":id"].$delete({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to archive account"),
        );
      }
    },

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.detail(id),
        }),
      ]);
    },
  });
}

