import { useProject } from "@/hooks/use-project";
import { useDeleteProject } from "@/hooks/use-project-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Surface } from "heroui-native";
import {
  ActivityIndicator,
  Alert,
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-muted-foreground mt-3 text-sm">Loading project...</Text>
      </View>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6 bg-background">
        <Text className="text-danger font-medium text-center">Unable to load project.</Text>
        <Button onPress={() => projectQuery.refetch()} className="bg-accent">
          <Button.Label className="text-accent-foreground">Try again</Button.Label>
        </Button>
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
      "This action cannot be undone and will remove this project.",
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

      <ScrollView className="flex-1 p-5 bg-background">
        <View className="gap-6">
          {/* Header Card */}
          <Surface variant="secondary" className="rounded-3xl border border-border p-6 gap-5">
            <View className="flex-row items-center gap-3.5">
              <View className="w-12 h-12 rounded-2xl bg-blue-500/15 items-center justify-center">
                <Ionicons name="folder-outline" size={26} color="#3B82F6" />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">
                  {project.name}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Created {createdAtFormatted}
                </Text>
              </View>
            </View>

            {project.description ? (
              <View className="border-t border-border/70 pt-4 gap-1.5">
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  {project.description}
                </Text>
              </View>
            ) : null}
          </Surface>

          {/* Action Buttons */}
          <View className="gap-3 mt-2">
            <Button
              className="bg-accent"
              size="lg"
              onPress={() =>
                router.push({
                  pathname: "/(app)/project/[id]/edit",
                  params: { id },
                })
              }
            >
              <Button.Label className="text-accent-foreground font-semibold">
                Edit Project
              </Button.Label>
            </Button>

            <Button
              variant="danger"
              size="lg"
              isDisabled={deleteProject.isPending}
              onPress={handleDelete}
            >
              <Button.Label>
                {deleteProject.isPending ? "Deleting..." : "Delete Project"}
              </Button.Label>
            </Button>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

