import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    Text,
    View
} from "react-native";
import { monetizationStore } from "../lib/monetizationStore";
import { PrimaryButton } from "./PrimaryButton";

type UpgradeModalProps = {
  visible: boolean;
  onClose: () => void;
  onUnlocked?: () => void;
};

export function UpgradeModal({
  visible,
  onClose,
  onUnlocked,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      // Simulate/trigger non-consumable store entitlement unlock
      await new Promise((resolve) => setTimeout(resolve, 800));
      await monetizationStore.unlockPro();
      Alert.alert(
        "Tiny Compressor Pro Unlocked",
        "Thank you! You now have unlimited lifetime compression."
      );
      if (onUnlocked) onUnlocked();
      onClose();
    } catch {
      Alert.alert("Purchase Failed", "Could not complete purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const isPro = await monetizationStore.restorePurchases();
      if (isPro) {
        Alert.alert("Restored", "Your lifetime purchase has been restored.");
        if (onUnlocked) onUnlocked();
        onClose();
      } else {
        Alert.alert("No Purchases Found", "No previous lifetime purchase was found.");
      }
    } catch {
      Alert.alert("Restore Failed", "Could not restore purchases.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="rounded-t-3xl bg-white p-6 pb-10">
          {/* Close Handle */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="rounded-full bg-black px-3 py-1">
              <Text className="text-xs font-bold text-white uppercase tracking-wider">
                Lifetime Pro
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="h-8 w-8 items-center justify-center rounded-full bg-neutral-100"
            >
              <Text className="text-sm font-bold text-neutral-500">✕</Text>
            </Pressable>
          </View>

          {/* Title & Subtitle */}
          <Text className="text-2xl font-extrabold tracking-tight text-black">
            Unlock Tiny Compressor
          </Text>
          <Text className="mt-1 text-base font-medium text-neutral-500">
            Unlimited image & PDF compression on your phone.
          </Text>

          {/* Value Props */}
          <View className="my-6 gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <View className="flex-row items-center">
              <Text className="mr-3 text-lg">⚡</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-black">
                  Unlimited compression
                </Text>
                <Text className="text-xs text-neutral-500">
                  No batch or file count restrictions
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="mr-3 text-lg">🔒</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-black">
                  100% On-device & private
                </Text>
                <Text className="text-xs text-neutral-500">
                  Your files never touch an external server
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <Text className="mr-3 text-lg">💎</Text>
              <View className="flex-1">
                <Text className="text-sm font-bold text-black">
                  One-time purchase
                </Text>
                <Text className="text-xs text-neutral-500">
                  Lifetime access · No subscriptions
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <PrimaryButton
            title="$4.99 · Unlock Lifetime Access"
            onPress={handlePurchase}
            loading={loading}
          />

          <View className="mt-4 flex-row items-center justify-center gap-6">
            <Pressable onPress={handleRestore} disabled={loading}>
              <Text className="text-xs font-semibold text-neutral-500 underline">
                Restore Purchases
              </Text>
            </Pressable>
            <Pressable onPress={onClose} disabled={loading}>
              <Text className="text-xs font-semibold text-neutral-400">
                Maybe Later
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

