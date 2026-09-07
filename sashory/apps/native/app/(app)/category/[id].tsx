import { useCategory } from "@/hooks/use-categories";
import { useArchiveCategory } from "@/hooks/use-category-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Button, Surface } from "heroui-native";
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

      <ScrollView className="flex-1 p-5 bg-background">
        <View className="gap-6">
          {/* Header Card */}
          <Surface variant="secondary" className="rounded-3xl border border-border p-6 gap-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    category.type === "INCOME"
                      ? "bg-emerald-500/15"
                      : "bg-rose-500/15"
                  }`}
                >
                  <Ionicons
                    name={category.type === "INCOME" ? "trending-up" : "trending-down"}
                    size={26}
                    color={category.type === "INCOME" ? "#10B981" : "#F43F5E"}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">
                    {category.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Created {createdAtFormatted}
                  </Text>
                </View>
              </View>

              <View
                className={`rounded-full px-3 py-1 ${
                  category.type === "INCOME"
                    ? "bg-emerald-500/15"
                    : "bg-rose-500/15"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    category.type === "INCOME"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-rose-700 dark:text-rose-400"
                  }`}
                >
                  {category.type}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 border-t border-border/70 pt-4">
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground font-medium">Type Classification</Text>
                <Text className="text-base font-bold text-foreground mt-0.5">
                  {category.type === "INCOME" ? "Income Stream" : "Expense Flow"}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground font-medium">Status</Text>
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <View
                    className={`w-2 h-2 rounded-full ${
                      category.isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  <Text
                    className={`text-base font-bold ${
                      category.isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {category.isActive ? "Active" : "Archived"}
                  </Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Action Buttons */}
          <View className="gap-3 mt-2">
            <Button
              className="bg-accent"
              size="lg"
              onPress={() =>
                router.push({
                  pathname: "/(app)/category/[id]/edit",
                  params: { id },
                })
              }
            >
              <Button.Label className="text-accent-foreground font-semibold">
                Edit Category
              </Button.Label>
            </Button>

            {category.isActive && (
              <Button
                variant="danger"
                size="lg"
                isDisabled={archiveCategory.isPending}
                onPress={handleArchive}
              >
                <Button.Label>
                  {archiveCategory.isPending ? "Archiving..." : "Archive Category"}
                </Button.Label>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

