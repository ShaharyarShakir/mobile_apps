import { Chat } from "@/types";
import { Image } from "expo-image";
import { View, Text, Pressable } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { useSocketStore } from "@/ib/socket";


const ChatItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  const participant = chat.participant;

  const { onlineUsers, typingUsers, unreadChats } = useSocketStore();

  const isOnline = onlineUsers.has(participant._id);
  const isTyping = typingUsers.get(chat._id) === participant._id;
  const hasUnread = unreadChats.has(chat._id);

  return (
    <Pressable className="flex-row items-center active:opacity-70 py-3" onPress={onPress}>
      {/* avatar & online indicator */}
      <View className="relative">
        <Image source={participant.avatar} style={{ width: 56, height: 56, borderRadius: 999 }} />
        {isOnline && (
          <View className="right-0 bottom-0 absolute bg-green-500 border-[3px] border-surface rounded-full size-4" />
        )}
      </View>

      {/* chat info */}
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-center">
          <Text
            className={`text-base font-medium ${hasUnread ? "text-primary" : "text-foreground"}`}
          >
            {participant.name}
          </Text>

          <View className="flex-row items-center gap-2">
            {hasUnread && <View className="bg-primary rounded-full w-2.5 h-2.5" />}
            <Text className="text-subtle-foreground text-xs">
              {chat.lastMessageAt
                ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })
                : ""}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-1">
          {isTyping ? (
            <Text className="text-primary text-sm italic">typing...</Text>
          ) : (
            <Text
              className={`text-sm flex-1 mr-3 ${hasUnread ? "text-foreground font-medium" : "text-subtle-foreground"}`}
              numberOfLines={1}
            >
              {chat.lastMessage?.text || "No messages yet"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
export default ChatItem;