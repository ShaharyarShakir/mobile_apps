import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/services/authStore";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar Placeholder */}
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText} type="subtitle">
            {user?.name ? user.name[0].toUpperCase() : "T"}
          </ThemedText>
        </View>

        {/* User Info */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.name} type="subtitle">
            {user?.name || "Anonymous Traveler"}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user?.email || "No email available"}
          </ThemedText>
        </View>

        {/* Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: pressed ? "#d32f2f" : "#f44336" },
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.logoutText} type="smallBold">
              Log Out
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    gap: Spacing.four,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#3c87f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "bold",
  },
  infoSection: {
    alignItems: "center",
    gap: Spacing.one,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutButton: {
    height: 50,
    borderRadius: Spacing.two,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.four,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
