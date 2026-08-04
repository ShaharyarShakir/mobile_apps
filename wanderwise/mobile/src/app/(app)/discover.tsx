import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function DiscoverScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <ThemedText style={styles.emoji}>🔍</ThemedText>
        <ThemedText type="subtitle">Discover Nearby</ThemedText>
        <ThemedText style={styles.desc} type="small" themeColor="textSecondary">
          Discover hidden gems, local restaurants, and sights based on your current location. Coming soon!
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
