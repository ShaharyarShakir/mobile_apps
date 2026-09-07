import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAuthSession } from "@/hooks/use-auth-session";
import { signOut } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppTheme } from "@/contexts/app-theme-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = useAuthSession();
  const { isLight } = useAppTheme();
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CA";

  const confirmSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of Cashory?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const result = await signOut();
            if (result.error) {
              console.error(result.error);
              return;
            }
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="gap-6">
        {/* User Identity Card */}
        <Surface variant="secondary" className="p-6 rounded-3xl border border-border items-center gap-4">
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center shadow-sm">
            <Text className="text-accent-foreground font-bold text-2xl tracking-wider">
              {initials}
            </Text>
          </View>

          <View className="items-center gap-1">
            <Text className="text-xl font-bold text-foreground">
              {user?.name || "User"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {user?.email || "No email available"}
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2 bg-accent/15 px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-xs font-semibold text-accent">Active Member</Text>
            </View>
          </View>
        </Surface>

        {/* Preferences & Theme Section */}
        <View className="gap-2.5">
          <Text className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-1">
            Preferences
          </Text>

          <Surface variant="secondary" className="p-4 rounded-2xl border border-border flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
                <Ionicons
                  name={isLight ? "sunny-outline" : "moon-outline"}
                  size={20}
                  color={accentColor}
                />
              </View>
              <View>
                <Text className="text-sm font-bold text-foreground">
                  Theme Appearance
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Currently {isLight ? "Light Mode" : "Dark Mode"}
                </Text>
              </View>
            </View>

            <ThemeToggle />
          </Surface>
        </View>

        {/* About / System Information */}
        <View className="gap-2.5">
          <Text className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-1">
            Application
          </Text>

          <Surface variant="secondary" className="p-4 rounded-2xl border border-border gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">App Name</Text>
              <Text className="text-xs font-semibold text-muted-foreground">Cashory</Text>
            </View>
            <View className="h-[1px] bg-border/60" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Design System</Text>
              <Text className="text-xs font-semibold text-muted-foreground">HeroUI Native 1.0</Text>
            </View>
            <View className="h-[1px] bg-border/60" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Framework</Text>
              <Text className="text-xs font-semibold text-muted-foreground">Expo 56 + React 19</Text>
            </View>
          </Surface>
        </View>

        {/* Sign Out Action */}
        <View className="mt-4">
          <Button
            variant="danger"
            size="lg"
            onPress={confirmSignOut}
          >
            <Button.Label>Sign Out</Button.Label>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

