import { useCategories } from "@/hooks/use-categories";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import {
  ActivityIndicator,
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

  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted-foreground mt-3 text-sm">Loading categories...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6 bg-background">
        <Text className="text-danger font-medium text-center">Unable to load categories.</Text>
        <Button onPress={() => refetch()} className="bg-accent">
          <Button.Label className="text-accent-foreground">Try again</Button.Label>
        </Button>
      </View>
    );
  }

  const categories = data?.categories ?? [];
  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const sections = [
    {
      title: "Expense Categories",
      type: "EXPENSE",
      data: expenseCategories,
    },
    {
      title: "Income Categories",
      type: "INCOME",
      data: incomeCategories,
    },
  ].filter((s) => s.data.length > 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Categories",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(app)/category/create")}
              className="flex-row items-center gap-1 bg-accent/15 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="add" size={16} color={accentColor} />
              <Text className="font-bold text-xs text-accent">New</Text>
            </Pressable>
          ),
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          categories.length > 0 ? (
            <View className="p-4 gap-3">
              <View className="flex-row gap-3">
                <Surface
                  variant="secondary"
                  className="flex-1 rounded-2xl p-4 border border-border gap-1.5"
                >
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-lg bg-rose-500/15 items-center justify-center">
                      <Ionicons name="trending-down" size={16} color="#F43F5E" />
                    </View>
                    <Text className="text-xs font-medium text-muted-foreground">Expenses</Text>
                  </View>
                  <Text className="text-2xl font-bold text-foreground">
                    {expenseCategories.length}
                  </Text>
                </Surface>

                <Surface
                  variant="secondary"
                  className="flex-1 rounded-2xl p-4 border border-border gap-1.5"
                >
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-lg bg-emerald-500/15 items-center justify-center">
                      <Ionicons name="trending-up" size={16} color="#10B981" />
                    </View>
                    <Text className="text-xs font-medium text-muted-foreground">Income</Text>
                  </View>
                  <Text className="text-2xl font-bold text-foreground">
                    {incomeCategories.length}
                  </Text>
                </Surface>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center gap-3 p-8 my-6">
            <View className="w-14 h-14 rounded-full bg-accent/10 items-center justify-center">
              <Ionicons name="pricetag-outline" size={28} color={accentColor} />
            </View>
            <Text className="text-lg font-bold text-foreground text-center">
              No categories yet
            </Text>
            <Text className="text-center text-xs text-muted-foreground max-w-xs">
              Categories tell you what money was spent on or where it came from.
            </Text>
            <Button
              className="mt-3 bg-accent"
              onPress={() => router.push("/(app)/category/create")}
            >
              <Button.Label className="text-accent-foreground font-semibold">
                + Add Category
              </Button.Label>
            </Button>
          </View>
        }
        renderSectionHeader={({ section: { title, data: sectionData, type } }) => (
          <View className="px-4 py-2 mt-2 bg-background flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className={`w-2 h-2 rounded-full ${
                  type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <Text className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {title}
              </Text>
            </View>
            <View className="px-2 py-0.5 rounded-full bg-surface border border-border">
              <Text className="text-xs font-semibold text-muted-foreground">
                {sectionData.length}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="px-4 py-1.5">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(app)/category/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Surface
                variant="secondary"
                className="flex-row items-center justify-between p-4 rounded-2xl border border-border"
              >
                <View className="flex-row items-center gap-3.5 flex-1">
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      item.type === "INCOME"
                        ? "bg-emerald-500/10"
                        : "bg-rose-500/10"
                    }`}
                  >
                    <Ionicons
                      name={item.type === "INCOME" ? "trending-up" : "trending-down"}
                      size={20}
                      color={item.type === "INCOME" ? "#10B981" : "#F43F5E"}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-bold text-foreground">
                        {item.name}
                      </Text>
                      {!item.isActive && (
                        <View className="rounded-md bg-muted/40 px-1.5 py-0.5">
                          <Text className="text-[10px] font-semibold text-muted-foreground">
                            Archived
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-muted-foreground font-medium">
                      {item.type === "INCOME" ? "Income stream" : "Expense category"}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={mutedColor} />
              </Surface>
            </Pressable>
          </View>
        )}
      />
    </>
  );
}

