import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import {
  COMPRESSION_PRESETS,
  CompressionPresetKey,
} from "../constants/compression";
import { useCompressor } from "../hooks/useCompressor";
import { calculateSavingsSummary, formatBytes } from "../lib/compressor";
import { useSelectedImages } from "../lib/imageStore";

export default function CompressScreen() {
  const router = useRouter();
  const images = useSelectedImages();
  const [selectedPreset, setSelectedPreset] =
    useState<CompressionPresetKey>("balanced");

  const {
    isCompressing,
    isComplete,
    current,
    total,
    progress,
    results,
    currentFilename,
    startCompression,
    reset,
  } = useCompressor();

  const totalOriginalSize = useMemo(() => {
    return images.reduce((acc, img) => acc + (img.fileSize ?? 0), 0);
  }, [images]);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    return calculateSavingsSummary(results);
  }, [results]);

  const handleStartCompression = async () => {
    if (images.length === 0) return;
    const preset = COMPRESSION_PRESETS[selectedPreset];
    await startCompression(images, preset.quality);
  };

  const handleContinue = () => {
    Alert.alert(
      "Compression Finished",
      "Images compressed successfully. Save and Share options will be available in Phase 1D.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/select"),
        },
      ]
    );
  };

  const handleCompressAgain = () => {
    reset();
  };

  // 1. COMPRESSING PROGRESS VIEW
  if (isCompressing) {
    const progressPercent = Math.round(progress * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Minimal Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Compressing</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Centered Compressing Content */}
          <View style={styles.progressCenterContent}>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeIcon}>⚡</Text>
            </View>

            <Text style={styles.compressingTitle}>Compressing...</Text>

            <Text style={styles.counterText}>
              {current} / {total}
            </Text>

            {/* Visual Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(5, progressPercent)}%` },
                ]}
              />
            </View>

            <Text style={styles.progressPercentText}>{progressPercent}%</Text>

            {currentFilename && (
              <Text
                style={styles.currentFilenameText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {currentFilename}
              </Text>
            )}

            <Text style={styles.waitNotice}>Please wait</Text>
          </View>

          {/* Empty spacer for balanced layout */}
          <View style={styles.footerSpacing} />
        </View>
      </SafeAreaView>
    );
  }

  // 2. RESULTS VIEW
  if (isComplete && summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleCompressAgain}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Results</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.resultsScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Completion Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroIconWrapper}>
                <Text style={styles.heroIcon}>✓</Text>
              </View>
              <Text style={styles.heroTitle}>Compression Complete</Text>
              <Text style={styles.heroSubtitle}>
                {summary.successfulCount} of {results.length}{" "}
                {results.length === 1 ? "image" : "images"} compressed locally
              </Text>

              {/* Stats Grid */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Original</Text>
                  <Text style={styles.statValue}>
                    {formatBytes(summary.totalOriginalSize)}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Compressed</Text>
                  <Text style={styles.statValue}>
                    {formatBytes(summary.totalCompressedSize)}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Saved</Text>
                  <Text style={[styles.statValue, styles.savedHighlight]}>
                    {summary.overallSavingsPercentage}%
                  </Text>
                </View>
              </View>

              {summary.totalSavedBytes > 0 && (
                <View style={styles.savingsBanner}>
                  <Text style={styles.savingsBannerText}>
                    🎉 Saved {formatBytes(summary.totalSavedBytes)} (
                    {summary.overallSavingsPercentage}%)
                  </Text>
                </View>
              )}
            </View>

            {/* Per-Image Results List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Image Details</Text>
              <View style={styles.resultsList}>
                {results.map((item, index) => {
                  return (
                    <View key={item.id || index} style={styles.resultItemCard}>
                      <Image
                        source={{ uri: item.compressedUri || item.originalUri }}
                        style={styles.resultThumb}
                        contentFit="cover"
                        transition={150}
                      />

                      <View style={styles.resultItemInfo}>
                        <Text
                          style={styles.resultItemName}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {item.filename}
                        </Text>

                        {item.success ? (
                          <View style={styles.resultItemSizeRow}>
                            <Text style={styles.resultOriginalSize}>
                              {formatBytes(item.originalSize)}
                            </Text>
                            <Text style={styles.resultArrow}>→</Text>
                            <Text style={styles.resultCompressedSize}>
                              {formatBytes(item.compressedSize)}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.resultErrorText}>
                            {item.error || "Couldn't compress this image."}
                          </Text>
                        )}
                      </View>

                      {item.success && item.savingsPercentage > 0 ? (
                        <View style={styles.badgeSavings}>
                          <Text style={styles.badgeSavingsText}>
                            -{item.savingsPercentage}%
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Results Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={handleContinue}
              style={styles.primaryActionButton}
            />
            <Button
              title="Compress Again"
              variant="secondary"
              onPress={handleCompressAgain}
              style={styles.secondaryActionButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 3. CONFIGURATION VIEW (PRESETS & START)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Compress</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Images Preview */}
          {images.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🖼️</Text>
              <Text style={styles.emptyTitle}>No Images Selected</Text>
              <Text style={styles.emptySub}>
                Go back to select photos from your device.
              </Text>
            </View>
          ) : (
            <View style={styles.previewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Selected Images</Text>
                <Text style={styles.sectionBadge}>
                  {images.length} {images.length === 1 ? "image" : "images"}
                  {totalOriginalSize > 0 &&
                    ` • ${formatBytes(totalOriginalSize)}`}
                </Text>
              </View>

              <FlatList
                data={images}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalThumbnails}
                renderItem={({ item }) => (
                  <View style={styles.thumbWrapper}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.thumbImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {item.fileSize !== undefined && (
                      <View style={styles.thumbSizeTag}>
                        <Text style={styles.thumbSizeText}>
                          {formatBytes(item.fileSize)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          )}

          {/* Quality Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compression Preset</Text>
            <View style={styles.presetsVerticalList}>
              {(
                Object.keys(COMPRESSION_PRESETS) as CompressionPresetKey[]
              ).map((key) => {
                const preset = COMPRESSION_PRESETS[key];
                const isSelected = selectedPreset === key;

                let subtitle = "Recommended balance";
                if (key === "high") subtitle = "Better quality";
                if (key === "maximum") subtitle = "Smallest files";

                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelectedPreset(key)}
                    style={({ pressed }) => [
                      styles.presetRowCard,
                      isSelected && styles.presetRowCardSelected,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.radioWrapper}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                    </View>

                    <View style={styles.presetTextWrapper}>
                      <View style={styles.presetLabelRow}>
                        <Text
                          style={[
                            styles.presetRowLabel,
                            isSelected && styles.presetRowLabelSelected,
                          ]}
                        >
                          {preset.label}
                        </Text>
                        {key === "balanced" && (
                          <View
                            style={[
                              styles.recommendedTag,
                              isSelected && styles.recommendedTagSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.recommendedTagText,
                                isSelected && styles.recommendedTagTextSelected,
                              ]}
                            >
                              Recommended
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.presetRowSubtitle,
                          isSelected && styles.presetRowSubtitleSelected,
                        ]}
                      >
                        {subtitle}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.presetQualityPercent,
                        isSelected && styles.presetQualityPercentSelected,
                      ]}
                    >
                      {Math.round(preset.quality * 100)}%
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Original Size Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardRow}>
              <Text style={styles.summaryCardLabel}>Original Size</Text>
              <Text style={styles.summaryCardValue}>
                {formatBytes(totalOriginalSize)}
              </Text>
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Everything happens locally on your phone. No images are uploaded
              to any server.
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title={
              images.length > 0
                ? `Compress ${images.length} ${images.length === 1 ? "Image" : "Images"}`
                : "Compress"
            }
            onPress={handleStartCompression}
            disabled={images.length === 0}
            style={styles.primaryActionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F5",
    backgroundColor: "#FAFAFA",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 18,
    color: "#18181B",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#09090B",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  previewSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181B",
  },
  horizontalThumbnails: {
    gap: 10,
    paddingVertical: 4,
  },
  thumbWrapper: {
    width: 90,
    height: 90,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E4E4E7",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbSizeTag: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: "rgba(24, 24, 27, 0.75)",
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: "center",
  },
  thumbSizeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#18181B",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: "#71717A",
    textAlign: "center",
  },
  section: {
    gap: 12,
  },
  presetsVerticalList: {
    gap: 10,
  },
  presetRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E4E4E7",
    gap: 12,
  },
  presetRowCardSelected: {
    backgroundColor: "#18181B",
    borderColor: "#18181B",
  },
  radioWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D4D4D8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#FAFAFA",
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FAFAFA",
  },
  presetTextWrapper: {
    flex: 1,
    gap: 2,
  },
  presetLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  presetRowLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#18181B",
  },
  presetRowLabelSelected: {
    color: "#FAFAFA",
  },
  recommendedTag: {
    backgroundColor: "#F4F4F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedTagSelected: {
    backgroundColor: "#27272A",
  },
  recommendedTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#71717A",
  },
  recommendedTagTextSelected: {
    color: "#A1A1AA",
  },
  presetRowSubtitle: {
    fontSize: 12,
    color: "#71717A",
    fontWeight: "500",
  },
  presetRowSubtitleSelected: {
    color: "#A1A1AA",
  },
  presetQualityPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#71717A",
  },
  presetQualityPercentSelected: {
    color: "#E4E4E7",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  summaryCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryCardLabel: {
    fontSize: 14,
    color: "#71717A",
    fontWeight: "600",
  },
  summaryCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#18181B",
  },
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F5",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  privacyIcon: {
    fontSize: 18,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: "#71717A",
    lineHeight: 16,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F4F4F5",
    gap: 10,
  },
  primaryActionButton: {
    width: "100%",
  },
  secondaryActionButton: {
    width: "100%",
  },
  footerSpacing: {
    height: 60,
  },

  /* Compressing Progress State Styles */
  progressCenterContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  progressBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#18181B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  progressBadgeIcon: {
    fontSize: 28,
  },
  compressingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#09090B",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  counterText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#71717A",
    marginBottom: 24,
  },
  progressBarTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E4E4E7",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#18181B",
    borderRadius: 6,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#71717A",
    marginBottom: 14,
  },
  currentFilenameText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "500",
    marginBottom: 8,
    maxWidth: "90%",
    textAlign: "center",
  },
  waitNotice: {
    fontSize: 14,
    color: "#71717A",
    fontWeight: "500",
  },

  /* Results State Styles */
  resultsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroIcon: {
    fontSize: 22,
    color: "#16A34A",
    fontWeight: "800",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#09090B",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#71717A",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F4F4F5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E4E4E7",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#71717A",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#18181B",
  },
  savedHighlight: {
    color: "#16A34A",
  },
  savingsBanner: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  savingsBannerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
  },
  resultsList: {
    gap: 10,
  },
  resultItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    gap: 12,
  },
  resultThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#F4F4F5",
  },
  resultItemInfo: {
    flex: 1,
    gap: 4,
  },
  resultItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#18181B",
  },
  resultItemSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultOriginalSize: {
    fontSize: 12,
    color: "#71717A",
    fontWeight: "500",
  },
  resultArrow: {
    fontSize: 12,
    color: "#A1A1AA",
  },
  resultCompressedSize: {
    fontSize: 12,
    fontWeight: "700",
    color: "#18181B",
  },
  resultErrorText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  badgeSavings: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSavingsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
});
