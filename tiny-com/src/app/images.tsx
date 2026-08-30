import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { PrimaryButton } from "../components/PrimaryButton";
import { SelectedFileCard } from "../components/SelectedFileCard";
import { fileStore } from "../lib/fileStore";
import { formatFileSize, getTotalSize } from "../lib/fileUtils";
import { MAX_IMAGE_COUNT, pickImages } from "../lib/pickers/imagePicker";
import { SelectedFile } from "../types/file";

export default function ImagesScreen() {
  const router = useRouter();
  const [files, setFiles] = useState<SelectedFile[]>(() =>
    fileStore.getImageFiles()
  );
  const [loading, setLoading] = useState(false);

  const handlePickImages = async () => {
    if (files.length >= MAX_IMAGE_COUNT) {
      Alert.alert(
        "Limit Reached",
        `You can select a maximum of ${MAX_IMAGE_COUNT} images at a time.`
      );
      return;
    }

    try {
      setLoading(true);
      const newFiles = await pickImages(files.length);
      if (newFiles.length > 0) {
        setFiles((current) => {
          const combined = [...current, ...newFiles];
          const capped = combined.slice(0, MAX_IMAGE_COUNT);
          fileStore.setImageFiles(capped);
          return capped;
        });
      }
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message === "MEDIA_PERMISSION_DENIED"
      ) {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to select images for compression."
        );
      } else {
        Alert.alert("Error", "Could not load images. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((current) => {
      const updated = current.filter((file) => file.id !== id);
      fileStore.setImageFiles(updated);
      return updated;
    });
  };

  const handleContinue = () => {
    if (files.length === 0) return;
    fileStore.setImageFiles(files);
    router.push("/compress-image");
  };

  const totalSize = getTotalSize(files);
  const isAtLimit = files.length >= MAX_IMAGE_COUNT;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Navigation Header */}
        <View className="flex-row items-center justify-between border-b border-neutral-100 px-6 py-4">
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="flex-row items-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Back to home"
          >
            <Text className="text-lg font-semibold text-black">← Images</Text>
          </Pressable>

          {files.length > 0 && !isAtLimit && (
            <Pressable
              onPress={handlePickImages}
              disabled={loading}
              className="rounded-full bg-neutral-100 px-3.5 py-1.5 active:bg-neutral-200"
              accessibilityRole="button"
              accessibilityLabel="Add more images"
            >
              <Text className="text-sm font-semibold text-black">+ Add</Text>
            </Pressable>
          )}
        </View>

        {/* Content Area */}
        {files.length === 0 ? (
          <EmptyState
            icon="📷"
            title="No images selected"
            description="Choose photos to compress them."
            buttonTitle="Select Images"
            onSelect={handlePickImages}
            loading={loading}
          />
        ) : (
          <View className="flex-1">
            {/* Selection Summary */}
            <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
              <Text className="text-sm font-semibold text-black">
                {files.length} {files.length === 1 ? "image" : "images"} selected
              </Text>
              <Text className="text-sm font-medium text-neutral-500">
                Total: {formatFileSize(totalSize)}
              </Text>
            </View>

            {/* List of Selected Files */}
            <FlatList
              data={files}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="px-6 py-1.5">
                  <SelectedFileCard file={item} onRemove={handleRemoveFile} />
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
            />

            {/* Sticky Bottom Action */}
            <View className="border-t border-neutral-100 bg-white p-6">
              <PrimaryButton
                title="Compress →"
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
