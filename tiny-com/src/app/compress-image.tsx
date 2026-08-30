import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PresetSelector } from "../components/PresetSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import {
    IMAGE_PRESET_DETAILS,
    IMAGE_PRESETS,
    ImagePresetKey,
} from "../constants/compression";
import { fileStore } from "../lib/fileStore";
import { calculateSavings, formatFileSize, getTotalSize } from "../lib/fileUtils";
import { compressImagesBatch } from "../lib/image/compressor";
import {
    CompressionProgress,
    CompressionResult,
    SelectedFile,
} from "../types/file";

type ScreenState = "idle" | "compressing" | "completed";

export default function CompressImageScreen() {
  const router = useRouter();
  const [files] = useState<SelectedFile[]>(() => fileStore.getImageFiles());
  const [preset, setPreset] = useState<ImagePresetKey>("balanced");
  const [status, setStatus] = useState<ScreenState>("idle");
  const [progress, setProgress] = useState<CompressionProgress>({
    current: 0,
    total: files.length,
    percentage: 0,
    currentFileName: "",
  });
  const [results, setResults] = useState<CompressionResult[]>([]);

  const handleStartCompression = async () => {
    if (files.length === 0) return;
    setStatus("compressing");

    try {
      const quality = IMAGE_PRESETS[preset];
      const batchResults = await compressImagesBatch(files, quality, (p) => {
        setProgress(p);
      });
      setResults(batchResults);
      fileStore.setImageResults(batchResults);
      setStatus("completed");
    } catch {
      setStatus("idle");
    }
  };

  const handleDone = () => {
    fileStore.clear();
    router.replace("/");
  };

  const totalOriginalSize =
    status === "completed"
      ? results.reduce((acc, r) => acc + r.originalSize, 0)
      : getTotalSize(files);

  const totalCompressedSize = results.reduce(
    (acc, r) => acc + r.compressedSize,
    0
  );

  const totalSavedBytes = Math.max(
    0,
    totalOriginalSize - totalCompressedSize
  );
  const totalSavingsPercentage = calculateSavings(
    totalOriginalSize,
    totalCompressedSize
  );

  const failedCount = results.filter((r) => r.error).length;
  const successfulCount = results.length - failedCount;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Top Header */}
        <View className="flex-row items-center border-b border-neutral-100 px-6 py-4">
          <Pressable
            onPress={() => {
              if (status === "completed") {
                router.replace("/");
              } else {
                router.back();
              }
            }}
            disabled={status === "compressing"}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className={`flex-row items-center ${
              status === "compressing" ? "opacity-30" : "active:opacity-70"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text className="text-lg font-semibold text-black">
              {status === "completed" ? "← Home" : "← Compress"}
            </Text>
          </Pressable>
        </View>

        {/* STATE: Idle / Configuration */}
        {status === "idle" && (
          <View className="flex-1 justify-between p-6">
            <View>
              {/* Selected Files Summary */}
              <View className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <Text className="text-sm font-semibold text-neutral-500">
                  READY TO COMPRESS
                </Text>
                <View className="mt-1 flex-row items-baseline justify-between">
                  <Text className="text-xl font-bold text-black">
                    {files.length} {files.length === 1 ? "image" : "images"}
                  </Text>
                  <Text className="text-base font-semibold text-neutral-600">
                    {formatFileSize(totalOriginalSize)}
                  </Text>
                </View>
              </View>

              {/* Preset Selector */}
              <PresetSelector
                selectedPreset={preset}
                onSelectPreset={setPreset}
              />
            </View>

            {/* Action Button */}
            <View className="pt-6">
              <PrimaryButton
                title={`Compress (${IMAGE_PRESET_DETAILS[preset].title})`}
                onPress={handleStartCompression}
                disabled={files.length === 0}
              />
            </View>
          </View>
        )}

        {/* STATE: Compressing / In-Progress */}
        {status === "compressing" && (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-2xl font-extrabold tracking-tight text-black">
              Compressing...
            </Text>

            <Text className="mt-4 text-3xl font-black text-black">
              {progress.current} / {progress.total}
            </Text>

            <View className="mt-6 w-full">
              <ProgressBar progress={progress.percentage} />
            </View>

            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              className="mt-4 text-center text-sm font-medium text-neutral-400"
            >
              {progress.currentFileName || "Please wait"}
            </Text>

            <Text className="mt-2 text-center text-xs font-semibold text-neutral-400">
              Please wait
            </Text>
          </View>
        )}

        {/* STATE: Completed / Results */}
        {status === "completed" && (
          <View className="flex-1 justify-between">
            <View className="flex-1 px-6 pt-4">
              <Text className="text-2xl font-extrabold tracking-tight text-black">
                Compression complete
              </Text>

              {/* Summary Metric Card */}
              <View className="my-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <View className="flex-row justify-between border-b border-neutral-200 pb-3">
                  <View>
                    <Text className="text-xs font-semibold text-neutral-500 uppercase">
                      Original
                    </Text>
                    <Text className="mt-1 text-base font-bold text-neutral-800">
                      {formatFileSize(totalOriginalSize)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-semibold text-neutral-500 uppercase">
                      Compressed
                    </Text>
                    <Text className="mt-1 text-base font-bold text-black">
                      {formatFileSize(totalCompressedSize)}
                    </Text>
                  </View>
                </View>

                <View className="pt-3">
                  <Text className="text-xs font-semibold text-neutral-500 uppercase">
                    Saved
                  </Text>
                  <View className="mt-1 flex-row items-baseline justify-between">
                    <Text className="text-xl font-extrabold text-black">
                      {formatFileSize(totalSavedBytes)}
                    </Text>
                    <Text className="text-lg font-bold text-black">
                      {totalSavingsPercentage.toFixed(1)}% smaller
                    </Text>
                  </View>
                </View>
              </View>

              {failedCount > 0 && (
                <View className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5">
                  <Text className="text-xs font-semibold text-amber-800">
                    {successfulCount} compressed, {failedCount} couldn't be
                    compressed.
                  </Text>
                </View>
              )}

              {/* Result Files List */}
              <Text className="mb-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Files ({results.length})
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="mb-2 flex-row items-center rounded-xl border border-neutral-200 bg-white p-3">
                    <Image
                      source={{ uri: item.compressedUri || item.originalUri }}
                      className="h-12 w-12 rounded-lg bg-neutral-100"
                      resizeMode="cover"
                    />
                    <View className="ml-3 flex-1">
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        className="text-sm font-bold text-black"
                      >
                        {item.name}
                      </Text>
                      {item.error ? (
                        <Text className="mt-0.5 text-xs font-medium text-red-500">
                          {item.error}
                        </Text>
                      ) : (
                        <View className="mt-0.5 flex-row items-center">
                          <Text className="text-xs text-neutral-400 line-through">
                            {formatFileSize(item.originalSize)}
                          </Text>
                          <Text className="mx-1 text-xs text-neutral-400">→</Text>
                          <Text className="text-xs font-semibold text-black">
                            {formatFileSize(item.compressedSize)}
                          </Text>
                          <Text className="ml-2 text-xs font-bold text-neutral-700">
                            (-{item.savingsPercentage.toFixed(0)}%)
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>

            {/* Bottom Action */}
            <View className="border-t border-neutral-100 bg-white p-6">
              <PrimaryButton title="Done" onPress={handleDone} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

