import { useCategory } from "@/hooks/use-categories";
import { useArchiveCategory } from "@/hooks/use-category-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const categoryQuery = useCategory(id);
  const archiveCategory = useArchiveCategory();

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
  const createdAtFormatted = category.createdAt
    ? new Date(category.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  function handleArchive() {
    Alert.alert(
      "Archive category",
      "Archiving this category hides it from new transaction forms while preserving past financial history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              await archiveCategory.mutateAsync(id);
              router.replace("/(app)/categories");
            } catch (error) {
              showMutationError(error, "Unable to archive category. Please try again.");
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
          title: category.name || "Category",
        }}
      />

      <ScrollView className="flex-1 p-4 bg-background">
        <View className="gap-6">
          {/* Header Card */}
          <View className="rounded-2xl border border-border bg-card p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="gap-1 flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  {category.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Created {createdAtFormatted}
                </Text>
              </View>

              <View
                className={`rounded-lg px-2.5 py-1 ${
                  category.type === "INCOME"
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "bg-amber-50 dark:bg-amber-950/40"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    category.type === "INCOME"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {category.type}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Purpose</Text>
                <Text className="text-base font-semibold text-foreground">
                  {category.type === "INCOME" ? "Money Source" : "Expense Destination"}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Status</Text>
                <Text
                  className={`text-base font-semibold ${
                    category.isActive ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {category.isActive ? "Active" : "Archived"}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              className="items-center rounded-xl bg-black px-4 py-3.5 dark:bg-white"
              onPress={() =>
                router.push({
                  pathname: "/(app)/category/[id]/edit",
                  params: { id },
                })
              }
            >
              <Text className="font-semibold text-white dark:text-black">
                Edit category
              </Text>
            </Pressable>

            {category.isActive && (
              <Pressable
                className="items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-900/50 dark:bg-red-950/30"
                disabled={archiveCategory.isPending}
                onPress={handleArchive}
              >
                <Text className="font-semibold text-red-600 dark:text-red-400">
                  {archiveCategory.isPending ? "Archiving..." : "Archive category"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

