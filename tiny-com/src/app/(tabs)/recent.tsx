import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { RecentItem, recentStore } from "../../lib/recentStore";
import { formatFileSize } from "../../lib/fileUtils";
import { shareFile } from "../../lib/storageService";
import { triggerHaptic } from "../../lib/haptics";

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function RecentScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    const list = await recentStore.getRecentItems();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
    const unsubscribe = recentStore.subscribe(loadItems);
    return () => {
      unsubscribe();
    };
  }, [loadItems]);

  const handleClearAll = () => {
    triggerHaptic("warning");
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your recent compression history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await recentStore.clearRecent();
            await loadItems();
          },
        },
      ]
    );
  };

  const handleRemoveItem = async (id: string) => {
    triggerHaptic("light");
    await recentStore.removeRecentItem(id);
    await loadItems();
  };

  const handleShare = async (item: RecentItem) => {
    triggerHaptic("light");
    if (item.uri) {
      const mime = item.type === "pdf" ? "application/pdf" : "image/jpeg";
      await shareFile(item.uri, mime);
    } else {
      Alert.alert(
        "File Not Found",
        "The temporary file was already cleaned up or removed from cache."
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Recent Files
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Files compressed on this device
            </Text>
          </View>

          {items.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                styles.clearButton,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Clear compression history"
            >
              <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                Clear
              </Text>
            </Pressable>
          )}
        </View>

        {/* Content */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconBox,
                {
                  backgroundColor: isDark
                    ? "rgba(244, 63, 94, 0.12)"
                    : "rgba(225, 29, 72, 0.08)",
                },
              ]}
            >
              <Ionicons name="time-outline" size={36} color={colors.accent} />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No recent files
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Files you compress will appear here for quick access and sharing.
            </Text>

            <Pressable
              onPress={() => {
                triggerHaptic("light");
                router.replace("/");
              }}
              style={({ pressed }) => [
                styles.emptyActionBtn,
                {
                  backgroundColor: colors.primaryButtonBg,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyActionBtnText,
                  { color: colors.primaryButtonText },
                ]}
              >
                Compress a File
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isImage = item.type === "image";
              const savedBytes = Math.max(0, item.originalSize - item.compressedSize);

              return (
                <View
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {/* File Icon / Thumb */}
                  {isImage && item.uri ? (
                    <Image
                      source={{ uri: item.uri }}
                      style={[styles.itemThumb, { backgroundColor: colors.surfaceSubtle }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.itemDocIcon,
                        {
                          backgroundColor: isDark
                            ? "rgba(244, 63, 94, 0.14)"
                            : "rgba(225, 29, 72, 0.08)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={isImage ? "images" : "document-text"}
                        size={20}
                        color={colors.accent}
                      />
                    </View>
                  )}

                  {/* Details */}
                  <View style={styles.itemDetails}>
                    <View style={styles.itemHeaderRow}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="middle"
                        style={[styles.itemName, { color: colors.textPrimary }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.itemTime, { color: colors.textMuted }]}
                      >
                        {formatTimestamp(item.timestamp)}
                      </Text>
                    </View>

                    <View style={styles.itemSizeRow}>
                      <Text
                        style={[styles.itemOldSize, { color: colors.textMuted }]}
                      >
                        {formatFileSize(item.originalSize)}
                      </Text>
                      <Text
                        style={[styles.itemArrow, { color: colors.textMuted }]}
                      >
                        →
                      </Text>
                      <Text
                        style={[styles.itemNewSize, { color: colors.textPrimary }]}
                      >
                        {formatFileSize(item.compressedSize)}
                      </Text>

                      {item.savingsPercentage > 0 && (
                        <View
                          style={[
                            styles.savingsBadge,
                            { backgroundColor: colors.accentSubtle },
                          ]}
                        >
                          <Text
                            style={[
                              styles.savingsBadgeText,
                              { color: colors.accent },
                            ]}
                          >
                            -{item.savingsPercentage.toFixed(0)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.itemActions}>
                    {item.uri && (
                      <Pressable
                        onPress={() => handleShare(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={({ pressed }) => [
                          styles.actionIconBtn,
                          {
                            backgroundColor: colors.surfaceSubtle,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Share file"
                      >
                        <Ionicons
                          name="share-outline"
                          size={15}
                          color={colors.textSecondary}
                        />
                      </Pressable>
                    )}

                    <Pressable
                      onPress={() => handleRemoveItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={({ pressed }) => [
                        styles.actionIconBtn,
                        {
                          backgroundColor: colors.surfaceSubtle,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Remove from history"
                    >
                      <Ionicons
                        name="close"
                        size={15}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            }}
          />
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 64,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  emptyActionBtn: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
  },
  emptyActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  itemDocIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
    marginRight: 6,
  },
  itemTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  itemSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  itemOldSize: {
    fontSize: 12,
    fontWeight: "500",
  },
  itemArrow: {
    fontSize: 11,
  },
  itemNewSize: {
    fontSize: 12,
    fontWeight: "700",
  },
  savingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 4,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
