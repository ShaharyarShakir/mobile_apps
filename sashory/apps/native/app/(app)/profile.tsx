import { View, Text } from "react-native";
import { Button } from "heroui-native";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/auth-actions";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = useAuthSession();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result.error) {
      console.error(result.error);
      return;
    }

    router.replace("/(auth)/sign-in");
  };

  return (
    <View className="flex-1 items-center justify-center p-4 gap-4 bg-background">
      <Text className="text-2xl font-bold text-foreground">Profile</Text>
      <View className="items-center gap-1">
        <Text className="text-foreground font-medium">{session?.user?.name}</Text>
        <Text className="text-muted-foreground">{session?.user?.email}</Text>
      </View>
      <Button variant="danger" onPress={handleSignOut} className="mt-4">
        <Button.Label>Sign Out</Button.Label>
      </Button>
    </View>
  );
}

