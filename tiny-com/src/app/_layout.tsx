import { ObserveInteractiveMarker, ObserveRoot } from "expo-observe";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import "../global.css";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

LogBox.ignoreLogs([
  "Trying to parse invalid object",
  "Invalid object ref:",
]);

function RootNavigation() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ObserveInteractiveMarker />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="images" options={{ headerShown: false }} />
        <Stack.Screen name="pdf" options={{ headerShown: false }} />
        <Stack.Screen name="compress-image" options={{ headerShown: false }} />
        <Stack.Screen name="compress-pdf" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ObserveRoot>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </ObserveRoot>
  );
}

