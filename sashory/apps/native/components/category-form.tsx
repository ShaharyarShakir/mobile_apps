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
  categoryFormSchema,
  type CategoryFormValues,
} from "@/lib/category-form-schema";

export { categoryFormSchema, type CategoryFormValues };

export type CategoryFormProps = {
  defaultValues?: Partial<CategoryFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  isEdit?: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CategoryForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  isEdit = false,
  onSubmit,
}: CategoryFormProps) {
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: (defaultValues?.type ?? "EXPENSE") as "EXPENSE" | "INCOME",
    },
    validators: {
      onSubmit: categoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <View className="gap-5 p-5">
      {/* Category Type Selector */}
      <form.Field name="type">
        {(field) => (
          <View className="gap-2.5">
            <Label className="text-sm font-semibold text-foreground">Category Type</Label>
            {isEdit ? (
              <Surface variant="secondary" className="p-4 rounded-2xl border border-border">
                <Text className="text-foreground font-semibold">
                  {field.state.value === "EXPENSE" ? "Expense (Money going out)" : "Income (Money coming in)"}
                </Text>
              </Surface>
            ) : (
              <View className="flex-row gap-3">
                <Pressable
                  className={`flex-1 p-4 rounded-2xl border items-center justify-center gap-1.5 ${
                    field.state.value === "EXPENSE"
                      ? "border-rose-500 bg-rose-500/10"
                      : "border-border bg-surface"
                  }`}
                  disabled={isSubmitting}
                  onPress={() => field.handleChange("EXPENSE")}
                >
                  <Ionicons
                    name="trending-down"
                    size={22}
                    color={field.state.value === "EXPENSE" ? "#F43F5E" : mutedColor}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      field.state.value === "EXPENSE"
                        ? "text-rose-500"
                        : "text-foreground"
                    }`}
                  >
                    Expense
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Food, Transport, Bills
                  </Text>
                </Pressable>

                <Pressable
                  className={`flex-1 p-4 rounded-2xl border items-center justify-center gap-1.5 ${
                    field.state.value === "INCOME"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border bg-surface"
                  }`}
                  disabled={isSubmitting}
                  onPress={() => field.handleChange("INCOME")}
                >
                  <Ionicons
                    name="trending-up"
                    size={22}
                    color={field.state.value === "INCOME" ? "#10B981" : mutedColor}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      field.state.value === "INCOME"
                        ? "text-emerald-500"
                        : "text-foreground"
                    }`}
                  >
                    Income
                  </Text>
                  <Text className="text-xs text-muted-foreground text-center">
                    Salary, Freelance, ROI
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </form.Field>

      {/* Category Name */}
      <form.Field name="name">
        {(field) => {
          const hasError = !field.state.meta.isValid && field.state.meta.errors.length > 0;
          return (
            <TextField isInvalid={hasError}>
              <Label className="text-sm font-semibold text-foreground">Category Name</Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="e.g. Groceries, Dining, Rent"
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

