import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import {
  CompressionFileType,
  CompressionProgress,
  CompressionResult,
  PDFCompressionProgress,
  PDFCompressionResult,
  SelectedFile,
} from "../../types/file";
import {
  CompressionPresetKey,
  IMAGE_PRESETS,
} from "../../constants/compression";
import { formatFileSize, getTotalSize, calculateSavings } from "../../lib/fileUtils";
import { MAX_IMAGE_COUNT, pickImages } from "../../lib/pickers/imagePicker";
import { MAX_PDF_COUNT, pickPDFs } from "../../lib/pickers/pdfPicker";
import { compressImagesBatch } from "../../lib/image/compressor";
import { compressPDFsBatch } from "../../lib/pdf/compressor";
import { saveToDevice, shareFile, cleanupTempFiles } from "../../lib/storageService";
import { settingsStore } from "../../lib/settingsStore";
import { recentStore } from "../../lib/recentStore";
import { triggerHaptic } from "../../lib/haptics";
import { SelectedFileCard } from "../../components/SelectedFileCard";
import { PresetSelector } from "../../components/PresetSelector";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ProgressBar } from "../../components/ProgressBar";
import { SuccessCheckmark } from "../../components/SuccessCheckmark";
import {
  logCompressionStarted,
  logCompressionCompleted,
  logCompressionFailed,
  logFileSaved,
  logFileShared,
} from "../../lib/observeService";

type ScreenFlowState = "idle" | "selected" | "compressing" | "completed";

export default function CompressScreen() {
  const { colors, isDark } = useTheme();

  // Selected Files & State
  const [flowState, setFlowState] = useState<ScreenFlowState>("idle");
  const [selectedType, setSelectedType] = useState<CompressionFileType>("image");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [preset, setPreset] = useState<CompressionPresetKey>("balanced");
  const [isPicking, setIsPicking] = useState(false);

  // Progress
  const [imgProgress, setImgProgress] = useState<CompressionProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    currentFileName: "",
  });
  const [pdfProgress, setPdfProgress] = useState<PDFCompressionProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    currentFileName: "",
    stage: "Please wait...",
  });

  // Results
  const [imageResults, setImageResults] = useState<CompressionResult[]>([]);
  const [pdfResults, setPdfResults] = useState<PDFCompressionResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Clean up cache when leaving/resetting results
  const cleanupResults = useCallback(() => {
    const uris = [
      ...imageResults.map((r) => r.compressedUri),
      ...pdfResults.map((r) => r.compressedUri),
    ].filter(Boolean) as string[];
    if (uris.length > 0) {
      cleanupTempFiles(uris);
    }
  }, [imageResults, pdfResults]);

  useEffect(() => {
    return () => {
      cleanupResults();
    };
  }, [cleanupResults]);

  // Handlers for picking files
  const handleChooseImages = async () => {
    try {
      setIsPicking(true);
      const picked = await pickImages(0);
      if (picked.length > 0) {
        triggerHaptic("light");
        setSelectedType("image");
        setFiles(picked);
        setFlowState("selected");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "MEDIA_PERMISSION_DENIED") {
        Alert.alert(
          "Permission Required",
          "Photo library permission is needed to select images."
        );
      } else {
        Alert.alert("Error", "Could not load images. Please try again.");
      }
    } finally {
      setIsPicking(false);
    }
  };

  const handleChoosePDF = async () => {
    try {
      setIsPicking(true);
      const picked = await pickPDFs(0);
      if (picked.length > 0) {
        triggerHaptic("light");
        setSelectedType("pdf");
        setFiles(picked);
        setFlowState("selected");
      }
    } catch {
      Alert.alert("Error", "Could not load PDF. Please try again.");
    } finally {
      setIsPicking(false);
    }
  };

  const handleAddMore = async () => {
    if (selectedType === "image") {
      if (files.length >= MAX_IMAGE_COUNT) {
        Alert.alert("Limit Reached", `You can select up to ${MAX_IMAGE_COUNT} images.`);
        return;
      }
      try {
        setIsPicking(true);
        const more = await pickImages(files.length);
        if (more.length > 0) {
          triggerHaptic("light");
          setFiles((prev) => [...prev, ...more].slice(0, MAX_IMAGE_COUNT));
        }
      } catch {
        // ignore
      } finally {
        setIsPicking(false);
      }
    } else {
      if (files.length >= MAX_PDF_COUNT) {
        Alert.alert("Limit Reached", `You can select up to ${MAX_PDF_COUNT} PDFs.`);
        return;
      }
      try {
        setIsPicking(true);
        const more = await pickPDFs(files.length);
        if (more.length > 0) {
          triggerHaptic("light");
          setFiles((prev) => [...prev, ...more].slice(0, MAX_PDF_COUNT));
        }
      } catch {
        // ignore
      } finally {
        setIsPicking(false);
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    if (updated.length === 0) {
      handleReset();
    } else {
      setFiles(updated);
    }
  };

  const handleReset = () => {
    triggerHaptic("light");
    setFlowState("idle");
    setFiles([]);
    setImageResults([]);
    setPdfResults([]);
    setSavedSuccess(false);
    setImgProgress({ current: 0, total: 0, percentage: 0, currentFileName: "" });
    setPdfProgress({ current: 0, total: 0, percentage: 0, currentFileName: "", stage: "Please wait..." });
  };

  // Compression Execution
  const handleStartCompression = async () => {
    if (files.length === 0) return;
    setFlowState("compressing");
    setSavedSuccess(false);

    const startTime = Date.now();
    logCompressionStarted(selectedType, preset, files.length, totalOriginalSize);

    try {
      if (selectedType === "image") {
        const quality = IMAGE_PRESETS[preset];
        const results = await compressImagesBatch(files, quality, (p) => {
          setImgProgress(p);
        });

        setImageResults(results);

        const valid = results.filter((r) => !r.error && !r.isAlreadyOptimized && r.savingsPercentage >= 3);
        const origTotal = results.reduce((acc, r) => acc + r.originalSize, 0);
        const compTotal = results.reduce((acc, r) => acc + r.compressedSize, 0);
        const saved = Math.max(0, origTotal - compTotal);

        if (saved > 0 && valid.length > 0) {
          await settingsStore.addBytesSaved(saved);
        }

        // Add to recent store only if genuinely reduced
        if (results.length === 1 && !results[0].error && !results[0].isAlreadyOptimized && results[0].savingsPercentage >= 3) {
          const item = results[0];
          await recentStore.addRecentItem({
            name: item.name,
            type: "image",
            originalSize: item.originalSize,
            compressedSize: item.compressedSize,
            savingsPercentage: item.savingsPercentage,
            uri: item.compressedUri,
          });
        } else if (valid.length > 0) {
          const vOrig = valid.reduce((acc, r) => acc + r.originalSize, 0);
          const vComp = valid.reduce((acc, r) => acc + r.compressedSize, 0);
          await recentStore.addRecentItem({
            name: `${valid.length} Compressed Images`,
            type: "image",
            originalSize: vOrig,
            compressedSize: vComp,
            savingsPercentage: calculateSavings(vOrig, vComp),
            uri: valid[0].compressedUri,
            itemCount: valid.length,
          });
        }

        const durationMs = Date.now() - startTime;
        logCompressionCompleted(selectedType, preset, results.length, origTotal, compTotal, durationMs);
        triggerHaptic("success");
        setFlowState("completed");
      } else {
        const results = await compressPDFsBatch(files, preset, (p) => {
          setPdfProgress(p);
        });

        setPdfResults(results);

        const valid = results.filter((r) => !r.error && !r.isAlreadyOptimized && r.savingsPercentage >= 3);
        const origTotal = results.reduce((acc, r) => acc + r.originalSize, 0);
        const compTotal = results.reduce((acc, r) => acc + r.compressedSize, 0);
        const saved = Math.max(0, origTotal - compTotal);

        if (saved > 0 && valid.length > 0) {
          await settingsStore.addBytesSaved(saved);
        }

        if (results.length === 1 && !results[0].error && !results[0].isAlreadyOptimized && results[0].savingsPercentage >= 3) {
          const item = results[0];
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

        const durationMs = Date.now() - startTime;
        logCompressionCompleted(selectedType, preset, results.length, origTotal, compTotal, durationMs);
        triggerHaptic("success");
        setFlowState("completed");
      }
    } catch {
      logCompressionFailed(selectedType, preset, files.length);
      triggerHaptic("warning");
      Alert.alert("Error", "Couldn't compress this file. Please try again.");
      setFlowState("selected");
    }
  };

  // Actions: Save & Share
  const handleSave = async () => {
    setIsSaving(true);
    triggerHaptic("light");

    if (selectedType === "image") {
      const valid = imageResults.filter((r) => r.compressedUri && !r.error && !r.isAlreadyOptimized);
      let successCount = 0;
      for (const item of valid) {
        if (item.compressedUri) {
          const res = await saveToDevice(item.compressedUri, item.name, "image");
          if (res.success) successCount++;
        }
      }
      setIsSaving(false);
      if (successCount > 0) {
        logFileSaved("image", successCount);
        setSavedSuccess(true);
        triggerHaptic("success");
        Alert.alert("Saved", valid.length === 1 ? "Image saved to Photos." : `Saved ${successCount} of ${valid.length} images to Photos.`);
      }
    } else {
      const valid = pdfResults.filter((r) => r.compressedUri && !r.error && !r.isAlreadyOptimized);
      if (valid.length > 0 && valid[0].compressedUri) {
        const res = await saveToDevice(valid[0].compressedUri, valid[0].name, "pdf");
        setIsSaving(false);
        if (res.success) {
          logFileSaved("pdf", 1);
          setSavedSuccess(true);
          triggerHaptic("success");
        }
      } else {
        setIsSaving(false);
      }
    }
  };

  const handleShare = async () => {
    triggerHaptic("light");
    logFileShared(selectedType);
    if (selectedType === "image") {
      const firstValid = imageResults.find((r) => r.compressedUri && !r.error);
      const uriToShare = firstValid?.compressedUri || files[0]?.uri;
      if (uriToShare) {
        await shareFile(uriToShare, "image/jpeg");
      }
    } else {
      const firstValid = pdfResults.find((r) => r.compressedUri && !r.error);
      const uriToShare = firstValid?.compressedUri || files[0]?.uri;
      if (uriToShare) {
        await shareFile(uriToShare, "application/pdf");
      }
    }
  };

  const handleShareSingle = async (uri?: string, mime?: string) => {
    if (!uri) return;
    triggerHaptic("light");
    logFileShared(selectedType);
    await shareFile(uri, mime);
  };

  // Derived metrics
  const totalOriginalSize = getTotalSize(files);
  const isImage = selectedType === "image";
  const results = isImage ? imageResults : pdfResults;
  const totalResultsOrig = results.reduce((acc, r) => acc + r.originalSize, 0);
  const totalResultsComp = results.reduce((acc, r) => acc + r.compressedSize, 0);
  const overallSavingsPercent = calculateSavings(totalResultsOrig, totalResultsComp);
  const allAlreadyOptimized = results.length > 0 && results.every((r) => (r as PDFCompressionResult).isAlreadyOptimized || r.savingsPercentage < 3 || r.compressedSize >= r.originalSize);
  const allFailed = results.length > 0 && results.every((r) => r.error);
  const hasMultiple = files.length > 1;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* ========================================================================= */}
        {/* 1. IDLE / EMPTY STATE */}
        {/* ========================================================================= */}
        {flowState === "idle" && (
          <ScrollView
            contentContainerStyle={styles.idleScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Brand */}
            <View style={styles.idleHeader}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                Tiny Compressor
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                Make your files smaller.{"\n"}Everything stays on your device.
              </Text>
            </View>

            {/* Action Cards */}
            <View style={styles.choiceCards}>
              {/* IMAGES CARD */}
              <Pressable
                onPress={handleChooseImages}
                disabled={isPicking}
                style={({ pressed }) => [
                  styles.choiceCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: pressed ? colors.accent : colors.border,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Choose Images"
              >
                <View
                  style={[
                    styles.choiceIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(244, 63, 94, 0.14)"
                        : "rgba(225, 29, 72, 0.08)",
                    },
                  ]}
                >
                  <Ionicons name="images" size={26} color={colors.accent} />
                </View>

                <View style={styles.choiceTextCol}>
                  <Text style={[styles.choiceTitle, { color: colors.textPrimary }]}>
                    Images
                  </Text>
                  <Text style={[styles.choiceFormat, { color: colors.accent }]}>
                    JPG • PNG • WebP
                  </Text>
                  <Text style={[styles.choiceDesc, { color: colors.textSecondary }]}>
                    Compress single or batch photos
                  </Text>
                </View>

                <View
                  style={[
                    styles.choosePill,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.choosePillText, { color: colors.textPrimary }]}>
                    Choose Images
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textSecondary} />
                </View>
              </Pressable>

              {/* PDF CARD */}
              <Pressable
                onPress={handleChoosePDF}
                disabled={isPicking}
                style={({ pressed }) => [
                  styles.choiceCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: pressed ? colors.accent : colors.border,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Choose PDF"
              >
                <View
                  style={[
                    styles.choiceIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(244, 63, 94, 0.14)"
                        : "rgba(225, 29, 72, 0.08)",
                    },
                  ]}
                >
                  <Ionicons name="document-text" size={26} color={colors.accent} />
                </View>

                <View style={styles.choiceTextCol}>
                  <Text style={[styles.choiceTitle, { color: colors.textPrimary }]}>
                    PDF
                  </Text>
                  <Text style={[styles.choiceFormat, { color: colors.accent }]}>
                    PDF documents
                  </Text>
                  <Text style={[styles.choiceDesc, { color: colors.textSecondary }]}>
                    Shrink heavy files while keeping text sharp
                  </Text>
                </View>

                <View
                  style={[
                    styles.choosePill,
                    {
                      backgroundColor: colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.choosePillText, { color: colors.textPrimary }]}>
                    Choose PDF
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textSecondary} />
                </View>
              </Pressable>
            </View>

            {/* Privacy Badge */}
            <View style={styles.privacyRow}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={[styles.privacyLabel, { color: colors.textSecondary }]}>
                100% on-device • No uploads
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 2. SELECTED FILES STATE */}
        {/* ========================================================================= */}
        {flowState === "selected" && (
          <View style={styles.selectedContainer}>
            {/* Top Navigation */}
            <View style={styles.navBar}>
              <Pressable
                onPress={handleReset}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.navAction}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                <Text style={[styles.navActionText, { color: colors.textPrimary }]}>
                  Back
                </Text>
              </Pressable>

              <Text style={[styles.navCenterTitle, { color: colors.textPrimary }]}>
                {isImage ? "Images" : "PDF"} ({files.length})
              </Text>

              <Pressable
                onPress={handleAddMore}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={({ pressed }) => [
                  styles.addMoreBtn,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons name="add" size={14} color={colors.textPrimary} />
                <Text style={[styles.addMoreText, { color: colors.textPrimary }]}>
                  Add
                </Text>
              </Pressable>
            </View>

            {/* Selected File Card List */}
            <View style={styles.filesListWrapper}>
              <FlatList
                data={files}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.filesListContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.fileCardSpacing}>
                    <SelectedFileCard file={item} onRemove={handleRemoveFile} />
                  </View>
                )}
              />
            </View>

            {/* Total Size Summary */}
            <View style={[styles.sizeSummaryRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Original total size
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                {formatFileSize(totalOriginalSize)}
              </Text>
            </View>

            {/* Preset Selector */}
            <View style={styles.presetWrapper}>
              <PresetSelector
                selectedPreset={preset}
                onSelectPreset={setPreset}
              />
            </View>

            {/* Bottom Compress Button */}
            <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
              <PrimaryButton
                title={
                  isImage
                    ? files.length === 1
                      ? "Compress Image"
                      : `Compress ${files.length} Images`
                    : files.length === 1
                    ? "Compress PDF"
                    : `Compress ${files.length} PDFs`
                }
                variant="accent"
                onPress={handleStartCompression}
              />
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 3. COMPRESSING STATE */}
        {/* ========================================================================= */}
        {flowState === "compressing" && (
          <View style={styles.compressingContainer}>
            <View
              style={[
                styles.processingIconBox,
                { backgroundColor: colors.accentSubtle },
              ]}
            >
              <Ionicons
                name={isImage ? "flash" : "document-text"}
                size={30}
                color={colors.accent}
              />
            </View>

            <Text style={[styles.processingTitle, { color: colors.textPrimary }]}>
              {isImage ? "Compressing images" : "Compressing PDF"}
            </Text>

            {isImage ? (
              <>
                <Text style={[styles.processingCount, { color: colors.accent }]}>
                  {imgProgress.current} of {imgProgress.total || files.length}
                </Text>

                <View style={styles.progressTrackWrapper}>
                  <ProgressBar progress={imgProgress.percentage} />
                </View>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[styles.processingFileName, { color: colors.textSecondary }]}
                >
                  {imgProgress.currentFileName || "Optimizing..."}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.pdfStageText, { color: colors.textSecondary }]}>
                  {pdfProgress.stage || "Please wait..."}
                </Text>

                <View style={styles.progressTrackWrapper}>
                  <ProgressBar progress={pdfProgress.percentage || 40} />
                </View>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={[styles.processingFileName, { color: colors.textMuted }]}
                >
                  {pdfProgress.currentFileName || files[0]?.name || "Processing document"}
                </Text>
              </>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* 4. RESULTS STATE */}
        {/* ========================================================================= */}
        {flowState === "completed" && (
          <View style={styles.resultsContainer}>
            <ScrollView
              contentContainerStyle={styles.resultsScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* =============================================================== */}
              {/* CASE A: ALREADY OPTIMIZED (No meaningful reduction possible)   */}
              {/* =============================================================== */}
              {allAlreadyOptimized ? (
                <View style={styles.resultsInnerCol}>
                  <View style={styles.resultHeader}>
                    <View
                      style={[
                        styles.statusCircle,
                        {
                          backgroundColor: isDark
                            ? "rgba(59, 130, 246, 0.16)"
                            : "rgba(59, 130, 246, 0.1)",
                          borderColor: isDark ? "rgba(59, 130, 246, 0.4)" : "#93C5FD",
                        },
                      ]}
                    >
                      <Ionicons name="information-circle" size={32} color="#3B82F6" />
                    </View>

                    <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                      Already Optimized
                    </Text>

                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                      This file is already at its smallest practical size. No further reduction is possible without losing clarity.
                    </Text>
                  </View>

                  {/* Single Clean File Info Card */}
                  <View
                    style={[
                      styles.infoCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.infoCardRow}>
                      <View
                        style={[
                          styles.infoIconBox,
                          { backgroundColor: colors.surfaceSubtle },
                        ]}
                      >
                        <Ionicons
                          name={isImage ? "images" : "document-text"}
                          size={20}
                          color={colors.accent}
                        />
                      </View>

                      <View style={styles.infoCardContent}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="middle"
                          style={[styles.infoCardName, { color: colors.textPrimary }]}
                        >
                          {hasMultiple ? `${files.length} Files` : files[0]?.name}
                        </Text>
                        <Text style={[styles.infoCardSize, { color: colors.textSecondary }]}>
                          Size: {formatFileSize(totalOriginalSize)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.optimalBadge,
                          { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.optimalBadgeText, { color: colors.textSecondary }]}>
                          Optimal Size
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Clean Actions: Primary button to choose another file */}
                  <View style={styles.resultActionsCol}>
                    <PrimaryButton
                      title="Choose Another File"
                      variant="accent"
                      iconName="refresh-outline"
                      onPress={handleReset}
                    />

                    <PrimaryButton
                      title="Share Original File"
                      variant="secondary"
                      iconName="share-outline"
                      onPress={handleShare}
                    />
                  </View>
                </View>
              ) : allFailed ? (
                /* =============================================================== */
                /* CASE B: FAILED COMPRESSION                                      */
                /* =============================================================== */
                <View style={styles.resultsInnerCol}>
                  <View style={styles.resultHeader}>
                    <View
                      style={[
                        styles.statusCircle,
                        {
                          backgroundColor: colors.dangerSubtle,
                          borderColor: colors.danger,
                        },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={32} color={colors.danger} />
                    </View>

                    <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                      Couldn't Compress File
                    </Text>

                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                      The file could not be reduced. Please try again with another file.
                    </Text>
                  </View>

                  <View style={styles.resultActionsCol}>
                    <PrimaryButton
                      title="Try Another File"
                      variant="accent"
                      iconName="refresh-outline"
                      onPress={handleReset}
                    />
                  </View>
                </View>
              ) : (
                /* =============================================================== */
                /* CASE C: SUCCESSFUL COMPRESSION (Real savings achieved)          */
                /* =============================================================== */
                <View style={styles.resultsInnerCol}>
                  <View style={styles.resultHeader}>
                    <SuccessCheckmark
                      iconName="checkmark-sharp"
                      color="#FFFFFF"
                      bgColor={colors.success}
                    />

                    <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                      Compression Complete
                    </Text>

                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                      {hasMultiple
                        ? `${results.filter((r) => !r.error && !r.isAlreadyOptimized).length} of ${results.length} files compressed`
                        : results[0]?.name}
                    </Text>
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
                    <View style={styles.metricRow}>
                      <View style={styles.metricCol}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                          BEFORE
                        </Text>
                        <Text style={[styles.metricBefore, { color: colors.textSecondary }]}>
                          {formatFileSize(totalResultsOrig)}
                        </Text>
                      </View>

                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={colors.textMuted}
                        style={{ marginTop: 16 }}
                      />

                      <View style={[styles.metricCol, { alignItems: "flex-end" }]}>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                          AFTER
                        </Text>
                        <Text style={[styles.metricAfter, { color: colors.textPrimary }]}>
                          {formatFileSize(totalResultsComp)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.metricDivider,
                        { backgroundColor: colors.borderSubtle },
                      ]}
                    />

                    {/* Savings Row */}
                    <View style={styles.savingsRow}>
                      <View>
                        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                          TOTAL SAVED
                        </Text>
                        <Text style={[styles.savedAmount, { color: colors.accent }]}>
                          {formatFileSize(Math.max(0, totalResultsOrig - totalResultsComp))}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.savingsPill,
                          { backgroundColor: colors.accentSubtle },
                        ]}
                      >
                        <Text style={[styles.savingsPillText, { color: colors.accent }]}>
                          {overallSavingsPercent > 0
                            ? `${overallSavingsPercent.toFixed(1)}% smaller`
                            : "Optimized"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions: Save & Share */}
                  <View style={styles.resultActionsCol}>
                    <PrimaryButton
                      title={
                        isSaving
                          ? "Saving..."
                          : savedSuccess
                          ? isImage
                            ? "Saved to Photos ✓"
                            : "Saved ✓"
                          : isImage
                          ? hasMultiple
                            ? "Save All to Photos"
                            : "Save File"
                          : "Save PDF"
                      }
                      variant="accent"
                      iconName={savedSuccess ? "checkmark" : "download-outline"}
                      onPress={handleSave}
                      disabled={isSaving}
                    />

                    <PrimaryButton
                      title="Share"
                      variant="secondary"
                      iconName="share-outline"
                      onPress={handleShare}
                    />
                  </View>

                  {/* Processed Files Breakdown (if multiple files) */}
                  {results.length > 1 && (
                    <View style={styles.breakdownSection}>
                      <Text style={[styles.breakdownHeader, { color: colors.textMuted }]}>
                        PROCESSED FILES ({results.length})
                      </Text>

                      {results.map((item) => (
                        <View
                          key={item.id}
                          style={[
                            styles.breakdownCard,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <View style={styles.breakdownInfo}>
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="middle"
                              style={[styles.breakdownName, { color: colors.textPrimary }]}
                            >
                              {item.name}
                            </Text>
                            <View style={styles.breakdownSizes}>
                              <Text style={[styles.breakdownOldSize, { color: colors.textMuted }]}>
                                {formatFileSize(item.originalSize)}
                              </Text>
                              <Text style={{ color: colors.textMuted }}>→</Text>
                              <Text style={[styles.breakdownNewSize, { color: colors.textPrimary }]}>
                                {formatFileSize(item.compressedSize)}
                              </Text>
                              {item.savingsPercentage > 0 && (
                                <Text style={[styles.breakdownPercent, { color: colors.accent }]}>
                                  (-{item.savingsPercentage.toFixed(0)}%)
                                </Text>
                              )}
                            </View>
                          </View>

                          {item.compressedUri && !item.error && !item.isAlreadyOptimized && (
                            <Pressable
                              onPress={() => handleShareSingle(item.compressedUri, isImage ? "image/jpeg" : "application/pdf")}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={({ pressed }) => [
                                styles.breakdownShareBtn,
                                {
                                  backgroundColor: colors.surfaceSubtle,
                                  opacity: pressed ? 0.7 : 1,
                                },
                              ]}
                            >
                              <Ionicons name="share-outline" size={14} color={colors.textSecondary} />
                            </Pressable>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Compress Another Action */}
                  <Pressable
                    onPress={handleReset}
                    style={({ pressed }) => [
                      styles.compressAnotherBtn,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.compressAnotherText, { color: colors.textSecondary }]}>
                      Compress another file
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
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
  idleScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  idleHeader: {
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 6,
    lineHeight: 22,
  },
  choiceCards: {
    gap: 16,
    marginBottom: 28,
  },
  choiceCard: {
    borderRadius: 20,
    borderWidth: 1.2,
    padding: 20,
  },
  choiceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  choiceTextCol: {
    marginBottom: 16,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  choiceFormat: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
    letterSpacing: 0.3,
  },
  choiceDesc: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    lineHeight: 18,
  },
  choosePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  choosePillText: {
    fontSize: 14,
    fontWeight: "700",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
  },
  privacyLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  selectedContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  navActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  navCenterTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  addMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  addMoreText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filesListWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filesListContent: {
    paddingVertical: 10,
  },
  fileCardSpacing: {
    marginBottom: 8,
  },
  sizeSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  presetWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  compressingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  processingIconBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  processingCount: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8,
  },
  pdfStageText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  progressTrackWrapper: {
    width: "100%",
    marginTop: 22,
    marginBottom: 14,
  },
  processingFileName: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  resultsContainer: {
    flex: 1,
  },
  resultsScroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  resultsInnerCol: {
    width: "100%",
    alignItems: "center",
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 14,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  infoCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
    paddingRight: 8,
  },
  infoCardName: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoCardSize: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  optimalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  optimalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metricCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  metricBefore: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  metricAfter: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  metricDivider: {
    height: 1,
    marginVertical: 14,
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  savedAmount: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  savingsPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  savingsPillText: {
    fontSize: 13,
    fontWeight: "800",
  },
  resultActionsCol: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
  },
  breakdownSection: {
    width: "100%",
    marginBottom: 16,
  },
  breakdownHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  breakdownCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  breakdownInfo: {
    flex: 1,
    paddingRight: 8,
  },
  breakdownName: {
    fontSize: 13,
    fontWeight: "700",
  },
  breakdownSizes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  breakdownOldSize: {
    fontSize: 11,
    fontWeight: "500",
  },
  breakdownNewSize: {
    fontSize: 11,
    fontWeight: "700",
  },
  breakdownPercent: {
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 2,
  },
  breakdownShareBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  compressAnotherBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  compressAnotherText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
