import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/(auth)"} />;
  }
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-bold text-amber-400">Edit src/app/index.tsx to edit this screen.</Text>
    </View>
  );
}
