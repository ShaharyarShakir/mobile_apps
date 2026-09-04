import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

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
          `Failed to create project: ${response.status}`,
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
      const response = await api.api.projects[":id"].$patch({
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
          `Failed to update project: ${response.status}`,
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
          queryKey: queryKeys.projects.detail(
            variables.id,
          ),
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
          `Failed to delete project: ${response.status}`,
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


