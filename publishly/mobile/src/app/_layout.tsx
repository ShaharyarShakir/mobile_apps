import { DarkTheme, DefaultTheme, ThemeProvider, useRouter, useSegments, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAppStore } from '@/store/useAppStore';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import '../global.css';

SplashScreen.preventAutoHideAsync();

// Create a query client for caching and server state syncing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function NavigationContent() {
  const segments = useSegments();
  const router = useRouter();
  const { accessToken, isInitialized, initializeAuth } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!accessToken && !inAuthGroup) {
      // Redirect to login if trying to access protected route without token
      router.replace('/(auth)/login');
    } else if (accessToken && inAuthGroup) {
      // Redirect to home if logged in and trying to access auth pages
      router.replace('/');
    }
  }, [accessToken, isInitialized, segments, router]);

  if (!isInitialized) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const inAuthGroup = segments[0] === '(auth)';

  return inAuthGroup ? <Slot /> : <AppTabs />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <NavigationContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
