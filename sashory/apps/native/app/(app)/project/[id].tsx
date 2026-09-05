import { useProject } from "@/hooks/use-project";
import { useDeleteProject } from "@/hooks/use-project-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const projectQuery = useProject(id);
  const deleteProject = useDeleteProject();

  if (projectQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading project...</Text>
      </View>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4">
        <Text>Unable to load project.</Text>
        <Pressable
          className="rounded-xl bg-black px-4 py-3"
          onPress={() => projectQuery.refetch()}
        >
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const project = projectQuery.data.project;
  const createdAtFormatted = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  function handleDelete() {
    Alert.alert(
      "Delete project",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject.mutateAsync(id);
              router.replace("/(app)/projects");
            } catch (error) {
              showMutationError(error, "Unable to delete project. Please try again.");
            }
          },
        },
      ],
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: project.name || "Project",
        }}
      />

      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-2xl font-bold">{project.name}</Text>
            <Text className="text-sm text-gray-500">
              Created {createdAtFormatted}
            </Text>
          </View>

          {project.description ? (
            <View className="gap-2">
              <Text className="font-medium text-gray-700">Description</Text>
              <Text className="text-base text-gray-900 leading-relaxed">
                {project.description}
              </Text>
            </View>
          ) : null}

          <View className="mt-6 gap-3">
            <Pressable
              className="items-center rounded-xl bg-black px-4 py-3"
              onPress={() =>
                router.push({
                  pathname: "/(app)/project/[id]/edit",
                  params: { id },
                })
              }
            >
              <Text className="font-semibold text-white">Edit project</Text>
            </Pressable>

            <Pressable
              className="items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              disabled={deleteProject.isPending}
              onPress={handleDelete}
            >
              <Text className="font-semibold text-red-600">
                {deleteProject.isPending ? "Deleting..." : "Delete project"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

