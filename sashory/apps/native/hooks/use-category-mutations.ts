import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      type: "INCOME" | "EXPENSE";
    }) => {
      const response = await api.api.categories.$post({
        json: input,
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to create category"),
        );
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.categories.all,
      });
    },
  });
}

export function useUpdateCategory() {
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
      const response = await (api.api.categories[":id"].$patch as any)({
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
          await getApiErrorMessage(response, "Failed to update category"),
        );
      }

      return response.json();
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.api.categories[":id"].$delete({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to archive category"),
        );
      }
    },

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.detail(id),
        }),
      ]);
    },
  });
}

