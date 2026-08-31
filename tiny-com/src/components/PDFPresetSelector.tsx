import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import {
  PDF_PRESET_DETAILS,
  PDFPresetKey,
} from "../constants/compression";

type PDFPresetSelectorProps = {
  selectedPreset: PDFPresetKey;
  onSelectPreset: (preset: PDFPresetKey) => void;
};

const PDF_PRESET_KEYS: PDFPresetKey[] = ["high", "balanced", "maximum"];

export function PDFPresetSelector({
  selectedPreset,
  onSelectPreset,
}: PDFPresetSelectorProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
        PDF Compression Level
      </Text>
      <View style={styles.list}>
        {PDF_PRESET_KEYS.map((key) => {
          const detail = PDF_PRESET_DETAILS[key];
          const isSelected = selectedPreset === key;

          return (
            <Pressable
              key={key}
              onPress={() => onSelectPreset(key)}
              style={({ pressed }) => [
                styles.presetCard,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? "rgba(244, 63, 94, 0.12)"
                      : "rgba(225, 29, 72, 0.06)"
                    : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${detail.title}, ${detail.subtitle}`}
            >
              {/* Radio Indicator */}
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor: isSelected
                      ? colors.accent
                      : colors.borderSubtle,
                    backgroundColor: isSelected
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>

              {/* Preset Info */}
              <View style={styles.presetInfo}>
                <Text
                  style={[
                    styles.presetTitle,
                    {
                      color: isSelected
                        ? colors.accent
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {detail.title}
                </Text>
                <Text
                  style={[
                    styles.presetSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {detail.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  list: {
    gap: 10,
  },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  presetInfo: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  presetSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
});
