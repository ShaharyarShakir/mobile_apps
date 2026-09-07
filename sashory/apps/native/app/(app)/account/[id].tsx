import { useFinancialAccount } from "@/hooks/use-financial-accounts";
import { useArchiveFinancialAccount } from "@/hooks/use-financial-account-mutations";
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

      <ScrollView className="flex-1 p-5 bg-background">
        <View className="gap-6">
          {/* Header Card */}
          <Surface variant="secondary" className="rounded-3xl border border-border p-6 gap-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5 flex-1">
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    account.type === "ASSET"
                      ? "bg-emerald-500/15"
                      : "bg-amber-500/15"
                  }`}
                >
                  <Ionicons
                    name={account.type === "ASSET" ? "cash-outline" : "card-outline"}
                    size={26}
                    color={account.type === "ASSET" ? "#10B981" : "#F59E0B"}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">
                    {account.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Created {createdAtFormatted}
                  </Text>
                </View>
              </View>

              <View
                className={`rounded-full px-3 py-1 ${
                  account.type === "ASSET"
                    ? "bg-emerald-500/15"
                    : "bg-amber-500/15"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    account.type === "ASSET"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {account.type}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 border-t border-border/70 pt-4">
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground font-medium">Currency</Text>
                <Text className="text-base font-bold text-foreground mt-0.5">
                  {account.currency}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-xs text-muted-foreground font-medium">Status</Text>
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <View
                    className={`w-2 h-2 rounded-full ${
                      account.isActive ? "bg-emerald-500" : "bg-gray-400"
                    }`}
                  />
                  <Text
                    className={`text-base font-bold ${
                      account.isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {account.isActive ? "Active" : "Archived"}
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
                  pathname: "/(app)/account/[id]/edit",
                  params: { id },
                })
              }
            >
              <Button.Label className="text-accent-foreground font-semibold">
                Edit Account
              </Button.Label>
            </Button>

            {account.isActive && (
              <Button
                variant="danger"
                size="lg"
                isDisabled={archiveAccount.isPending}
                onPress={handleArchive}
              >
                <Button.Label>
                  {archiveAccount.isPending ? "Archiving..." : "Archive Account"}
                </Button.Label>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

