import { useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
function Header() {
  const router = useRouter();

  return (
    <View className="px-5 pb-4 pt-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Chats</Text>
        <Pressable
          className="size-10 items-center justify-center rounded-full bg-primary"
          onPress={() => router.push('/new-chat')}>
          <Ionicons name="create-outline" size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  );
}

export default Header;
