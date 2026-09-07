import { useForm } from "@tanstack/react-form";
import { View } from "react-native";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextField,
} from "heroui-native";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/project-form-schema";

export { projectFormSchema, type ProjectFormValues };

export type ProjectFormProps = {
  defaultValues?: Partial<ProjectFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
};

export function ProjectForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ProjectFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
    validators: {
      onSubmit: projectFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <View className="gap-5 p-5">
      <form.Field name="name">
        {(field) => {
          const hasError = !field.state.meta.isValid && field.state.meta.errors.length > 0;
          return (
            <TextField isInvalid={hasError}>
              <Label className="text-sm font-semibold text-foreground">Project Name</Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="e.g. Home Renovation, New Car"
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

      <form.Field name="description">
        {(field) => {
          const hasError = !field.state.meta.isValid && field.state.meta.errors.length > 0;
          return (
            <TextField isInvalid={hasError}>
              <Label className="text-sm font-semibold text-foreground">Description (Optional)</Label>
              <Input
                className="min-h-24 pt-3"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="Details or budget goals for this project"
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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

