import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { ImageCard } from "../components/ImageCard";
import {
  mapSelectedImages,
  MAX_SELECTION_LIMIT,
  pickImages,
} from "../lib/imagePicker";
import { imageStore, useSelectedImages } from "../lib/imageStore";

export default function SelectScreen() {
  const router = useRouter();
  const images = useSelectedImages();
  const [loadingMore, setLoadingMore] = useState(false);
  const { width } = useWindowDimensions();

  // 2-column grid calculations
  const numColumns = 2;
  const gap = 12;
  const padding = 20;
  const cardWidth = (width - padding * 2 - gap * (numColumns - 1)) / numColumns;

  const handleAddMore = async () => {
    if (images.length >= MAX_SELECTION_LIMIT) return;

    try {
      setLoadingMore(true);
      const remainingSlots = MAX_SELECTION_LIMIT - images.length;
      const assets = await pickImages(remainingSlots);
      if (assets && assets.length > 0) {
        const newSelected = mapSelectedImages(assets);
        imageStore.appendImages(newSelected, MAX_SELECTION_LIMIT);
      }
    } catch {
      // Permission errors handled in pickImages
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRemove = (id: string) => {
    imageStore.removeImage(id);
  };

  const handleGoToCompress = () => {
    if (images.length > 0) {
      router.push("/compress");
    }
  };

  const isFull = images.length >= MAX_SELECTION_LIMIT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Navigation Header */}
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

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Selected Images</Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{images.length}</Text>
          </View>
        </View>

        {/* Content */}
        {images.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Text style={styles.emptyIcon}>📷</Text>
            </View>
            <Text style={styles.emptyTitle}>No images selected</Text>
            <Text style={styles.emptySubtitle}>
              Select one or more images{"\n"}to compress them.
            </Text>
            <Button
              title="Select Images"
              variant="secondary"
              onPress={handleAddMore}
              loading={loadingMore}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ width: cardWidth }}>
                <ImageCard image={item} onRemove={handleRemove} />
              </View>
            )}
            ListFooterComponent={
              !isFull ? (
                <Pressable
                  onPress={handleAddMore}
                  disabled={loadingMore}
                  style={({ pressed }) => [
                    styles.addMoreCard,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.addMoreIcon}>+</Text>
                  <Text style={styles.addMoreText}>
                    {loadingMore
                      ? "Loading..."
                      : `Add more (${images.length}/${MAX_SELECTION_LIMIT})`}
                  </Text>
                </Pressable>
              ) : null
            }
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {images.length} {images.length === 1 ? "image" : "images"} selected
            </Text>
            {images.length > 0 && (
              <Pressable
                onPress={() => imageStore.clearImages()}
                hitSlop={8}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            )}
          </View>

          <Button
            title="Compress →"
            onPress={handleGoToCompress}
            disabled={images.length === 0}
            style={styles.compressButton}
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#09090B",
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: "#18181B",
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: "#FAFAFA",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  addMoreCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E4E4E7",
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  addMoreIcon: {
    fontSize: 18,
    color: "#71717A",
    fontWeight: "600",
  },
  addMoreText: {
    fontSize: 14,
    color: "#71717A",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F4F4F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#18181B",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#71717A",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 180,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F4F4F5",
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#71717A",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  compressButton: {
    width: "100%",
  },
});

