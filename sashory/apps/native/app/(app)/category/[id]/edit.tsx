import { CategoryForm, type CategoryFormValues } from "@/components/category-form";
import { useCategory } from "@/hooks/use-categories";
import { useUpdateCategory } from "@/hooks/use-category-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const categoryQuery = useCategory(id);
  const updateCategory = useUpdateCategory();

  if (categoryQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Loading category...</Text>
      </View>
    );
  }

  if (categoryQuery.isError || !categoryQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
        <Text className="text-danger">Unable to load category.</Text>
        <Pressable
          className="rounded-xl bg-black px-4 py-3 dark:bg-white"
          onPress={() => categoryQuery.refetch()}
        >
          <Text className="font-semibold text-white dark:text-black">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const category = categoryQuery.data.category;

  async function handleSubmit(values: CategoryFormValues) {
    try {
      await updateCategory.mutateAsync({
        id,
        name: values.name,
      });

      router.back();
    } catch (error) {
      showMutationError(error, "Unable to update category. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit category",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 bg-background">
        <CategoryForm
          defaultValues={{
            name: category.name,
            type: category.type,
          }}
          isEdit={true}
          submitLabel="Save changes"
          isSubmitting={updateCategory.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

