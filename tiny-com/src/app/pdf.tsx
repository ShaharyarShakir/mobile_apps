import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { SelectedFileCard } from "../components/SelectedFileCard";
import { fileStore } from "../lib/fileStore";
import { formatFileSize, getTotalSize } from "../lib/fileUtils";
import { MAX_PDF_COUNT, pickPDFs } from "../lib/pickers/pdfPicker";
import { SelectedFile } from "../types/file";

export default function PdfScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [files, setFiles] = useState<SelectedFile[]>(() =>
    fileStore.getPdfFiles()
  );
  const [loading, setLoading] = useState(false);

  const handlePickPDFs = async () => {
    if (files.length >= MAX_PDF_COUNT) {
      Alert.alert(
        "Limit Reached",
        `You can select a maximum of ${MAX_PDF_COUNT} PDFs at a time.`
      );
      return;
    }

    try {
      setLoading(true);
      const newFiles = await pickPDFs(files.length);
      if (newFiles.length > 0) {
        setFiles((current) => {
          const combined = [...current, ...newFiles];
          const capped = combined.slice(0, MAX_PDF_COUNT);
          fileStore.setPdfFiles(capped);
          return capped;
        });
      }
    } catch {
      Alert.alert("Error", "Could not load PDFs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((current) => {
      const updated = current.filter((file) => file.id !== id);
      fileStore.setPdfFiles(updated);
      return updated;
    });
  };

  const handleContinue = () => {
    if (files.length === 0) return;
    fileStore.setPdfFiles(files);
    router.push("/compress-pdf");
  };

  const totalSize = getTotalSize(files);
  const isAtLimit = files.length >= MAX_PDF_COUNT;

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
            onPress={() => router.back()}
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
              PDFs
            </Text>
          </Pressable>

          {files.length > 0 && !isAtLimit && (
            <Pressable
              onPress={handlePickPDFs}
              disabled={loading}
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: colors.accentSubtle,
                  borderColor: colors.accent,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add more PDFs"
            >
              <Ionicons name="add" size={16} color={colors.accent} />
              <Text style={[styles.addButtonText, { color: colors.accent }]}>
                Add More
              </Text>
            </Pressable>
          )}
        </View>

        {/* Content Area */}
        {files.length === 0 ? (
          <EmptyState
            iconName="document-text-outline"
            title="No PDFs selected"
            description="Choose documents from your files to compress and optimize them."
            buttonTitle="Select PDFs"
            onSelect={handlePickPDFs}
            loading={loading}
          />
        ) : (
          <View style={styles.listContainer}>
            {/* Selection Summary */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryCount, { color: colors.textPrimary }]}>
                {files.length} {files.length === 1 ? "PDF" : "PDFs"} selected
              </Text>
              <Text
                style={[styles.summarySize, { color: colors.textSecondary }]}
              >
                Total: {formatFileSize(totalSize)}
              </Text>
            </View>

            {/* List of Selected Files */}
            <FlatList
              data={files}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                  <SelectedFileCard file={item} onRemove={handleRemoveFile} />
                </View>
              )}
              contentContainerStyle={styles.listContent}
            />

            {/* Sticky Bottom Action */}
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                },
              ]}
            >
              <PrimaryButton
                title={`Compress ${files.length} ${
                  files.length === 1 ? "PDF" : "PDFs"
                } →`}
                variant="accent"
                onPress={handleContinue}
                disabled={files.length === 0}
              />
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listContainer: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  summaryCount: {
    fontSize: 15,
    fontWeight: "700",
  },
  summarySize: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 10,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});
