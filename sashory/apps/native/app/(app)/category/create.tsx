import { CategoryForm, type CategoryFormValues } from "@/components/category-form";
import { useCreateCategory } from "@/hooks/use-category-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useRouter } from "expo-router";
import { ScrollView } from "react-native";

export default function CreateCategoryScreen() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  async function handleSubmit(values: CategoryFormValues) {
    try {
      const result = await createCategory.mutateAsync({
        name: values.name,
        type: values.type,
      });

      router.replace({
        pathname: "/(app)/category/[id]",
        params: {
          id: result.category.id,
        },
      });
    } catch (error) {
      showMutationError(error, "Unable to create category. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Category",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 bg-background">
        <CategoryForm
          submitLabel="Create category"
          isSubmitting={createCategory.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

