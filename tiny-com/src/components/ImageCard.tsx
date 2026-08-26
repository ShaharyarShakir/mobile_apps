import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatBytes } from "../lib/compressor";
import { SelectedImage } from "../types/image";

type ImageCardProps = {
  image: SelectedImage;
  onRemove: (id: string) => void;
};

export function ImageCard({ image, onRemove }: ImageCardProps) {
  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image.uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <Pressable
          onPress={() => onRemove(image.id)}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${image.filename}`}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.filename} numberOfLines={1} ellipsizeMode="middle">
          {image.filename}
        </Text>
        <Text style={styles.dimensions}>
          {image.width} × {image.height}
        </Text>
        {image.fileSize !== undefined && (
          <Text style={styles.fileSize}>{formatBytes(image.fileSize)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F4F4F5",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(24, 24, 27, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonPressed: {
    backgroundColor: "rgba(24, 24, 27, 0.95)",
    transform: [{ scale: 0.92 }],
  },
  removeButtonText: {
    color: "#FAFAFA",
    fontSize: 12,
    fontWeight: "700",
  },
  metadata: {
    padding: 10,
    gap: 2,
  },
  filename: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181B",
  },
  dimensions: {
    fontSize: 12,
    color: "#71717A",
  },
  fileSize: {
    fontSize: 12,
    fontWeight: "600",
    color: "#09090B",
    marginTop: 2,
  },
});

