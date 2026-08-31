import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatFileSize } from "../../lib/fileUtils";
import { triggerHaptic } from "../../lib/haptics";
import { ThemeMode, settingsStore } from "../../lib/settingsStore";
import { useTheme } from "../../theme/ThemeContext";

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const [totalSaved, setTotalSaved] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const loadData = async () => {
    const saved = await settingsStore.getTotalBytesSaved();
    const cache = await settingsStore.getCacheSize();
    const haptics = await settingsStore.getHapticsEnabled();
    setTotalSaved(saved);
    setCacheSize(cache);
    setHapticsEnabled(haptics);
  };

  useEffect(() => {
    loadData();
    const unsubSettings = settingsStore.subscribe(loadData);
    return () => {
      unsubSettings();
    };
  }, []);

  const handleSelectTheme = async (mode: ThemeMode) => {
    triggerHaptic("selection");
    await setThemeMode(mode);
  };

  const handleToggleHaptics = async (value: boolean) => {
    if (value) {
      await settingsStore.setHapticsEnabled(true);
      triggerHaptic("light");
    } else {
      await settingsStore.setHapticsEnabled(false);
    }
    setHapticsEnabled(value);
  };

  const handleClearCache = async () => {
    triggerHaptic("warning");
    Alert.alert(
      "Clear Temporary Cache",
      "This will remove temporary processed files from cache.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            await settingsStore.clearCache();
            await loadData();
            setIsClearing(false);
            triggerHaptic("success");
            Alert.alert("Cache Cleared", "Temporary cache has been cleared.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Preferences & Information
          </Text>
        </View>

        {/* SECTION: Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.themePillsRow}>
              {(["system", "light", "dark"] as ThemeMode[]).map((mode) => {
                const isSelected = themeMode === mode;
                const modeLabel =
                  mode === "system"
                    ? "System"
                    : mode === "light"
                    ? "Light"
                    : "Dark";
                const modeIcon =
                  mode === "system"
                    ? "phone-portrait-outline"
                    : mode === "light"
                    ? "sunny-outline"
                    : "moon-outline";

                return (
                  <Pressable
                    key={mode}
                    onPress={() => handleSelectTheme(mode)}
                    style={({ pressed }) => [
                      styles.themePill,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? colors.surfaceElevated
                            : colors.surfaceSubtle
                          : "transparent",
                        borderColor: isSelected
                          ? colors.accent
                          : colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name={modeIcon}
                      size={16}
                      color={isSelected ? colors.accent : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themePillText,
                        {
                          color: isSelected ? colors.accent : colors.textPrimary,
                        },
                      ]}
                    >
                      {modeLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* SECTION: Haptics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            FEEDBACK
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <View
                  style={[
                    styles.settingIconBox,
                    { backgroundColor: colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={18}
                    color={colors.textPrimary}
                  />
                </View>
                <View style={styles.settingTextCol}>
                  <Text
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                  >
                    Haptic feedback
                  </Text>
                  <Text
                    style={[
                      styles.cardSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Vibrate on key actions & completion
                  </Text>
                </View>
              </View>

              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: isDark ? "#27272A" : "#CBD5E1", true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SECTION: Storage & Cache */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            STORAGE
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Ionicons name="flash-outline" size={16} color={colors.accent} />
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total storage saved
                </Text>
              </View>
              <Text
                style={[styles.statValue, { color: colors.textPrimary }]}
              >
                {formatFileSize(totalSaved)}
              </Text>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: colors.borderSubtle },
              ]}
            />

            <View style={styles.cardRow}>
              <View
                style={[
                  styles.settingIconBox,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>

              <View style={styles.cardInfo}>
                <Text
                  style={[styles.cardTitle, { color: colors.textPrimary }]}
                >
                  Temporary cache
                </Text>
                <Text
                  style={[
                    styles.cardSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {formatFileSize(cacheSize)} in cache
                </Text>
              </View>

              <Pressable
                onPress={handleClearCache}
                disabled={isClearing}
                style={({ pressed }) => [
                  styles.secondaryButtonSmall,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    opacity: pressed || isClearing ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.secondaryButtonSmallText,
                    { color: colors.textPrimary },
                  ]}
                >
                  {isClearing ? "Clearing..." : "Clear"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* SECTION: Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            PRIVACY
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.privacyContent}>
              <View style={styles.privacyTitleRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={colors.success}
                />
                <Text
                  style={[styles.privacyHeadline, { color: colors.textPrimary }]}
                >
                  Your files stay on your device.
                </Text>
              </View>
              <Text
                style={[styles.privacyBody, { color: colors.textSecondary }]}
              >
                Tiny Compressor does not upload your images or PDFs for compression. All processing occurs 100% locally.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION: About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            ABOUT
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                App
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                Tiny Compressor
              </Text>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: colors.borderSubtle },
              ]}
            />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                1.0.0
              </Text>
            </View>

            <View
              style={[
                styles.cardDivider,
                { backgroundColor: colors.borderSubtle },
              ]}
            />

            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Developer
              </Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                Made by My Tiny Apps
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Part of My Tiny Apps collection
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  settingTextCol: {
    flex: 1,
  },
  themePillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  themePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  themePillText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 16,
  },
  cardDivider: {
    height: 1,
    marginVertical: 12,
  },
  secondaryButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryButtonSmallText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  privacyContent: {
    gap: 6,
  },
  privacyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  privacyHeadline: {
    fontSize: 14,
    fontWeight: "700",
  },
  privacyBody: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    marginTop: 2,
  },
  footerNote: {
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
