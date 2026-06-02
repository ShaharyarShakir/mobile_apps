import type { User } from '@/types';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

type UserItemProps = {
  user: User;
  isOnline: boolean;
  onPress: () => void;
};

function UserItem({ user, isOnline, onPress }: UserItemProps) {
  return (
    <Pressable className="flex-row items-center py-2.5 active:opacity-70" onPress={onPress}>
      <View className="relative">
        <Image source={{ uri: user.avatar }} style={{ width: 48, height: 48, borderRadius: 999 }} />
        {isOnline && (
          <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2px] border-surface bg-green-500" />
        )}
      </View>

      <View className="ml-3 flex-1 border-b border-surface-light pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="font-medium text-foreground" numberOfLines={1}>
            {user.name}
          </Text>
          {isOnline && <Text className="text-xs font-medium text-primary">Online</Text>}
        </View>
        <Text className="mt-0.5 text-xs text-subtle-foreground">{user.email}</Text>
      </View>
    </Pressable>
  );
}

export default UserItem;
