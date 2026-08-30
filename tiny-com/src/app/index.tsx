import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileTypeCard } from "../components/FileTypeCard";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between px-6 py-12">
        {/* Header */}
        <View className="items-center pt-8">
          <Text className="text-center text-3xl font-extrabold tracking-tight text-black">
            Tiny Compressor
          </Text>
          <Text className="mt-3 text-center text-base font-medium text-neutral-500">
            Compress files on your{"\n"}phone.
          </Text>
        </View>

        {/* Action Cards */}
        <View className="w-full gap-4">
          <FileTypeCard
            icon="📷"
            title="Images"
            description="Compress your photos"
            onPress={() => router.push("/images")}
          />

          <FileTypeCard
            icon="📄"
            title="PDFs"
            description="Compress documents"
            onPress={() => router.push("/pdf")}
          />
        </View>

        {/* Privacy Footer */}
        <View className="items-center pb-4">
          <View className="flex-row items-center justify-center gap-1.5">
            <Text className="text-sm">🔒</Text>
            <Text className="text-sm font-medium text-neutral-400">
              Everything stays on your device
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
