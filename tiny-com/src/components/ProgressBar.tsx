import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type ProgressBarProps = {
  progress: number; // 0 to 100
  style?: object;
};

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.surfaceSubtle },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: colors.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
});
