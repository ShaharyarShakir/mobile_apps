import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { PrimaryButton } from "./PrimaryButton";

type EmptyStateProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  buttonTitle: string;
  onSelect: () => void;
  loading?: boolean;
};

export function EmptyState({
  iconName,
  title = "No files selected",
  description = "Choose files to compress them.",
  buttonTitle,
  onSelect,
  loading = false,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: isDark
              ? "rgba(244, 63, 94, 0.14)"
              : "rgba(225, 29, 72, 0.08)",
            borderColor: isDark ? "rgba(244, 63, 94, 0.25)" : "transparent",
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        <Ionicons name={iconName} size={42} color={colors.accent} />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title={buttonTitle}
          variant="accent"
          onPress={onSelect}
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonWrapper: {
    marginTop: 28,
    width: "100%",
    maxWidth: 280,
  },
});
