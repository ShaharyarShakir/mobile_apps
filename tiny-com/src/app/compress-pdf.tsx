import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PDF_PRESET_DETAILS,
  PDFPresetKey,
} from "../constants/compression";
import {
  PDFCompressionProgress,
  PDFCompressionResult,
  SelectedFile,
} from "../types/file";
import { fileStore } from "../lib/fileStore";
import { calculateSavings, formatFileSize, getTotalSize } from "../lib/fileUtils";
import { compressPDFsBatch } from "../lib/pdf/compressor";
import { cleanupTempFiles, saveToDevice, shareFile } from "../lib/storageService";
import { monetizationStore } from "../lib/monetizationStore";
import { PDFPresetSelector } from "../components/PDFPresetSelector";
import { ProgressBar } from "../components/ProgressBar";
import { PrimaryButton } from "../components/PrimaryButton";
import { SuccessCheckmark } from "../components/SuccessCheckmark";
import { UpgradeModal } from "../components/UpgradeModal";

type ScreenState = "idle" | "compressing" | "completed";

export default function CompressPdfScreen() {
  const router = useRouter();
  const [files] = useState<SelectedFile[]>(() => fileStore.getPdfFiles());
  const [preset, setPreset] = useState<PDFPresetKey>("balanced");
  const [status, setStatus] = useState<ScreenState>("idle");
  const [progress, setProgress] = useState<PDFCompressionProgress>({
    current: 0,
    total: files.length,
    percentage: 0,
    currentFileName: "",
    stage: "Preparing...",
  });
  const [results, setResults] = useState<PDFCompressionResult[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up temporary cache files
      if (results.length > 0) {
        const uris = results
          .map((r) => r.compressedUri)
          .filter(Boolean) as string[];
        cleanupTempFiles(uris);
      }
    };
  }, [results]);

  const handleStartCompression = async () => {
    if (files.length === 0) return;

    // Check Pro entitlement
    const canCompress = await monetizationStore.canCompress(files.length);
    if (!canCompress) {
      setShowUpgradeModal(true);
      return;
    }

    setStatus("compressing");

    try {
      const batchResults = await compressPDFsBatch(files, preset, (p) => {
        setProgress(p);
      });
      setResults(batchResults);
      fileStore.setPdfResults(batchResults);
      await monetizationStore.recordCompressions(batchResults.length);
      setStatus("completed");
    } catch {
      Alert.alert("Error", "Couldn't compress PDF. Please try again.");
      setStatus("idle");
    }
  };

  const handleSaveAll = async () => {
    const validResults = results.filter((r) => r.compressedUri && !r.error);
    if (validResults.length === 0) return;

    setSaving(true);
    for (const item of validResults) {
      if (item.compressedUri) {
        await saveToDevice(item.compressedUri, item.name, "pdf");
      }
    }
    setSaving(false);
  };

  const handleShareAll = async () => {
    const firstValid = results.find((r) => r.compressedUri && !r.error);
    if (!firstValid || !firstValid.compressedUri) return;
    await shareFile(firstValid.compressedUri, "application/pdf");
  };

  const handleShareItem = async (item: PDFCompressionResult) => {
    if (!item.compressedUri) return;
    await shareFile(item.compressedUri, "application/pdf");
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
  const alreadyOptimizedCount = results.filter(
    (r) => r.isAlreadyOptimized && !r.error
  ).length;

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
              {status === "completed" ? "← Home" : "← PDF Compression"}
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
                    {files.length} {files.length === 1 ? "PDF" : "PDFs"}
                  </Text>
                  <Text className="text-base font-semibold text-neutral-600">
                    {formatFileSize(totalOriginalSize)}
                  </Text>
                </View>
              </View>

              {/* Preset Selector */}
              <PDFPresetSelector
                selectedPreset={preset}
                onSelectPreset={setPreset}
              />
            </View>

            {/* Action Button */}
            <View className="pt-6">
              <PrimaryButton
                title={`Compress (${PDF_PRESET_DETAILS[preset].title})`}
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
              Compressing PDF…
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
              className="mt-4 text-center text-sm font-bold text-black"
            >
              {progress.stage || "Processing document..."}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              className="mt-1 text-center text-xs font-medium text-neutral-400"
            >
              {progress.currentFileName || "Please wait"}
            </Text>

            <Text className="mt-3 text-center text-xs font-semibold text-neutral-400">
              Please wait
            </Text>
          </View>
        )}

        {/* STATE: Completed / Results */}
        {status === "completed" && (
          <View className="flex-1 justify-between">
            <View className="flex-1 px-6 pt-4">
              <View className="flex-row items-center">
                <SuccessCheckmark />
                <Text className="ml-3 text-2xl font-extrabold tracking-tight text-black">
                  Compression complete
                </Text>
              </View>

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
                      {totalSavingsPercentage > 0
                        ? `${totalSavingsPercentage.toFixed(1)}% smaller`
                        : "Already optimized"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Actions (Save / Share) */}
              <View className="mb-4 flex-row gap-3">
                <Pressable
                  onPress={handleSaveAll}
                  disabled={saving || results.length === 0}
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-neutral-200 bg-white py-3 active:bg-neutral-100"
                >
                  <Text className="mr-1.5 text-base">💾</Text>
                  <Text className="text-sm font-bold text-black">Save PDF</Text>
                </Pressable>

                <Pressable
                  onPress={handleShareAll}
                  disabled={results.length === 0}
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-neutral-200 bg-white py-3 active:bg-neutral-100"
                >
                  <Text className="mr-1.5 text-base">📤</Text>
                  <Text className="text-sm font-bold text-black">Share</Text>
                </Pressable>
              </View>

              {alreadyOptimizedCount > 0 && (
                <View className="mb-3 rounded-xl bg-neutral-100 px-4 py-2.5">
                  <Text className="text-xs font-semibold text-neutral-700">
                    ℹ️ Document was already near minimum size. Original quality
                    preserved.
                  </Text>
                </View>
              )}

              {failedCount > 0 && (
                <View className="mb-3 rounded-xl bg-amber-50 px-4 py-2.5">
                  <Text className="text-xs font-semibold text-amber-800">
                    {failedCount} PDF couldn't be compressed.
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
                    <View className="h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                      <Text className="text-2xl">📄</Text>
                    </View>
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
                      ) : item.isAlreadyOptimized ? (
                        <Text className="mt-0.5 text-xs font-medium text-neutral-500">
                          {item.optimizationNote || "Already optimized"} ·{" "}
                          {formatFileSize(item.originalSize)}
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
                    {item.compressedUri && !item.error && (
                      <Pressable
                        onPress={() => handleShareItem(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200"
                      >
                        <Text className="text-xs">📤</Text>
                      </Pressable>
                    )}
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

      {/* Pro Lifetime Upgrade Sheet */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUnlocked={handleStartCompression}
      />
    </SafeAreaView>
  );
}
