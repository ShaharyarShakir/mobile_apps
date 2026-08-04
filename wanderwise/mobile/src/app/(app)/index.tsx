import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuthStore } from "@/services/authStore";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.greeting} type="subtitle">
            Hello, {user?.name || "Traveler"}! 👋
          </ThemedText>
          <ThemedText style={styles.tagline} type="small" themeColor="textSecondary">
            Where would you like to wander today?
          </ThemedText>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.grid}>
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardEmoji}>✈️</ThemedText>
            <ThemedText style={styles.cardTitle} type="smallBold">
              My Trips
            </ThemedText>
            <ThemedText style={styles.cardDesc} type="code">
              Manage your itineraries
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardEmoji}>🗺️</ThemedText>
            <ThemedText style={styles.cardTitle} type="smallBold">
              Discover
            </ThemedText>
            <ThemedText style={styles.cardDesc} type="code">
              Explore places nearby
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardEmoji}>🤖</ThemedText>
            <ThemedText style={styles.cardTitle} type="smallBold">
              AI Travel Agent
            </ThemedText>
            <ThemedText style={styles.cardDesc} type="code">
              Generate custom schedules
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText style={styles.cardEmoji}>⚙️</ThemedText>
            <ThemedText style={styles.cardTitle} type="smallBold">
              Settings
            </ThemedText>
            <ThemedText style={styles.cardDesc} type="code">
              Configure preferences
            </ThemedText>
          </ThemedView>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  welcomeSection: {
    marginBottom: Spacing.five,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tagline: {
    marginTop: Spacing.one,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
    minHeight: 120,
    justifyContent: "space-between",
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 16,
    marginTop: Spacing.one,
  },
  cardDesc: {
    fontSize: 12,
    opacity: 0.7,
  },
});
