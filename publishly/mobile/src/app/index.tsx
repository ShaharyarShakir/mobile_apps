import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { useHealth } from '../api/hooks/useHealth';

export default function HomeScreen() {
  const { theme, setTheme, user, setUser, logout } = useAppStore();
  const { data: health, isLoading, error, refetch } = useHealth();

  const toggleMockUser = () => {
    if (user) {
      logout();
    } else {
      setUser({
        id: 'user_123',
        email: 'pilot@postpilot.ai',
        fullName: 'Pilot Instructor',
        isActive: true,
        isSuperuser: false,
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ScrollView className={`flex-1 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <SafeAreaView className="p-6 flex-1">
        {/* Header Section */}
        <View className="mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-extrabold tracking-tight text-indigo-500">
              PostPilot AI
            </Text>
            <Text className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Production Foundation Setup
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            className={`px-4 py-2 rounded-full ${
              theme === 'dark'
                ? 'bg-slate-900 border border-slate-800'
                : 'bg-white border border-slate-200'
            }`}
          >
            <Text
              className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Global State Section */}
        <View
          className={`p-5 rounded-2xl mb-6 border ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          } shadow-sm`}
        >
          <Text
            className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
          >
            Zustand Store State
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text
                className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}
              >
                Session Details:
              </Text>
              <Text
                className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mt-1`}
              >
                {user ? `Logged in: ${user.email}` : 'Signed out (unauthenticated)'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleMockUser}
              className="bg-indigo-600 px-4 py-2.5 rounded-xl active:opacity-80"
            >
              <Text className="text-white text-xs font-bold">
                {user ? 'Logout' : 'Simulate Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Query & API Connection Status Section */}
        <View
          className={`p-5 rounded-2xl mb-6 border ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          } shadow-sm`}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text
              className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              TanStack Query (Health Check)
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className={`px-3 py-1.5 rounded-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}
            >
              <Text className="text-indigo-500 text-xs font-bold">Refetch</Text>
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#6366f1" />
              <Text className="text-slate-500 text-xs mt-3">Connecting to backend APIs...</Text>
            </View>
          )}

          {error && (
            <View className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <Text className="text-rose-500 text-sm font-bold">API Connection Failure</Text>
              <Text
                className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Verify that you spun up the local services by running:
              </Text>
              <Text className="text-xs font-mono bg-slate-950 text-slate-300 p-2 rounded-lg mt-2 overflow-hidden select-text">
                make up
              </Text>
            </View>
          )}

          {health && (
            <View className="gap-y-4">
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  API Gateway (/health)
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2.5 h-2.5 rounded-full mr-2 ${health.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                  <Text
                    className={`text-xs font-bold capitalize ${health.status === 'healthy' ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {health.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  PostgreSQL Connection
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2.5 h-2.5 rounded-full mr-2 ${health.database.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                  <Text
                    className={`text-xs font-bold capitalize ${health.database.status === 'healthy' ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {health.database.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  Redis Connection
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2.5 h-2.5 rounded-full mr-2 ${health.redis.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                  <Text
                    className={`text-xs font-bold capitalize ${health.redis.status === 'healthy' ? 'text-emerald-500' : 'text-rose-500'}`}
                  >
                    {health.redis.status}
                  </Text>
                </View>
              </View>

              <View
                className={`border-t pt-4 flex-row justify-between items-center ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}
              >
                <Text className="text-slate-500 text-xs">Runtime Environment</Text>
                <Text
                  className={`text-xs font-mono px-2.5 py-1 rounded-md ${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}
                >
                  {health.environment}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Info Footer */}
        <View className="items-center mt-6">
          <Text className="text-[10px] text-slate-500 text-center font-medium uppercase tracking-widest">
            PostPilot AI Foundation • GraphQL & WhatsApp Graph Ready
          </Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
