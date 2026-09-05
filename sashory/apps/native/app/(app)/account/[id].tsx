import { useFinancialAccount } from "@/hooks/use-financial-accounts";
import { useArchiveFinancialAccount } from "@/hooks/use-financial-account-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function AccountDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const accountQuery = useFinancialAccount(id);
  const archiveAccount = useArchiveFinancialAccount();

  if (accountQuery.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Loading account...</Text>
      </View>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
        <Text className="text-danger">Unable to load account.</Text>
        <Pressable
          className="rounded-xl bg-black px-4 py-3 dark:bg-white"
          onPress={() => accountQuery.refetch()}
        >
          <Text className="font-semibold text-white dark:text-black">Try again</Text>
        </Pressable>
      </View>
    );
  }

  const account = accountQuery.data.account;
  const createdAtFormatted = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  function handleArchive() {
    Alert.alert(
      "Archive account",
      "Archiving this account hides it from active selections while preserving its financial history.",
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
              await archiveAccount.mutateAsync(id);
              router.replace("/(app)/accounts");
            } catch (error) {
              showMutationError(error, "Unable to archive account. Please try again.");
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
          title: account.name || "Account",
        }}
      />

      <ScrollView className="flex-1 p-4 bg-background">
        <View className="gap-6">
          {/* Header Card */}
          <View className="rounded-2xl border border-border bg-card p-5 gap-4">
            <View className="flex-row items-center justify-between">
              <View className="gap-1 flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  {account.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Created {createdAtFormatted}
                </Text>
              </View>

              <View
                className={`rounded-lg px-2.5 py-1 ${
                  account.type === "ASSET"
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "bg-amber-50 dark:bg-amber-950/40"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    account.type === "ASSET"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {account.type}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Currency</Text>
                <Text className="text-base font-semibold text-foreground">
                  {account.currency}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Status</Text>
                <Text
                  className={`text-base font-semibold ${
                    account.isActive ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {account.isActive ? "Active" : "Archived"}
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
                  pathname: "/(app)/account/[id]/edit",
                  params: { id },
                })
              }
            >
              <Text className="font-semibold text-white dark:text-black">
                Edit account
              </Text>
            </Pressable>

            {account.isActive && (
              <Pressable
                className="items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-900/50 dark:bg-red-950/30"
                disabled={archiveAccount.isPending}
                onPress={handleArchive}
              >
                <Text className="font-semibold text-red-600 dark:text-red-400">
                  {archiveAccount.isPending ? "Archiving..." : "Archive account"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

