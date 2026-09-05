import { AccountForm, type AccountFormValues } from "@/components/account-form";
import { useFinancialAccount } from "@/hooks/use-financial-accounts";
import { useUpdateFinancialAccount } from "@/hooks/use-financial-account-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const accountQuery = useFinancialAccount(id);
  const updateAccount = useUpdateFinancialAccount();

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

  async function handleSubmit(values: AccountFormValues) {
    try {
      await updateAccount.mutateAsync({
        id,
        name: values.name,
      });

      router.back();
    } catch (error) {
      showMutationError(error, "Unable to update account. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit account",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 bg-background">
        <AccountForm
          defaultValues={{
            name: account.name,
            type: account.type,
            currency: account.currency,
          }}
          isEdit={true}
          submitLabel="Save changes"
          isSubmitting={updateAccount.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

