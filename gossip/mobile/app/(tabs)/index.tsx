import { ActivityIndicator, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { useChats } from '@/hooks/useChats';
import { useRouter } from 'expo-router';
import Header from '@/components/common/Header';
import ChatItem from '@/components/ChatItem';
import EmptyUI from '@/components/EmptyUi';
import { Chat } from '@/types';
export default function Index() {
  const router = useRouter();
  const { data: chats, isLoading, error } = useChats();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size={'large'} color="#f4A261" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-red-200">An error occurred while fetching chats.</Text>
      </View>
    );
  }
  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: chat._id,
        participantId: chat.participant._id,
        name: chat.participant.name,
        avatar: chat.participant.avatar,
      },
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatItem chat={item} onPress={() => handleChatPress(item)} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <EmptyUI
            title="No chats yet"
            subtitle="Start a conversation!"
            iconName="chatbubbles-outline"
            iconColor="#6B6B70"
            iconSize={64}
            buttonLabel="New Chat"
            onPressButton={() => router.push('/new-chat')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({});
