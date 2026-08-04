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

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(app)");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
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
              Log In to Your Account
            </ThemedText>

            {error && (
              <View style={[styles.errorBox, { backgroundColor: "#FFECEC", borderColor: "#FF5B5B" }]}>
                <ThemedText style={styles.errorText} type="small">
                  {error}
                </ThemedText>
              </View>
            )}

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
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? "#2b6bc4" : "#3c87f7" },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.buttonText} type="smallBold">
                  Log In
                </ThemedText>
              )}
            </Pressable>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              Don't have an account?{" "}
            </ThemedText>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <ThemedText type="smallBold" style={{ color: "#3c87f7" }}>
                  Register
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
