import { useCategories } from "@/hooks/use-categories";
import { router, Stack } from "expo-router";
import {
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";

export default function CategoriesScreen() {
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useCategories();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Loading categories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
        <Text className="text-danger">Unable to load categories.</Text>

        <Pressable
          className="rounded-xl bg-black px-4 py-3 dark:bg-white"
          onPress={() => refetch()}
        >
          <Text className="font-semibold text-white dark:text-black">
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  const categories = data?.categories ?? [];
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const sections = [
    {
      title: "Income",
      data: incomeCategories,
    },
    {
      title: "Expense",
      data: expenseCategories,
    },
  ].filter((s) => s.data.length > 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Categories",
          headerRight: () => (
            <Pressable onPress={() => router.push("/(app)/category/create")}>
              <Text className="font-semibold text-foreground">New</Text>
            </Pressable>
          ),
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          categories.length > 0 ? (
            <View className="flex-row gap-3 p-4 bg-muted/40 border-b border-border">
              <View className="flex-1 rounded-xl bg-card p-3 border border-border">
                <Text className="text-xs text-muted-foreground">Income Categories</Text>
                <Text className="text-xl font-bold text-foreground">
                  {incomeCategories.length}
                </Text>
              </View>
              <View className="flex-1 rounded-xl bg-card p-3 border border-border">
                <Text className="text-xs text-muted-foreground">Expense Categories</Text>
                <Text className="text-xl font-bold text-foreground">
                  {expenseCategories.length}
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center gap-2 p-8">
            <Text className="text-lg font-semibold text-foreground">
              No categories yet
            </Text>
            <Text className="text-center text-muted-foreground">
              Categories tell you what money was spent on or where it came from.
            </Text>
            <Pressable
              className="mt-4 rounded-xl bg-black px-4 py-3 dark:bg-white"
              onPress={() => router.push("/(app)/category/create")}
            >
              <Text className="font-semibold text-white dark:text-black">
                Add category
              </Text>
            </Pressable>
          </View>
        }
        renderSectionHeader={({ section: { title, data: sectionData } }) => (
          <View className="bg-muted px-4 py-2 border-b border-border flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {title}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {sectionData.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-4"
            onPress={() =>
              router.push({
                pathname: "/(app)/category/[id]",
                params: { id: item.id },
              })
            }
          >
            <View className="flex-row items-center gap-2 flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.name}
              </Text>
              {!item.isActive && (
                <View className="rounded-md bg-gray-200 px-1.5 py-0.5 dark:bg-gray-700">
                  <Text className="text-xs text-gray-600 dark:text-gray-300">
                    Archived
                  </Text>
                </View>
              )}
            </View>

            <View
              className={`rounded-lg px-2.5 py-1 ${
                item.type === "INCOME"
                  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : "bg-amber-50 dark:bg-amber-950/40"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.type === "INCOME"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {item.type}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </>
  );
}

