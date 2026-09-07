import { useForm } from "@tanstack/react-form";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  Surface,
  TextField,
  useThemeColor,
  useToast,
} from "heroui-native";
import { useRef } from "react";
import { Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(8, "Use at least 8 characters"),
});

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (typeof error === "string") {
    return error;
  }

  if (Array.isArray(error)) {
    for (const issue of error) {
      const message = getErrorMessage(issue);
      if (message) {
        return message;
      }
    }
    return null;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as { message?: unknown };
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
  }

  return null;
}

import { Logo } from "@/components/ui/logo";

export function SignUp() {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const { toast } = useToast();
  const router = useRouter();
  const themeForeground = useThemeColor("foreground");
  const logoColor =
    themeForeground && themeForeground !== "invalid" ? themeForeground : "#000000";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = await authClient.signUp.email({
        name: value.name.trim(),
        email: value.email.trim(),
        password: value.password,
      });

      if (result.error) {
        toast.show({
          variant: "danger",
          label: result.error.message || "Failed to sign up",
        });
        return;
      }

      formApi.reset();
      toast.show({
        variant: "success",
        label: "Account created successfully",
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session,
      });

      router.replace("/(app)/home");
    },
  });

  return (
    <View className="w-full max-w-md self-center">
      {/* Brand Header */}
      <View className="items-center mb-8">
        <Logo size={1.25} color={logoColor} />
        <Text className="text-2xl font-bold text-foreground mt-4">Get Started</Text>
        <Text className="text-sm text-muted-foreground mt-1 text-center">
          Create your Cashory account to start tracking wealth
        </Text>
      </View>

      <Surface variant="secondary" className="p-6 rounded-3xl border border-border">
        <Text className="text-lg font-bold text-foreground mb-5">Create Account</Text>

        <form.Subscribe
          selector={(state) => ({
            isSubmitting: state.isSubmitting,
            validationError: getErrorMessage(state.errorMap.onSubmit),
          })}
        >
          {({ isSubmitting, validationError }) => {
            const formError = validationError;

            return (
              <>
                <FieldError isInvalid={!!formError} className="mb-4">
                  {formError}
                </FieldError>

                <View className="gap-4">
                  <form.Field name="name">
                    {(field) => (
                      <TextField>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChangeText={field.handleChange}
                          placeholder="Your full name"
                          autoComplete="name"
                          textContentType="name"
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            emailInputRef.current?.focus();
                          }}
                        />
                      </TextField>
                    )}
                  </form.Field>

                  <form.Field name="email">
                    {(field) => (
                      <TextField>
                        <Label className="text-sm font-medium">Email address</Label>
                        <Input
                          ref={emailInputRef}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChangeText={field.handleChange}
                          placeholder="you@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          textContentType="emailAddress"
                          returnKeyType="next"
                          blurOnSubmit={false}
                          onSubmitEditing={() => {
                            passwordInputRef.current?.focus();
                          }}
                        />
                      </TextField>
                    )}
                  </form.Field>

                  <form.Field name="password">
                    {(field) => (
                      <TextField>
                        <Label className="text-sm font-medium">Password</Label>
                        <Input
                          ref={passwordInputRef}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChangeText={field.handleChange}
                          placeholder="At least 8 characters"
                          secureTextEntry
                          autoComplete="new-password"
                          textContentType="newPassword"
                          returnKeyType="go"
                          onSubmitEditing={form.handleSubmit}
                        />
                      </TextField>
                    )}
                  </form.Field>

                  <Button
                    onPress={form.handleSubmit}
                    isDisabled={isSubmitting}
                    className="mt-2 bg-accent"
                  >
                    {isSubmitting ? (
                      <Spinner size="sm" color="default" />
                    ) : (
                      <Button.Label className="text-accent-foreground font-semibold">
                        Create Account
                      </Button.Label>
                    )}
                  </Button>

                  <View className="flex-row justify-center items-center mt-3 pt-3 border-t border-border/50">
                    <Text className="text-muted-foreground text-sm">Already have an account? </Text>
                    <Button variant="ghost" size="sm" onPress={() => router.push("/(auth)/sign-in")}>
                      <Button.Label className="text-accent font-semibold">Sign In</Button.Label>
                    </Button>
                  </View>
                </View>
              </>
            );
          }}
        </form.Subscribe>
      </Surface>
    </View>
  );
}

export default SignUp;

