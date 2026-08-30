import { Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

type EmptyStateProps = {
  icon: string;
  title?: string;
  description?: string;
  buttonTitle: string;
  onSelect: () => void;
  loading?: boolean;
};

export function EmptyState({
  icon,
  title = "No files selected",
  description = "Choose files to compress them.",
  buttonTitle,
  onSelect,
  loading = false,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="mb-4 text-5xl">{icon}</Text>
      <Text className="text-center text-xl font-bold tracking-tight text-black">
        {title}
      </Text>
      <Text className="mt-2 text-center text-base font-medium text-neutral-500">
        {description}
      </Text>
      <View className="mt-8 w-full max-w-xs">
        <PrimaryButton
          title={buttonTitle}
          onPress={onSelect}
          loading={loading}
        />
      </View>
    </View>
  );
}

