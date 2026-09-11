import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ImageResolutionKey,
  RESOLUTION_PRESETS,
} from "../constants/compression";
import { triggerHaptic } from "../lib/haptics";
import { useTheme } from "../theme/ThemeContext";

type ResolutionSelectorProps = {
  selectedResolution: ImageResolutionKey;
  onSelectResolution: (resolution: ImageResolutionKey) => void;
  title?: string;
};

const RESOLUTION_KEYS: ImageResolutionKey[] = [
  "original",
  "2k",
  "1080p",
  "720p",
];

export function ResolutionSelector({
  selectedResolution,
  onSelectResolution,
  title = "Max resolution",
}: ResolutionSelectorProps) {
  const { colors, isDark } = useTheme();

  const handleSelect = (key: ImageResolutionKey) => {
    if (key !== selectedResolution) {
      triggerHaptic("selection");
      onSelectResolution(key);
    }
  };

  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.headerRow}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
            {title.toUpperCase()}
          </Text>
          <Text style={[styles.activeHint, { color: colors.accent }]}>
            {RESOLUTION_PRESETS[selectedResolution].subtitle}
          </Text>
        </View>
      ) : null}

      <View style={styles.pillsRow}>
        {RESOLUTION_KEYS.map((key) => {
          const detail = RESOLUTION_PRESETS[key];
          const isSelected = selectedResolution === key;

          return (
            <Pressable
              key={key}
              onPress={() => handleSelect(key)}
              style={({ pressed }) => [
                styles.resolutionPill,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? colors.surfaceElevated
                      : colors.surface
                    : colors.surfaceSubtle,
                  borderColor: isSelected ? colors.accent : colors.border,
                  borderWidth: isSelected ? 1.5 : 1,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${detail.label}, ${detail.subtitle}`}
            >
              <Text
                style={[
                  styles.pillLabel,
                  {
                    color: isSelected ? colors.accent : colors.textPrimary,
                    fontWeight: isSelected ? "800" : "600",
                  },
                ]}
              >
                {detail.label}
              </Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  activeHint: {
    fontSize: 11,
    fontWeight: "600",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 6,
  },
  resolutionPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pillLabel: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
