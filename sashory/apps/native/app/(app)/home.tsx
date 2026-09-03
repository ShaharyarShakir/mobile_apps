import { View, Text } from "react-native";
import { Button } from "heroui-native";
import { useRouter } from "expo-router";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function HomeScreen() {
  const router = useRouter();
  const { data: session } = useAuthSession();

  return (
    <View className="flex-1 items-center justify-center p-4 gap-4 bg-background">
      <Text className="text-2xl font-bold text-foreground">
        Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
      </Text>
      <Text className="text-muted-foreground">
        Signed in as {session?.user?.email}
      </Text>
      <Button onPress={() => router.push("/(app)/profile")}>
        <Button.Label>Go to Profile</Button.Label>
      </Button>
    </View>
  );
}

