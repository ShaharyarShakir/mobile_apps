import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className = '' }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <View
      className={`w-full p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-4 flex-row justify-between items-center ${className}`}
    >
      <View className="flex-1 mr-2">
        <Text className="text-rose-500 text-sm font-semibold">{message}</Text>
      </View>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} className="px-2 py-1">
          <Text className="text-rose-400 text-xs font-bold uppercase tracking-wider">Dismiss</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default ErrorBanner;
