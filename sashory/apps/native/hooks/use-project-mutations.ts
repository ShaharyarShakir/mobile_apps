import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiErrorMessage } from "@/lib/api-error";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
    }) => {
      const response = await api.api.projects.$post({
        json: input,
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to create project"),
        );
      }

      return response.json();
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list,
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name?: string;
      description?: string | null;
    }) => {
      const response = await (api.api.projects[":id"].$patch as any)({
        param: {
          id,
        },
        json: {
          name,
          description,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to update project"),
        );
      }

      return response.json();
    },

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.list,
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.api.projects[":id"].$delete({
        param: {
          id,
        },
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Failed to delete project"),
        );
      }
    },

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.list,
        }),

        queryClient.removeQueries({
          queryKey: queryKeys.projects.detail(id),
        }),
      ]);
    },
  });
}
