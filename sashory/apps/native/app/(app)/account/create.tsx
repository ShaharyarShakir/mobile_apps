import { AccountForm, type AccountFormValues } from "@/components/account-form";
import { useCreateFinancialAccount } from "@/hooks/use-financial-account-mutations";
import { showMutationError } from "@/lib/mutation-error";
import { Stack, useRouter } from "expo-router";
import { ScrollView } from "react-native";

export default function CreateAccountScreen() {
  const router = useRouter();
  const createAccount = useCreateFinancialAccount();

  async function handleSubmit(values: AccountFormValues) {
    try {
      const result = await createAccount.mutateAsync({
        name: values.name,
        type: values.type,
        currency: values.currency,
      });

      router.replace({
        pathname: "/(app)/account/[id]",
        params: {
          id: result.account.id,
        },
      });
    } catch (error) {
      showMutationError(error, "Unable to create account. Please try again.");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Account",
        }}
      />

      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 bg-background">
        <AccountForm
          submitLabel="Create account"
          isSubmitting={createAccount.isPending}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </>
  );
}

