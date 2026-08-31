import { Image, Pressable, Text, View } from "react-native";
import { formatFileSize } from "../lib/fileUtils";
import { SelectedFile } from "../types/file";

type SelectedFileCardProps = {
  file: SelectedFile;
  onRemove: (id: string) => void;
  className?: string;
};

export function SelectedFileCard({
  file,
  onRemove,
  className = "",
}: SelectedFileCardProps) {
  const isImage = file.type === "image";

  return (
    <View
      className={`flex-row items-center rounded-2xl border border-neutral-200 bg-white p-3.5 ${className}`}
    >
      {/* Thumbnail or Document Icon */}
      {isImage ? (
        <Image
          source={{ uri: file.uri }}
          className="h-16 w-16 rounded-xl bg-neutral-100"
          resizeMode="cover"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
          <Text className="text-3xl">📄</Text>
        </View>
      )}

      {/* File Info */}
      <View className="ml-3.5 flex-1 justify-center pr-2">
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          className="text-base font-semibold text-black"
        >
          {file.name}
        </Text>
        <Text className="mt-1 text-sm font-medium text-neutral-500">
          {formatFileSize(file.size)}
        </Text>
      </View>

      {/* Remove Button */}
      <Pressable
        onPress={() => onRemove(file.id)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200"
        accessibilityRole="button"
        accessibilityLabel={`Remove ${file.name}`}
      >
        <Text className="text-sm font-bold text-neutral-600">✕</Text>
      </Pressable>
    </View>
  );
}

