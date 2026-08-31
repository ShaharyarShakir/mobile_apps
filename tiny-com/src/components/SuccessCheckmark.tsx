import { Text, View } from "react-native";

export function SuccessCheckmark() {
  return (
    <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-black">
      <Text className="text-xl font-bold text-white">✓</Text>
    </View>
  );
}

