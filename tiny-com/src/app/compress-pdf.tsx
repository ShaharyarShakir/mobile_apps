import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PDFPresetSelector } from "../components/PDFPresetSelector";
import { PrimaryButton } from "../components/PrimaryButton";
import { ProgressBar } from "../components/ProgressBar";
import { SuccessCheckmark } from "../components/SuccessCheckmark";
import {
    PDF_PRESET_DETAILS,
    PDFPresetKey,
} from "../constants/compression";
import { fileStore } from "../lib/fileStore";
import { calculateSavings, formatFileSize, getTotalSize } from "../lib/fileUtils";
import { compressPDFsBatch } from "../lib/pdf/compressor";
import { settingsStore } from "../lib/settingsStore";
import { cleanupTempFiles, saveToDevice, shareFile } from "../lib/storageService";
import { useTheme } from "../theme/ThemeContext";
import {
    PDFCompressionProgress,
    PDFCompressionResult,
    SelectedFile,
} from "../types/file";

import { triggerHaptic } from "../lib/haptics";
import { recentStore } from "../lib/recentStore";

type ScreenState = "idle" | "compressing" | "completed";

export default function CompressPdfScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
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

    setStatus("compressing");

    try {
      const batchResults = await compressPDFsBatch(files, preset, (p) => {
        setProgress(p);
      });
      setResults(batchResults);
      fileStore.setPdfResults(batchResults);

      const valid = batchResults.filter((r) => !r.error && !r.isAlreadyOptimized && r.savingsPercentage >= 3);
      const origTotal = batchResults.reduce((acc, r) => acc + r.originalSize, 0);
      const compTotal = batchResults.reduce((acc, r) => acc + r.compressedSize, 0);
      const savedBytes = Math.max(0, origTotal - compTotal);
      if (savedBytes > 0 && valid.length > 0) {
        await settingsStore.addBytesSaved(savedBytes);
      }

      if (batchResults.length === 1 && !batchResults[0].error && !batchResults[0].isAlreadyOptimized && batchResults[0].savingsPercentage >= 3) {
        const item = batchResults[0];
        await recentStore.addRecentItem({
          name: item.name,
          type: "pdf",
          originalSize: item.originalSize,
          compressedSize: item.compressedSize,
          savingsPercentage: item.savingsPercentage,
          uri: item.compressedUri,
        });
      } else if (valid.length > 0) {
        const vOrig = valid.reduce((acc, r) => acc + r.originalSize, 0);
        const vComp = valid.reduce((acc, r) => acc + r.compressedSize, 0);
        await recentStore.addRecentItem({
          name: `${valid.length} Compressed PDFs`,
          type: "pdf",
          originalSize: vOrig,
          compressedSize: vComp,
          savingsPercentage: calculateSavings(vOrig, vComp),
          uri: valid[0].compressedUri,
          itemCount: valid.length,
        });
      }

      triggerHaptic("success");
      setStatus("completed");
    } catch {
      triggerHaptic("warning");
      Alert.alert("Error", "Couldn't compress PDF. Please try again.");
      setStatus("idle");
    }
  };

  const handleSaveAll = async () => {
    const validResults = results.filter((r) => r.compressedUri && !r.error);
    if (validResults.length === 0) return;

    setSaving(true);
    let successCount = 0;
    for (const item of validResults) {
      if (item.compressedUri) {
        const res = await saveToDevice(item.compressedUri, item.name, "pdf");
        if (res.success) successCount++;
      }
    }
    setSaving(false);

    if (successCount === validResults.length) {
      Alert.alert("Saved", "All compressed PDFs saved to your device.");
    } else {
      Alert.alert(
        "Partial Save",
        `Saved ${successCount} of ${validResults.length} PDFs.`
      );
    }
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
  const successfulCount = results.length - failedCount;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.container}>
        {/* Navigation Header */}
        <View
          style={[
            styles.navHeader,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
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
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.textPrimary}
            />
            <Text style={[styles.navTitle, { color: colors.textPrimary }]}>
              {status === "completed" ? "Completed" : "PDF Compression"}
            </Text>
          </Pressable>
        </View>

        {/* STATE: Idle / Configuration */}
        {status === "idle" && (
          <View style={styles.idleContainer}>
            <View>
              {/* Ready Summary Card */}
              <View
                style={[
                  styles.readyCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.readyTag, { color: colors.textMuted }]}>
                  READY TO COMPRESS
                </Text>
                <View style={styles.readyRow}>
                  <Text
                    style={[styles.readyCount, { color: colors.textPrimary }]}
                  >
                    {files.length} {files.length === 1 ? "PDF" : "PDFs"}
                  </Text>
                  <Text
                    style={[styles.readySize, { color: colors.accent }]}
                  >
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

            <View style={styles.actionBottom}>
              <PrimaryButton
                title={`Compress Now (${PDF_PRESET_DETAILS[preset].title})`}
                variant="accent"
                onPress={handleStartCompression}
                disabled={files.length === 0}
              />
            </View>
          </View>
        )}

        {/* STATE: Compressing / In Progress */}
        {status === "compressing" && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressIconBox,
                { backgroundColor: colors.accentSubtle },
              ]}
            >
              <Ionicons name="document-text" size={28} color={colors.accent} />
            </View>

            <Text style={[styles.progressTitle, { color: colors.textPrimary }]}>
              Compressing PDF…
            </Text>

            <Text style={[styles.progressCount, { color: colors.accent }]}>
              {progress.current} / {progress.total}
            </Text>

            <View style={styles.progressBarWrapper}>
              <ProgressBar progress={progress.percentage} />
            </View>

            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[styles.progressStage, { color: colors.textPrimary }]}
            >
              {progress.stage || "Processing document..."}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[styles.progressFileName, { color: colors.textSecondary }]}
            >
              {progress.currentFileName || "Please wait"}
            </Text>
          </View>
        )}

        {/* STATE: Completed / Results */}
        {status === "completed" && (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsScroll}>
              <View style={styles.successHeader}>
                <SuccessCheckmark />
                <View style={styles.successHeaderText}>
                  <Text
                    style={[
                      styles.completedTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Compression Complete!
                  </Text>
                  <Text
                    style={[
                      styles.completedSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {successfulCount} of {results.length} documents processed
                  </Text>
                </View>
              </View>

              {/* Metric Card */}
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricTopRow,
                    { borderBottomColor: colors.borderSubtle },
                  ]}
                >
                  <View>
                    <Text
                      style={[styles.metricLabel, { color: colors.textMuted }]}
                    >
                      ORIGINAL
                    </Text>
                    <Text
                      style={[
                        styles.metricValueMuted,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {formatFileSize(totalOriginalSize)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={[styles.metricLabel, { color: colors.textMuted }]}
                    >
                      COMPRESSED
                    </Text>
                    <Text
                      style={[
                        styles.metricValuePrimary,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {formatFileSize(totalCompressedSize)}
                    </Text>
                  </View>
                </View>

                <View style={styles.metricBottomRow}>
                  <Text
                    style={[styles.metricLabel, { color: colors.textMuted }]}
                  >
                    TOTAL SPACE SAVED
                  </Text>
                  <View style={styles.savedRow}>
                    <Text
                      style={[styles.savedValue, { color: colors.accent }]}
                    >
                      {formatFileSize(totalSavedBytes)}
                    </Text>
                    <View
                      style={[
                        styles.savedBadge,
                        { backgroundColor: colors.accentSubtle },
                      ]}
                    >
                      <Text
                        style={[styles.savedBadgeText, { color: colors.accent }]}
                      >
                        {totalSavingsPercentage > 0
                          ? `${totalSavingsPercentage.toFixed(0)}% smaller`
                          : "Optimized"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick Save & Share Buttons */}
              <View style={styles.quickActionsRow}>
                <Pressable
                  onPress={handleSaveAll}
                  disabled={saving || successfulCount === 0}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    {
                      backgroundColor: colors.accentSubtle,
                      borderColor: colors.accent,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Ionicons name="download-outline" size={18} color={colors.accent} />
                  <Text
                    style={[
                      styles.quickActionText,
                      { color: colors.accent },
                    ]}
                  >
                    Save All PDFs
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleShareAll}
                  disabled={successfulCount === 0}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="share-outline"
                    size={18}
                    color={colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.quickActionText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Share
                  </Text>
                </Pressable>
              </View>

              {alreadyOptimizedCount > 0 && (
                <View
                  style={[
                    styles.noteBox,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.noteText, { color: colors.textSecondary }]}
                  >
                    ℹ️ PDF was already compact. Original structure preserved.
                  </Text>
                </View>
              )}

              {/* Result Files List */}
              <Text
                style={[
                  styles.filesSectionHeader,
                  { color: colors.textMuted },
                ]}
              >
                PROCESSED DOCUMENTS ({results.length})
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.resultCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.resultDocBox,
                        {
                          backgroundColor: isDark
                            ? "rgba(225, 29, 72, 0.14)"
                            : "rgba(225, 29, 72, 0.08)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="document-text"
                        size={22}
                        color={colors.accent}
                      />
                    </View>
                    <View style={styles.resultDetails}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={[
                          styles.resultName,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.error ? (
                        <Text
                          style={[
                            styles.resultError,
                            { color: colors.danger },
                          ]}
                        >
                          {item.error}
                        </Text>
                      ) : item.isAlreadyOptimized ? (
                        <Text
                          style={[
                            styles.resultNote,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.optimizationNote || "Already optimized"} ·{" "}
                          {formatFileSize(item.originalSize)}
                        </Text>
                      ) : (
                        <View style={styles.resultSizesRow}>
                          <Text
                            style={[
                              styles.resultOldSize,
                              { color: colors.textMuted },
                            ]}
                          >
                            {formatFileSize(item.originalSize)}
                          </Text>
                          <Text
                            style={[
                              styles.resultArrow,
                              { color: colors.textMuted },
                            ]}
                          >
                            →
                          </Text>
                          <Text
                            style={[
                              styles.resultNewSize,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {formatFileSize(item.compressedSize)}
                          </Text>
                          <Text
                            style={[
                              styles.resultPercent,
                              { color: colors.accent },
                            ]}
                          >
                            (-{item.savingsPercentage.toFixed(0)}%)
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.compressedUri && !item.error && (
                      <Pressable
                        onPress={() => handleShareItem(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={({ pressed }) => [
                          styles.shareIconBtn,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name="share-outline"
                          size={15}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    )}
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>

            {/* Bottom Done Action */}
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <PrimaryButton title="Done" onPress={handleDone} />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  idleContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  readyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  readyTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  readyRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  readyCount: {
    fontSize: 22,
    fontWeight: "800",
  },
  readySize: {
    fontSize: 17,
    fontWeight: "700",
  },
  actionBottom: {
    paddingTop: 16,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  progressIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  progressCount: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: 10,
  },
  progressBarWrapper: {
    width: "100%",
    marginTop: 24,
    marginBottom: 16,
  },
  progressStage: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  progressFileName: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 3,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  successHeaderText: {
    marginLeft: 12,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  completedSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  metricCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  metricTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  metricValueMuted: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  metricValuePrimary: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  metricBottomRow: {
    paddingTop: 12,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  savedValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  savedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  noteBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  filesSectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
  },
  resultDocBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resultDetails: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 6,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
  },
  resultError: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  resultNote: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  resultSizesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  resultOldSize: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  resultArrow: {
    fontSize: 12,
  },
  resultNewSize: {
    fontSize: 12,
    fontWeight: "700",
  },
  resultPercent: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 2,
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
