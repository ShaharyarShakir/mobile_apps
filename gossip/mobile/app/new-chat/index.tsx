import UserItem from "@/components/UserItem";
import { useGetOrCreateChat } from "@/hooks/useChats";
import { useUsers } from "@/hooks/useUsers";
// import { useSocketStore } from "@/lib/socket";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewChatScreen = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const { data: allUsers, isLoading } = useUsers();
    const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat();
    // const { onlineUsers } = useSocketStore();

    // client-side filtering
    const users = allUsers?.filter((u) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
    });

    const handleUserSelect = (user: User) => {
        getOrCreateChat(user._id, {
            onSuccess: (chat) => {
                router.dismiss(); // go -1

                setTimeout(() => {
                    router.push({
                        pathname: "/chat/[id]",
                        params: {
                            id: chat._id,
                            participantId: chat.participant._id,
                            name: chat.participant.name,
                            avatar: chat.participant.avatar,
                        },
                    });
                }, 100);
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-surface rounded-t-3xl h-[95%] overflow-hidden">
                    <View className="flex-row items-center bg-surface px-5 pt-3 pb-3 border-surface-light border-b">
                        <Pressable
                            className="justify-center items-center bg-surface-card mr-2 rounded-full w-9 h-9"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="close" size={20} color="#F4A261" />
                        </Pressable>

                        <View className="flex-1">
                            <Text className="font-semibold text-foreground text-xl">New chat</Text>
                            <Text className="mt-0.5 text-muted-foreground text-xs">
                                Search for a user to start chatting
                            </Text>
                        </View>
                    </View>

                    {/* SEARCH BAR */}
                    <View className="bg-surface px-5 pt-3 pb-2">
                        <View className="flex-row items-center gap-2 bg-surface-card px-3 py-1.5 border border-surface-light rounded-full">
                            <Ionicons name="search" size={18} color="#6B6B70" />
                            <TextInput
                                placeholder="Search users"
                                placeholderTextColor="#6B6B70"
                                className="flex-1 text-foreground text-sm"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* USERS LIST */}

                    <View className="flex-1 bg-surface">
                        {isCreatingChat || isLoading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#F4A261" />
                            </View>
                        ) : !users || users.length === 0 ? (
                            <View className="flex-1 justify-center items-center px-5">
                                <Ionicons name="person-outline" size={64} color="#6B6B70" />
                                <Text className="mt-4 text-muted-foreground text-lg">No users found</Text>
                                <Text className="mt-1 text-subtle-foreground text-sm text-center">
                                    Try a different search term
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1 px-5 pt-4"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 24 }}
                            >
                                <Text className="mb-3 text-muted-foreground text-xs">USERS</Text>
                                {users.map((user) => (
                                    <UserItem
                                        key={user._id}
                                        user={user}
                                        // isOnline={onlineUsers.has(user._id)}
                                        isOnline={true}
                                        onPress={() => handleUserSelect(user)}
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default NewChatScreen;