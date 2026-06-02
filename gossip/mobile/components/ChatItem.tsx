import { Chat } from '@/types';
import { Image } from 'expo-image';
import { View, Text, Pressable } from 'react-native';
// import { formatDistanceToNow } from "date-fns";
// import { useSocketStore } from "@/lib/socket";

const ChatItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  const participant = chat.participant;

  //   const { onlineUsers, typingUsers, unreadChats } = useSocketStore();

  //   const isOnline = onlineUsers.has(participant._id);
  //   const isTyping = typingUsers.get(chat._id) === participant._id;
  //   const hasUnread = unreadChats.has(chat._id);
  const isOnline = false;
  const isTyping = false;
  const hasUnread = false;
  return (
    <Pressable className="flex-row items-center py-3 active:opacity-70" onPress={onPress}>
      {/* avatar & online indicator */}
      <View className="relative">
        <Image source={participant.avatar} style={{ width: 56, height: 56, borderRadius: 999 }} />
        {isOnline && (
          <View className="absolute bottom-0 right-0 size-4 rounded-full border-[3px] border-surface bg-green-500" />
        )}
      </View>

      {/* chat info */}
      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base font-medium ${hasUnread ? 'text-primary' : 'text-foreground'}`}>
            {participant.name}
          </Text>

          <View className="flex-row items-center gap-2">
            {hasUnread && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
            <Text className="text-xs text-subtle-foreground">
              {/* {chat.lastMessageAt
                                ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })
                                : ""} */}
            </Text>
          </View>
        </View>

        <View className="mt-1 flex-row items-center justify-between">
          {isTyping ? (
            <Text className="text-sm italic text-primary">typing...</Text>
          ) : (
            <Text
              className={`mr-3 flex-1 text-sm ${hasUnread ? 'font-medium text-foreground' : 'text-subtle-foreground'}`}
              numberOfLines={1}>
              {chat.lastMessage?.text || 'No messages yet'}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
export default ChatItem;
