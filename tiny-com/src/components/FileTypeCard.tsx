import { Pressable, Text, View } from "react-native";

interface FileTypeCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  className?: string;
}

export function FileTypeCard({
  icon,
  title,
  description,
  onPress,
  className = "",
}: FileTypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${description}`}
      className={`w-full rounded-2xl border border-neutral-200 bg-white p-6 active:bg-neutral-50 active:border-neutral-300 ${className}`}
    >
      <View className="items-center justify-center py-2">
        <View className="mb-3 flex-row items-center justify-center">
          <Text className="mr-2 text-2xl">{icon}</Text>
          <Text className="text-xl font-bold text-black tracking-tight">
            {title}
          </Text>
        </View>
        <Text className="text-center text-sm font-medium text-neutral-500">
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

