import { ProjectForm, ProjectFormValues } from "@/components/project-form";
import { useCreateProject } from "@/hooks/use-project-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useRouter } from "expo-router";
import { ScrollView } from "react-native";

export default function CreateProjectScreen() {
  const router = useRouter();
  const createProject = useCreateProject();

  async function handleSubmit(values: ProjectFormValues) {
    try {
      const result = await createProject.mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });

      router.replace({
        pathname: "/(app)/project/[id]",
        params: {
          id: result.project.id,
        },
      });
    } catch (error) {
      showMutationError(error, "Unable to create project. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create project",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled">
        <ProjectForm
          submitLabel="Create project"
          isSubmitting={createProject.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

