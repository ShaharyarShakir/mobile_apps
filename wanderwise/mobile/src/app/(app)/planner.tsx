import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function PlannerScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <ThemedText style={styles.emoji}>📅</ThemedText>
        <ThemedText type="subtitle">Trip Planner</ThemedText>
        <ThemedText style={styles.desc} type="small" themeColor="textSecondary">
          Plan your itineraries, schedule sights, and prepare for your next adventure. Coming soon in Phase 3!
        </ThemedText>
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
  center: {
    alignItems: "center",
    gap: Spacing.two,
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  desc: {
    textAlign: "center",
    marginTop: Spacing.one,
  },
});
