import { ProjectForm, ProjectFormValues } from "@/components/project-form";
import { useProject } from "@/hooks/use-project";
import { useUpdateProject } from "@/hooks/use-project-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function EditProjectScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const projectQuery = useProject(id);
  const updateProject = useUpdateProject();

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

  async function handleSubmit(values: ProjectFormValues) {
    try {
      await updateProject.mutateAsync({
        id,
        name: values.name,
        description: values.description || null,
      });

      router.back();
    } catch (error) {
      showMutationError(error, "Unable to update project. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit project",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled">
        <ProjectForm
          defaultValues={{
            name: project.name,
            description: project.description ?? "",
          }}
          submitLabel="Save changes"
          isSubmitting={updateProject.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

