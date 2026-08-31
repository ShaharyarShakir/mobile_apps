import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { formatFileSize } from "../lib/fileUtils";
import { triggerHaptic } from "../lib/haptics";
import { useTheme } from "../theme/ThemeContext";
import { SelectedFile } from "../types/file";

type SelectedFileCardProps = {
  file: SelectedFile;
  onRemove: (id: string) => void;
};

export function SelectedFileCard({ file, onRemove }: SelectedFileCardProps) {
  const { colors, isDark } = useTheme();
  const isImage = file.type === "image";

  const handleRemove = () => {
    triggerHaptic("light");
    onRemove(file.id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Thumbnail or Document Icon */}
      {isImage ? (
        <Image
          source={{ uri: file.uri }}
          style={[styles.thumbnail, { backgroundColor: colors.surfaceSubtle }]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.docIconBox,
            {
              backgroundColor: isDark
                ? "rgba(244, 63, 94, 0.12)"
                : "rgba(225, 29, 72, 0.08)",
            },
          ]}
        >
          <Ionicons name="document-text" size={22} color={colors.accent} />
        </View>
      )}

      {/* File Info */}
      <View style={styles.fileInfo}>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.fileName, { color: colors.textPrimary }]}
        >
          {file.name}
        </Text>
        <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
          {formatFileSize(file.size)}
        </Text>
      </View>

      {/* Remove Button */}
      <Pressable
        onPress={handleRemove}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.removeButton,
          {
            backgroundColor: colors.surfaceSubtle,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${file.name}`}
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  fileSize: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
