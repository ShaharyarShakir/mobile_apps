import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "@/services/authStore";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { Spacing } from "@/constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Live password validation checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = checks.length && checks.upper && checks.lower && checks.number;

  const handleRegister = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.trim().length > 50) {
      setError("Name must not exceed 50 characters.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please satisfy all password requirements.");
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace("/(app)");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title} type="title">
              WanderWise
            </ThemedText>
            <ThemedText style={styles.subtitle} type="small" themeColor="textSecondary">
              Your AI-Powered Travel Companion
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Create a New Account
            </ThemedText>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: "#FFECEC", borderColor: "#FF5B5B" }]}>
                <ThemedText style={styles.errorText} type="small">
                  {error}
                </ThemedText>
              </View>
            )}

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type="small" themeColor="textSecondary">
                Full Name
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                    borderColor: nameFocused ? "#3c87f7" : "transparent",
                  },
                ]}
                placeholder="Enter your name (max 50 chars)"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type="small" themeColor="textSecondary">
                Email Address
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                    borderColor: emailFocused ? "#3c87f7" : "transparent",
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label} type="small" themeColor="textSecondary">
                Password
              </ThemedText>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    {
                      color: theme.text,
                      backgroundColor: theme.backgroundElement,
                      borderColor: passwordFocused ? "#3c87f7" : "transparent",
                    },
                  ]}
                  placeholder="Create a strong password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => password.length === 0 ? setPasswordFocused(false) : undefined}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <ThemedText type="smallBold" style={{ color: "#3c87f7" }}>
                    {showPassword ? "Hide" : "Show"}
                  </ThemedText>
                </Pressable>
              </View>

              {/* Password validation indicators */}
              {(password.length > 0 || passwordFocused) && (
                <View style={styles.validationContainer}>
                  <ThemedText
                    type="code"
                    style={{ color: checks.length ? "#2E7D32" : "#C62828", fontSize: 13 }}
                  >
                    {checks.length ? "✓" : "✗"} At least 8 characters
                  </ThemedText>
                  <ThemedText
                    type="code"
                    style={{ color: checks.upper ? "#2E7D32" : "#C62828", fontSize: 13 }}
                  >
                    {checks.upper ? "✓" : "✗"} One uppercase letter
                  </ThemedText>
                  <ThemedText
                    type="code"
                    style={{ color: checks.lower ? "#2E7D32" : "#C62828", fontSize: 13 }}
                  >
                    {checks.lower ? "✓" : "✗"} One lowercase letter
                  </ThemedText>
                  <ThemedText
                    type="code"
                    style={{ color: checks.number ? "#2E7D32" : "#C62828", fontSize: 13 }}
                  >
                    {checks.number ? "✓" : "✗"} One number
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Register Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? "#2b6bc4" : "#3c87f7" },
                (isLoading || !isPasswordValid) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText} type="smallBold">
                  Register
                </ThemedText>
              )}
            </Pressable>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Already have an account?{" "}
            </ThemedText>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <ThemedText type="smallBold" style={{ color: "#3c87f7" }}>
                  Log In
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  sectionLabel: {
    marginBottom: Spacing.two,
  },
  errorBox: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  errorText: {
    color: "#D32F2F",
  },
  inputGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 50,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    borderWidth: 1.5,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: Spacing.three,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: Spacing.one,
  },
  validationContainer: {
    marginTop: Spacing.one,
    gap: Spacing.half,
    paddingLeft: Spacing.one,
  },
  button: {
    height: 50,
    borderRadius: Spacing.two,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.five,
    alignItems: "center",
  },
});
