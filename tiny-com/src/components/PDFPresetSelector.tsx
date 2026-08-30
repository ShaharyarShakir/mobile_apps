import { Pressable, Text, View } from "react-native";
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
  return (
    <View className="w-full">
      <Text className="mb-3 text-base font-bold text-black">
        PDF Compression
      </Text>
      <View className="gap-3">
        {PDF_PRESET_KEYS.map((key) => {
          const detail = PDF_PRESET_DETAILS[key];
          const isSelected = selectedPreset === key;

          return (
            <Pressable
              key={key}
              onPress={() => onSelectPreset(key)}
              className={`flex-row items-center rounded-2xl border p-4 active:bg-neutral-50 ${
                isSelected
                  ? "border-black bg-neutral-50"
                  : "border-neutral-200 bg-white"
              }`}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${detail.title}, ${detail.subtitle}`}
            >
              {/* Radio Indicator */}
              <View
                className={`mr-3.5 h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-black bg-black"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {isSelected && (
                  <View className="h-2 w-2 rounded-full bg-white" />
                )}
              </View>

              {/* Preset Text */}
              <View className="flex-1">
                <Text className="text-base font-bold text-black">
                  {detail.title}
                </Text>
                <Text className="mt-0.5 text-sm font-medium text-neutral-500">
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

