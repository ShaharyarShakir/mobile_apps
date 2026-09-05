import { useFinancialAccounts } from "@/hooks/use-financial-accounts";
import { router, Stack } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function AccountsScreen() {
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useFinancialAccounts();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Loading accounts...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
        <Text className="text-danger">Unable to load accounts.</Text>

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

  const accounts = data?.accounts ?? [];
  const assets = accounts.filter((a) => a.type === "ASSET");
  const liabilities = accounts.filter((a) => a.type === "LIABILITY");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Accounts",
          headerRight: () => (
            <Pressable onPress={() => router.push("/(app)/account/create")}>
              <Text className="font-semibold text-foreground">New</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          accounts.length > 0 ? (
            <View className="flex-row gap-3 p-4 bg-muted/40 border-b border-border">
              <View className="flex-1 rounded-xl bg-card p-3 border border-border">
                <Text className="text-xs text-muted-foreground">Assets</Text>
                <Text className="text-xl font-bold text-foreground">
                  {assets.length}
                </Text>
              </View>
              <View className="flex-1 rounded-xl bg-card p-3 border border-border">
                <Text className="text-xs text-muted-foreground">Liabilities</Text>
                <Text className="text-xl font-bold text-foreground">
                  {liabilities.length}
                </Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center gap-2 p-8">
            <Text className="text-lg font-semibold text-foreground">
              No accounts yet
            </Text>
            <Text className="text-center text-muted-foreground">
              Add your cash wallet, bank accounts, or cards to start tracking your finances.
            </Text>
            <Pressable
              className="mt-4 rounded-xl bg-black px-4 py-3 dark:bg-white"
              onPress={() => router.push("/(app)/account/create")}
            >
              <Text className="font-semibold text-white dark:text-black">
                Add account
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center justify-between border-b border-border px-4 py-4"
            onPress={() =>
              router.push({
                pathname: "/(app)/account/[id]",
                params: { id: item.id },
              })
            }
          >
            <View className="gap-1 flex-1">
              <View className="flex-row items-center gap-2">
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
              <Text className="text-xs text-muted-foreground">
                {item.currency}
              </Text>
            </View>

            <View
              className={`rounded-lg px-2.5 py-1 ${
                item.type === "ASSET"
                  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : "bg-amber-50 dark:bg-amber-950/40"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.type === "ASSET"
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

