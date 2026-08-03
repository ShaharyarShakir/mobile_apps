import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';

import { apiClient } from '@/api/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordField from '@/components/ui/PasswordField';
import ErrorBanner from '@/components/ui/ErrorBanner';

// Schemas
const requestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

const confirmSchema = z.object({
  token: z.string().min(1, 'Reset Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RequestFormValues = z.infer<typeof requestSchema>;
type ConfirmFormValues = z.infer<typeof confirmSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forms
  const requestForm = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  });

  const confirmForm = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { token: '', password: '' },
  });

  const onRequestSubmit = async (data: RequestFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiClient.post('/auth/password-reset-request', { email: data.email });
      setSuccessMsg(
        'If the email exists, a reset token has been generated. Check console logs for mock email.',
      );
      setStep('confirm');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const onConfirmSubmit = async (data: ConfirmFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiClient.post('/auth/password-reset-confirm', {
        token: data.token,
        new_password: data.password,
      });
      setSuccessMsg('Your password has been successfully reset.');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <SafeAreaView className="p-6 flex-1 justify-center min-h-screen">
        {/* Title */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-extrabold tracking-tight text-indigo-500 mb-2">
            Reset Password
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            {step === 'request'
              ? 'Enter your email address to receive a mock reset token.'
              : 'Enter the reset token and your new password below.'}
          </Text>
        </View>

        {/* Status Alerts */}
        <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />
        {successMsg ? (
          <View className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4">
            <Text className="text-emerald-500 text-sm font-semibold">{successMsg}</Text>
          </View>
        ) : null}

        {/* Step 1: Request Token */}
        {step === 'request' ? (
          <View className="mb-6">
            <Controller
              control={requestForm.control}
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
                  error={requestForm.formState.errors.email?.message}
                />
              )}
            />
            <Button
              label="Send Reset Code"
              onPress={requestForm.handleSubmit(onRequestSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>
        ) : (
          /* Step 2: Confirm Reset */
          <View className="mb-6">
            <Controller
              control={confirmForm.control}
              name="token"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Reset Token"
                  placeholder="Paste token here"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={confirmForm.formState.errors.token?.message}
                />
              )}
            />

            <Controller
              control={confirmForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordField
                  label="New Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={confirmForm.formState.errors.password?.message}
                />
              )}
            />

            <Button
              label="Reset Password"
              onPress={confirmForm.handleSubmit(onConfirmSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>
        )}

        {/* Footer Navigation */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-slate-400 text-sm mr-1.5">Remembered your password?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-indigo-400 text-sm font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
