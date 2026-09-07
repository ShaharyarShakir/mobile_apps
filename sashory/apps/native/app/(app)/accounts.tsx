import { useFinancialAccounts } from "@/hooks/use-financial-accounts";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function AccountsScreen() {
  const [filter, setFilter] = useState<"ALL" | "ASSET" | "LIABILITY">("ALL");
  const {
    data,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useFinancialAccounts();

  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted-foreground mt-3 text-sm">Loading accounts...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6 bg-background">
        <Text className="text-danger font-medium text-center">Unable to load accounts.</Text>
        <Button onPress={() => refetch()} className="bg-accent">
          <Button.Label className="text-accent-foreground">Try again</Button.Label>
        </Button>
      </View>
    );
  }

  const allAccounts = data?.accounts ?? [];
  const assets = allAccounts.filter((a) => a.type === "ASSET");
  const liabilities = allAccounts.filter((a) => a.type === "LIABILITY");

  const filteredAccounts = allAccounts.filter((a) => {
    if (filter === "ASSET") return a.type === "ASSET";
    if (filter === "LIABILITY") return a.type === "LIABILITY";
    return true;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Accounts",
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/(app)/account/create")}
              className="flex-row items-center gap-1 bg-accent/15 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="add" size={16} color={accentColor} />
              <Text className="font-bold text-xs text-accent">New</Text>
            </Pressable>
          ),
        }}
      />

      <FlatList
        data={filteredAccounts}
        keyExtractor={(item) => item.id}
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View className="p-4 gap-4">
            {/* Metric Summary Cards */}
            <View className="flex-row gap-3">
              <Surface
                variant="secondary"
                className="flex-1 rounded-2xl p-4 border border-border gap-1.5"
              >
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 rounded-lg bg-emerald-500/15 items-center justify-center">
                    <Ionicons name="cash-outline" size={16} color="#10B981" />
                  </View>
                  <Text className="text-xs font-medium text-muted-foreground">Assets</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {assets.length}
                </Text>
              </Surface>

              <Surface
                variant="secondary"
                className="flex-1 rounded-2xl p-4 border border-border gap-1.5"
              >
                <View className="flex-row items-center gap-2">
                  <View className="w-7 h-7 rounded-lg bg-amber-500/15 items-center justify-center">
                    <Ionicons name="card-outline" size={16} color="#F59E0B" />
                  </View>
                  <Text className="text-xs font-medium text-muted-foreground">Liabilities</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">
                  {liabilities.length}
                </Text>
              </Surface>
            </View>

            {/* Filter Pills */}
            <View className="flex-row gap-2 pt-1">
              {(["ALL", "ASSET", "LIABILITY"] as const).map((tab) => {
                const isSelected = filter === tab;
                const label =
                  tab === "ALL"
                    ? `All (${allAccounts.length})`
                    : tab === "ASSET"
                    ? `Assets (${assets.length})`
                    : `Liabilities (${liabilities.length})`;

                return (
                  <Pressable
                    key={tab}
                    onPress={() => setFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-full border ${
                      isSelected
                        ? "bg-accent border-accent"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center gap-3 p-8 my-6">
            <View className="w-14 h-14 rounded-full bg-accent/10 items-center justify-center">
              <Ionicons name="wallet-outline" size={28} color={accentColor} />
            </View>
            <Text className="text-lg font-bold text-foreground text-center">
              {allAccounts.length === 0 ? "No accounts yet" : "No accounts match this filter"}
            </Text>
            <Text className="text-center text-xs text-muted-foreground max-w-xs">
              Add your cash wallets, bank accounts, or credit cards to monitor balances.
            </Text>
            {allAccounts.length === 0 && (
              <Button
                className="mt-3 bg-accent"
                onPress={() => router.push("/(app)/account/create")}
              >
                <Button.Label className="text-accent-foreground font-semibold">
                  + Add Account
                </Button.Label>
              </Button>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-4 py-1.5">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(app)/account/[id]",
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
                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                      item.type === "ASSET"
                        ? "bg-emerald-500/10"
                        : "bg-amber-500/10"
                    }`}
                  >
                    <Ionicons
                      name={item.type === "ASSET" ? "cash-outline" : "card-outline"}
                      size={22}
                      color={item.type === "ASSET" ? "#10B981" : "#F59E0B"}
                    />
                  </View>

                  <View className="gap-0.5 flex-1">
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
                      {item.currency} • {item.type === "ASSET" ? "Asset" : "Liability"}
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

