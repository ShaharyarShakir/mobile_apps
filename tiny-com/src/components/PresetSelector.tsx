import { Pressable, StyleSheet, Text, View } from "react-native";
import {
    CompressionPresetKey,
    PRESET_OPTIONS,
} from "../constants/compression";
import { triggerHaptic } from "../lib/haptics";
import { useTheme } from "../theme/ThemeContext";

type PresetSelectorProps = {
  selectedPreset: CompressionPresetKey;
  onSelectPreset: (preset: CompressionPresetKey) => void;
  title?: string;
};

const PRESET_KEYS: CompressionPresetKey[] = ["high", "balanced", "maximum"];

export function PresetSelector({
  selectedPreset,
  onSelectPreset,
  title = "Compression preset",
}: PresetSelectorProps) {
  const { colors, isDark } = useTheme();

  const handleSelect = (key: CompressionPresetKey) => {
    if (key !== selectedPreset) {
      triggerHaptic("selection");
      onSelectPreset(key);
    }
  };

  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
          {title.toUpperCase()}
        </Text>
      ) : null}

      <View style={styles.grid}>
        {PRESET_KEYS.map((key) => {
          const detail = PRESET_OPTIONS[key];
          const isSelected = selectedPreset === key;
          const isBalanced = key === "balanced";

          return (
            <Pressable
              key={key}
              onPress={() => handleSelect(key)}
              style={({ pressed }) => [
                styles.presetCard,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? colors.surfaceElevated
                      : colors.surface
                    : colors.surfaceSubtle,
                  borderColor: isSelected
                    ? colors.accent
                    : colors.border,
                  borderWidth: isSelected ? 1.5 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: isDark ? "#000000" : colors.accent,
                  shadowOpacity: isSelected ? (isDark ? 0.3 : 0.1) : 0,
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${detail.title}, ${detail.subtitle}`}
            >
              {isBalanced && (
                <View
                  style={[
                    styles.recBadge,
                    {
                      backgroundColor: isSelected
                        ? colors.accentSubtle
                        : colors.surface,
                      borderColor: isSelected
                        ? colors.accent
                        : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.recBadgeText,
                      { color: isSelected ? colors.accent : colors.textMuted },
                    ]}
                  >
                    REC
                  </Text>
                </View>
              )}

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
                numberOfLines={2}
                style={[
                  styles.presetSubtitle,
                  {
                    color: isSelected
                      ? colors.textSecondary
                      : colors.textMuted,
                  },
                ]}
              >
                {detail.subtitle}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Export as alias for backwards compatibility
export const PDFPresetSelector = PresetSelector;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
  },
  presetCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 82,
    position: "relative",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  recBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  presetTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  presetSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 14,
  },
});
