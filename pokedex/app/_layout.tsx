import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{
    headerTitleAlign: "center"
  }} >
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="details"
      options={{ headerBackButtonDisplayMode: "minimal", headerShown: false }} />


  </Stack>;
}
