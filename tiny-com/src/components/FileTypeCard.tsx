import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

interface FileTypeCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  description: string;
  accentColor?: string;
  onPress: () => void;
}

export function FileTypeCard({
  iconName,
  title,
  subtitle,
  description,
  accentColor = "#F43F5E",
  onPress,
}: FileTypeCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${description}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderColor: pressed ? accentColor : colors.border,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          shadowColor: isDark ? "#000000" : "#0F172A",
          shadowOpacity: isDark ? 0.35 : 0.06,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Vector Icon Container with soft ambient glow */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? "rgba(244, 63, 94, 0.14)"
                : "rgba(225, 29, 72, 0.08)",
              borderColor: isDark ? "rgba(244, 63, 94, 0.25)" : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <Ionicons name={iconName} size={26} color={accentColor} />
        </View>

        {/* Text Details */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title}
            </Text>
            {subtitle && (
              <View
                style={[
                  styles.subtitleBadge,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text
                  style={[
                    styles.subtitleText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {description}
          </Text>
        </View>

        {/* Chevron Indicator */}
        <View
          style={[
            styles.arrowCircle,
            { backgroundColor: colors.surfaceSubtle },
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textSecondary}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
