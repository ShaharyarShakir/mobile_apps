import { useMe } from "@/hooks/use-me";
import { useFinancialAccounts } from "@/hooks/use-financial-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useProjects } from "@/hooks/use-projects";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { data: meData, isPending: mePending, refetch: refetchMe } = useMe();
  const {
    data: accountsData,
    isPending: accountsPending,
    refetch: refetchAccounts,
  } = useFinancialAccounts();
  const {
    data: categoriesData,
    isPending: categoriesPending,
    refetch: refetchCategories,
  } = useCategories();
  const {
    data: projectsData,
    isPending: projectsPending,
    refetch: refetchProjects,
  } = useProjects();

  const accentColor = useThemeColor("accent");
  const accentForegroundColor = useThemeColor("accent-foreground");
  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchMe(),
      refetchAccounts(),
      refetchCategories(),
      refetchProjects(),
    ]);
    setRefreshing(false);
  };

  const isLoading = mePending && accountsPending;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-muted-foreground mt-3 text-sm">Loading your dashboard...</Text>
      </View>
    );
  }

  const user = meData?.user;
  const accounts = accountsData?.accounts ?? [];
  const categories = categoriesData?.categories ?? [];
  const projects = projectsData?.projects ?? [];

  const assetAccounts = accounts.filter((a) => a.type === "ASSET" && a.isActive);
  const liabilityAccounts = accounts.filter((a) => a.type === "LIABILITY" && a.isActive);
  const incomeCategories = categories.filter((c) => c.type === "INCOME" && c.isActive);
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE" && c.isActive);

  // Distinct currencies
  const currencies = Array.from(new Set(accounts.map((a) => a.currency)));
  const primaryCurrency = currencies[0] || "PKR";

  // Initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CA";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-5 gap-6">
        {/* Top Header Bar */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push("/(app)/profile")}
              className="w-11 h-11 rounded-full items-center justify-center bg-accent"
            >
              <Text className="text-accent-foreground font-bold text-base">
                {initials}
              </Text>
            </Pressable>
            <View>
              <Text className="text-xs text-muted-foreground font-medium">
                Welcome back 👋
              </Text>
              <Text className="text-lg font-bold text-foreground">
                {user?.name || "Cashory Member"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <ThemeToggle />
            <Pressable
              onPress={() => router.push("/(app)/profile")}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Ionicons name="person-circle-outline" size={26} color={foregroundColor} />
            </Pressable>
          </View>
        </View>

        {/* Hero Financial Overview Card */}
        <View className="rounded-3xl bg-accent p-6 shadow-sm overflow-hidden">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-xs font-bold tracking-wider text-accent-foreground/80 uppercase">
                Financial Overview
              </Text>
            </View>
            <View className="px-2.5 py-0.5 rounded-full bg-accent-foreground/15">
              <Text className="text-xs font-semibold text-accent-foreground">
                {primaryCurrency}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-1">
            <View className="flex-1">
              <Text className="text-xs text-accent-foreground/80 font-medium">
                Active Assets
              </Text>
              <View className="flex-row items-baseline gap-1 mt-1">
                <Text className="text-3xl font-bold text-accent-foreground">
                  {assetAccounts.length}
                </Text>
                <Text className="text-xs text-accent-foreground/70">
                  {assetAccounts.length === 1 ? "account" : "accounts"}
                </Text>
              </View>
            </View>

            <View className="h-10 w-[1px] bg-accent-foreground/20 mx-4" />

            <View className="flex-1">
              <Text className="text-xs text-accent-foreground/80 font-medium">
                Liabilities
              </Text>
              <View className="flex-row items-baseline gap-1 mt-1">
                <Text className="text-3xl font-bold text-accent-foreground">
                  {liabilityAccounts.length}
                </Text>
                <Text className="text-xs text-accent-foreground/70">
                  {liabilityAccounts.length === 1 ? "account" : "accounts"}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 pt-4 border-t border-accent-foreground/15 flex-row items-center justify-between">
            <Text className="text-xs text-accent-foreground/80">
              Total Accounts: {accounts.length}
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/account/create")}
              className="flex-row items-center gap-1 bg-accent-foreground/20 px-3 py-1.5 rounded-full"
            >
              <Ionicons name="add" size={16} color={accentForegroundColor} />
              <Text className="text-xs font-semibold text-accent-foreground">
                Add Account
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Navigation Cards */}
        <View className="gap-3">
          <Text className="text-base font-bold text-foreground">
            Manage & Organize
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/(app)/accounts")}
              className="flex-1"
            >
              <Surface
                variant="secondary"
                className="p-4 rounded-2xl border border-border gap-2"
              >
                <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Ionicons name="wallet-outline" size={22} color="#10B981" />
                </View>
                <Text className="text-sm font-bold text-foreground">
                  Accounts
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {accounts.length} Total
                </Text>
              </Surface>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(app)/categories")}
              className="flex-1"
            >
              <Surface
                variant="secondary"
                className="p-4 rounded-2xl border border-border gap-2"
              >
                <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center">
                  <Ionicons name="pricetag-outline" size={22} color="#F59E0B" />
                </View>
                <Text className="text-sm font-bold text-foreground">
                  Categories
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {categories.length} Total
                </Text>
              </Surface>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(app)/projects")}
              className="flex-1"
            >
              <Surface
                variant="secondary"
                className="p-4 rounded-2xl border border-border gap-2"
              >
                <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Ionicons name="folder-outline" size={22} color="#3B82F6" />
                </View>
                <Text className="text-sm font-bold text-foreground">
                  Projects
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {projects.length} Total
                </Text>
              </Surface>
            </Pressable>
          </View>
        </View>

        {/* Recent Accounts Preview */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-foreground">
              My Accounts
            </Text>
            {accounts.length > 0 && (
              <Pressable
                onPress={() => router.push("/(app)/accounts")}
                className="flex-row items-center gap-1"
              >
                <Text className="text-xs font-semibold text-accent">View All</Text>
                <Ionicons name="chevron-forward" size={14} color={accentColor} />
              </Pressable>
            )}
          </View>

          {accounts.length === 0 ? (
            <Surface
              variant="secondary"
              className="p-6 rounded-2xl border border-border items-center gap-3"
            >
              <View className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center">
                <Ionicons name="card-outline" size={26} color={accentColor} />
              </View>
              <Text className="text-base font-bold text-foreground text-center">
                No accounts connected
              </Text>
              <Text className="text-xs text-muted-foreground text-center max-w-xs">
                Add your bank accounts, cash wallets, or credit cards to start tracking your cash flow.
              </Text>
              <Button
                onPress={() => router.push("/(app)/account/create")}
                className="mt-2 bg-accent"
                size="sm"
              >
                <Button.Label className="text-accent-foreground font-semibold">
                  + Add First Account
                </Button.Label>
              </Button>
            </Surface>
          ) : (
            <View className="gap-2.5">
              {accounts.slice(0, 3).map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/account/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <Surface
                    variant="secondary"
                    className="p-4 rounded-2xl border border-border flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center ${
                          item.type === "ASSET"
                            ? "bg-emerald-500/10"
                            : "bg-amber-500/10"
                        }`}
                      >
                        <Ionicons
                          name={
                            item.type === "ASSET"
                              ? "cash-outline"
                              : "card-outline"
                          }
                          size={20}
                          color={item.type === "ASSET" ? "#10B981" : "#F59E0B"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-foreground">
                          {item.name}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {item.currency} • {item.type === "ASSET" ? "Asset" : "Liability"}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={mutedColor}
                    />
                  </Surface>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Quick Category Summary */}
        <Surface
          variant="secondary"
          className="p-5 rounded-2xl border border-border gap-3"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-foreground">
              Categories Breakdown
            </Text>
            <Pressable onPress={() => router.push("/(app)/categories")}>
              <Text className="text-xs font-semibold text-accent">Manage</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 pt-1">
            <View className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-lg bg-emerald-500/15 items-center justify-center">
                <Ionicons name="trending-up" size={16} color="#10B981" />
              </View>
              <View>
                <Text className="text-xs text-muted-foreground">Income</Text>
                <Text className="text-base font-bold text-foreground">
                  {incomeCategories.length}
                </Text>
              </View>
            </View>

            <View className="flex-1 bg-surface p-3 rounded-xl border border-border flex-row items-center gap-2.5">
              <View className="w-8 h-8 rounded-lg bg-rose-500/15 items-center justify-center">
                <Ionicons name="trending-down" size={16} color="#F43F5E" />
              </View>
              <View>
                <Text className="text-xs text-muted-foreground">Expense</Text>
                <Text className="text-base font-bold text-foreground">
                  {expenseCategories.length}
                </Text>
              </View>
            </View>
          </View>
        </Surface>
      </View>
    </ScrollView>
  );
}


