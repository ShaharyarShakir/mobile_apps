import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "@/services/authStore";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function RootLayout() {
  const { token, isRestoring, restoreSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Try to restore session on startup
  useEffect(() => {
    restoreSession();
  }, []);

  // Handle redirection based on auth state changes
  useEffect(() => {
    if (isRestoring) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";

    if (!token) {
      // If not logged in, and not on an auth screen, redirect to login
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    } else {
      // If logged in, and in auth screen (or root), redirect to app
      if (inAuthGroup || segs.length === 0 || segs[0] === "index") {
        router.replace("/(app)");
      }
    }
  }, [token, isRestoring, segments]);

  if (isRestoring) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c87f7" />
        <ThemedText style={styles.loadingText} type="small" themeColor="textSecondary">
          WanderWise is loading...
        </ThemedText>
      </ThemedView>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  loadingText: {
    marginTop: Spacing.two,
  },
});