import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { pickImages, mapSelectedImages } from "../lib/imagePicker";
import { imageStore } from "../lib/imageStore";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelectImages = async () => {
    try {
      setLoading(true);
      const assets = await pickImages(20);
      if (assets && assets.length > 0) {
        const selected = mapSelectedImages(assets);
        imageStore.setImages(selected);
        router.push("/select");
      }
    } catch {
      // Permission errors or cancellations are handled cleanly in imagePicker
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.logoWrapper}>
            <Logo size={80} />
          </View>

          <Text style={styles.title}>Image{"\n"}Compressor</Text>
          <Text style={styles.subtitle}>Make images smaller.</Text>
        </View>

        <View style={styles.footerContent}>
          <Button
            title="Select Images"
            onPress={handleSelectImages}
            loading={loading}
            style={styles.primaryButton}
          />

          <View style={styles.privacyRow}>
            <Text style={styles.privacyLock}>🔒</Text>
            <Text style={styles.privacyText}>
              Your images never leave your device.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
    paddingVertical: 36,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#09090B",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    color: "#71717A",
    textAlign: "center",
    fontWeight: "400",
    letterSpacing: -0.2,
  },
  footerContent: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    width: "100%",
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
  privacyLock: {
    fontSize: 13,
  },
  privacyText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "500",
    textAlign: "center",
  },
});
