import { useForm } from "@tanstack/react-form";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  useThemeColor,
} from "heroui-native";
import {
  accountFormSchema,
  type AccountFormValues,
} from "@/lib/account-form-schema";

export { accountFormSchema, type AccountFormValues };

export type AccountFormProps = {
  defaultValues?: Partial<AccountFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  isEdit?: boolean;
  onSubmit: (values: AccountFormValues) => Promise<void>;
};

export function AccountForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  isEdit = false,
  onSubmit,
}: AccountFormProps) {
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: (defaultValues?.type ?? "ASSET") as "ASSET" | "LIABILITY",
      currency: defaultValues?.currency ?? "PKR",
    },
    validators: {
      onSubmit: accountFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <View className="gap-5 p-5">
      {/* Account Type Selector */}
      <form.Field name="type">
        {(field) => (
          <View className="gap-2.5">
            <Label className="text-sm font-semibold text-foreground">Account Type</Label>
            {isEdit ? (
              <Surface variant="secondary" className="p-4 rounded-2xl border border-border">
                <Text className="text-foreground font-semibold">
                  {field.state.value === "ASSET" ? "Asset (Cash, Bank, Savings)" : "Liability (Credit Card, Loan)"}
                </Text>
              </Surface>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 p-4 rounded-2xl border items-center justify-center gap-1.5 ${
                    field.state.value === "ASSET"
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface"
                  }`}
                  disabled={isSubmitting}
                  onPress={() => field.handleChange("ASSET")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={22}
                    color={field.state.value === "ASSET" ? accentColor : mutedColor}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      field.state.value === "ASSET"
                        ? "text-accent"
                        : "text-foreground"
                    }`}
                  >
                    Asset
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Cash, Bank, Savings
                  </Text>
                </Pressable>

                <Pressable
                  className={`flex-1 p-4 rounded-2xl border items-center justify-center gap-1.5 ${
                    field.state.value === "LIABILITY"
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface"
                  }`}
                  disabled={isSubmitting}
                  onPress={() => field.handleChange("LIABILITY")}
                >
                  <Ionicons
                    name="card-outline"
                    size={22}
                    color={field.state.value === "LIABILITY" ? accentColor : mutedColor}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      field.state.value === "LIABILITY"
                        ? "text-accent"
                        : "text-foreground"
                    }`}
                  >
                    Liability
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Credit Card, Loan
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </form.Field>

      {/* Account Name */}
      <form.Field name="name">
        {(field) => {
          const hasError = !field.state.meta.isValid && field.state.meta.errors.length > 0;
          return (
            <TextField isInvalid={hasError}>
              <Label className="text-sm font-semibold text-foreground">Account Name</Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="e.g. Meezan Bank, Cash Wallet"
                editable={!isSubmitting}
                autoCapitalize="words"
              />
              {hasError && (
                <FieldError className="mt-1">
                  {field.state.meta.errors
                    .map((error: any) =>
                      typeof error === "string" ? error : error?.message,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </FieldError>
              )}
            </TextField>
          );
        }}
      </form.Field>

      {/* Currency */}
      <form.Field name="currency">
        {(field) => {
          const hasError = !field.state.meta.isValid && field.state.meta.errors.length > 0;
          return (
            <TextField isInvalid={hasError}>
              <Label className="text-sm font-semibold text-foreground">Currency</Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={(text) => field.handleChange(text.toUpperCase())}
                placeholder="PKR"
                maxLength={3}
                editable={!isSubmitting && !isEdit}
                autoCapitalize="characters"
              />
              {hasError && (
                <FieldError className="mt-1">
                  {field.state.meta.errors
                    .map((error: any) =>
                      typeof error === "string" ? error : error?.message,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </FieldError>
              )}
            </TextField>
          );
        }}
      </form.Field>

      {/* Submit Button */}
      <Button
        onPress={() => form.handleSubmit()}
        isDisabled={isSubmitting}
        className="mt-3 bg-accent"
        size="lg"
      >
        {isSubmitting ? (
          <Spinner size="sm" color="default" />
        ) : (
          <Button.Label className="text-accent-foreground font-semibold">
            {submitLabel}
          </Button.Label>
        )}
      </Button>
    </View>
  );
}

