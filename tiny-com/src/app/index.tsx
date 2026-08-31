import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandLogo } from "../components/BrandLogo";
import { FileTypeCard } from "../components/FileTypeCard";
import { UpgradeModal } from "../components/UpgradeModal";
import { monetizationStore } from "../lib/monetizationStore";

export default function HomeScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [remainingFree, setRemainingFree] = useState<number>(5);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadStatus = async () => {
    const pro = await monetizationStore.isPro();
    const remaining = await monetizationStore.getRemainingFreeCompressions();
    setIsPro(pro);
    setRemainingFree(remaining);
  };

  useEffect(() => {
    loadStatus();
    const unsubscribe = monetizationStore.subscribe(() => {
      loadStatus();
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between px-6 py-10">
        {/* Header & Status */}
        <View className="pt-4">
          <View className="flex-row items-center justify-between pb-6">
            <View />
            {isPro ? (
              <View className="rounded-full bg-black px-3 py-1">
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  PRO UNLOCKED
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowUpgradeModal(true)}
                className="flex-row items-center rounded-full bg-neutral-100 px-3 py-1 active:bg-neutral-200"
              >
                <Text className="text-xs font-bold text-black">
                  {remainingFree} free left ·{" "}
                  <Text className="text-neutral-500">Upgrade</Text>
                </Text>
              </Pressable>
            )}
          </View>

          <View className="items-center">
            <BrandLogo size={56} className="mb-4" />
            <Text className="text-center text-3xl font-extrabold tracking-tight text-black">
              Tiny Compressor
            </Text>
            <Text className="mt-3 text-center text-base font-medium text-neutral-500">
              Compress files.{"\n"}Keep your originals.
            </Text>
          </View>
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
        <View className="items-center pb-2">
          <View className="flex-row items-center justify-center gap-1.5">
            <Text className="text-sm">🔒</Text>
            <Text className="text-sm font-medium text-neutral-400">
              Everything stays on your device.
            </Text>
          </View>
        </View>
      </View>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUnlocked={loadStatus}
      />
    </SafeAreaView>
  );
}
