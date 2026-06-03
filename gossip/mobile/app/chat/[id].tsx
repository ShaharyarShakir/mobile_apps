import { useCurrentUser } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useSocketStore } from '@/ib/socket';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from "expo-image";
import EmptyUI from '@/components/EmptyUi';
import { MessageSender } from '@/types';
import MessageBubble from '@/components/MessageBubble';
type ChatParams = {
  id: string;
  participantId: string;
  name: string;
  avatar: string
}
export default function ChatDetailScreen() {
  const { id: chatId, participantId, name, avatar } = useLocalSearchParams<ChatParams>();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null)
  const { data: currentUser } = useCurrentUser()
  const { data: messages, isLoading } = useMessages(chatId)
  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, onlineUsers, typingUsers } = useSocketStore()
  const isOnline = participantId ? onlineUsers.has(participantId) : false;
  const isTyping = typingUsers.get(chatId) === participantId
  const typingTimeOutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // join chat room on mount 
  useEffect(() => {
    if (chatId && isConnected) joinChat(chatId)

    return () => {
      if (chatId) leaveChat(chatId)

    }
  }, [chatId, isConnected, joinChat, leaveChat])

  // scroll to bottom when new chat
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })

      }, 100)
    }
  }, [messages])


  const handleTyping = useCallback((text: string) => {
    setMessageText(text)
    if (!isConnected || !chatId) return

    // send typing start
    if (text.length > 0) {
      sendTyping(chatId, true)

      // clear existing timeout
      if (typingTimeOutRef.current) {
        clearTimeout(typingTimeOutRef.current)
      }
      typingTimeOutRef.current = setTimeout(() => {
        sendTyping(chatId, false)

      }, 200)

    } else {
      if (typingTimeOutRef.current) {
        clearTimeout(typingTimeOutRef.current)
      }
      sendTyping(chatId, false)
    }
  }, [isConnected, chatId, sendTyping])

  const handleSend = () => {
    console.log({ isSending, isConnected, currentUser, messageText });
    if (!messageText.trim() || isSending || !isConnected || !currentUser) return;

    // stop typing indicator
    if (typingTimeOutRef.current) {
      clearTimeout(typingTimeOutRef.current);
    }
    sendTyping(chatId, false);

    setIsSending(true);
    sendMessage(chatId, messageText.trim(), {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });
    setMessageText("");
    setIsSending(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>

      {/* Header */}
      <View className="flex-row items-center bg-surface px-4 py-2 border-surface-light border-b">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F4A261" />
        </Pressable>
        <View className="flex-row flex-1 items-center ml-2">
          {avatar && <Image source={avatar} style={{ width: 40, height: 40, borderRadius: 999 }} />}
          <View className="ml-3">
            <Text className="font-semibold text-foreground text-base" numberOfLines={1}>
              {name}
            </Text>
            <Text className={`text-xs ${isTyping ? "text-primary" : "text-muted-foreground"}`}>
              {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable className="justify-center items-center rounded-full w-9 h-9">
            <Ionicons name="call-outline" size={20} color="#A0A0A5" />
          </Pressable>
          <Pressable className="justify-center items-center rounded-full w-9 h-9">
            <Ionicons name="videocam-outline" size={20} color="#A0A0A5" />
          </Pressable>
        </View>
      </View>

      {/* Message + Keyboard input */}

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 bg-surface">
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#F4A261" />
            </View>
          ) : !messages || messages.length === 0 ? (
            <EmptyUI
              title="No messages yet"
              subtitle="Start the conversation!"
              iconName="chatbubbles-outline"
              iconColor="#6B6B70"
              iconSize={64}
            />
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
              onContentSizeChange={() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }}
            >
              {messages.map((message) => {
                const senderId = (message.sender as MessageSender)._id;
                const isFromMe = currentUser ? senderId === currentUser._id : false;

                return <MessageBubble key={message._id} message={message} isFromMe={isFromMe} />;
              })}
            </ScrollView>
          )}

          {/* Input bar */}
          <View className="bg-surface px-3 pt-2 pb-3 border-surface-light border-t">
            <View className="flex-row items-end gap-2 bg-surface-card px-3 py-1.5 rounded-3xl">
              <Pressable className="justify-center items-center rounded-full w-8 h-8">
                <Ionicons name="add" size={22} color="#F4A261" />
              </Pressable>

              <TextInput
                placeholder="Type a message"
                placeholderTextColor="#6B6B70"
                className="flex-1 mb-2 text-foreground text-sm"
                multiline
                style={{ maxHeight: 100 }}
                value={messageText}
                onChangeText={handleTyping}
                onSubmitEditing={handleSend}
                editable={!isSending}
              />

              <Pressable
                className="justify-center items-center bg-primary rounded-full w-8 h-8"
                onPress={handleSend}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#0D0D0F" />
                ) : (
                  <Ionicons name="send" size={18} color="#0D0D0F" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
