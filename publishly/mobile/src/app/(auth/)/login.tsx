import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordField from '@/components/ui/PasswordField';
import ErrorBanner from '@/components/ui/ErrorBanner';

// Login validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      // API returns TokenResponse directly (contains access_token, refresh_token, and user)
      const { access_token, refresh_token, user } = response.data;

      // Save credentials in Zustand & SecureStore
      await setAuth(access_token, refresh_token, user);

      // Navigate to Home
      router.replace('/');
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Authentication failed. Please check your credentials and try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <SafeAreaView className="p-6 flex-1 justify-center min-h-screen">
        {/* Title and Intro */}
        <View className="mb-10 items-center">
          <Text className="text-4xl font-extrabold tracking-tight text-indigo-500 mb-2">
            PostPilot AI
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            Sign in to pilot your social campaigns and AI workflows.
          </Text>
        </View>

        {/* Error Banner */}
        <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />

        {/* Form Inputs */}
        <View className="mb-6">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email Address"
                placeholder="pilot@postpilot.ai"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordField
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            activeOpacity={0.7}
            className="align-self-end mt-1 mb-4"
          >
            <Text className="text-indigo-400 text-sm font-semibold text-right">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="gap-y-4">
          <Button label="Sign In" onPress={handleSubmit(onSubmit)} isLoading={isLoading} />

          {/* Registration Link */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-slate-400 text-sm mr-1.5">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-indigo-400 text-sm font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
