import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-surface">
      <Text className='text-foreground'>Chat Detail Screen</Text>
    </SafeAreaView>
  );
}
