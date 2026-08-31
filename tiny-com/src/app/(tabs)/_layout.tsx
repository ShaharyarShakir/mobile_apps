import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ColorValue, Platform, Pressable, StyleSheet, View } from "react-native";
import { triggerHaptic } from "../../lib/haptics";
import { useTheme } from "../../theme/ThemeContext";

function CustomTabButton({
  children,
  onPress,
  accessibilityState,
}: any) {
  const { isDark } = useTheme();

  const handlePress = (e: any) => {
    triggerHaptic("selection");
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.tabButtonWrapper,
        {
          opacity: pressed ? 0.75 : 1,
        },
      ]}
      android_ripple={{
        color: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        borderless: true,
        radius: 28,
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: (props) => <CustomTabButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 26 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Compress",
          tabBarIcon: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: ColorValue | string;
            size: number;
          }) => (
            <View
              style={[
                styles.iconBox,
                focused && {
                  backgroundColor: isDark
                    ? "rgba(244, 63, 94, 0.14)"
                    : "rgba(225, 29, 72, 0.08)",
                },
              ]}
            >
              <Ionicons
                name={focused ? "flash" : "flash-outline"}
                size={20}
                color={color as string}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recent"
        options={{
          title: "Recent",
          tabBarIcon: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: ColorValue | string;
            size: number;
          }) => (
            <View
              style={[
                styles.iconBox,
                focused && {
                  backgroundColor: isDark
                    ? "rgba(244, 63, 94, 0.14)"
                    : "rgba(225, 29, 72, 0.08)",
                },
              ]}
            >
              <Ionicons
                name={focused ? "time" : "time-outline"}
                size={20}
                color={color as string}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({
            focused,
            color,
          }: {
            focused: boolean;
            color: ColorValue | string;
            size: number;
          }) => (
            <View
              style={[
                styles.iconBox,
                focused && {
                  backgroundColor: isDark
                    ? "rgba(244, 63, 94, 0.14)"
                    : "rgba(225, 29, 72, 0.08)",
                },
              ]}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={20}
                color={color as string}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
