import { useMe } from "@/hooks/use-me";
import { View, Text } from "react-native";
import { Button } from "heroui-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { data, isPending, isError } = useMe();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <Text className="text-foreground">Loading...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-background">
        <Text className="text-danger">Unable to load your profile.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-4 gap-4 bg-background">
      <View className="items-center gap-1">
        <Text className="text-2xl font-bold text-foreground">
          Welcome, {data.user.name}
        </Text>
        <Text className="text-muted-foreground">{data.user.email}</Text>
      </View>
      <View className="w-full max-w-xs gap-3">
        <Button onPress={() => router.push("/(app)/accounts")}>
          <Button.Label>Manage Accounts</Button.Label>
        </Button>
        <Button variant="secondary" onPress={() => router.push("/(app)/categories")}>
          <Button.Label>Manage Categories</Button.Label>
        </Button>
        <Button variant="secondary" onPress={() => router.push("/(app)/projects")}>
          <Button.Label>Projects</Button.Label>
        </Button>
        <Button variant="tertiary" onPress={() => router.push("/(app)/profile")}>
          <Button.Label>Go to Profile</Button.Label>
        </Button>
      </View>

    </View>
  );
}


