import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 40 }: BrandLogoProps) {
  const { colors, isDark } = useTheme();

  const scale = size / 40;
  const containerBg = isDark ? "#18181B" : "#F1F5F9";
  const docBg = isDark ? "#FAFAFA" : "#0F172A";
  const markColor = isDark ? "#18181B" : "#FAFAFA";
  const arrowColor = colors.accent;

  const docWidth = 20 * scale;
  const docHeight = 24 * scale;
  const docRadius = 5 * scale;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: 10 * scale,
          backgroundColor: containerBg,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel="Tiny Compressor logo"
    >
      {/* Document Sheet */}
      <View
        style={{
          width: docWidth,
          height: docHeight,
          borderRadius: docRadius,
          backgroundColor: docBg,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Horizontal fold squeeze mark */}
        <View
          style={{
            width: docWidth * 0.7,
            height: 2.2 * scale,
            borderRadius: 1 * scale,
            backgroundColor: markColor,
            opacity: 0.85,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
