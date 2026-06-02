import { Pressable, ScrollView, Text, View } from 'react-native';
import React from 'react';
import { useAuth, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MENU_SECTIONS } from '@/ib/profileData';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  return (
    <ScrollView
      className="bg-surface-dark"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View className="relative">
        <View className="mt-10 items-center">
          <View className="relative">
            <View className="rounded-full border-2 border-primary">
              <Image
                source={user?.imageUrl}
                style={{ width: 100, height: 100, borderRadius: 9999 }}
              />
            </View>
            <Pressable className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-surface-dark bg-primary">
              <Ionicons name="camera" size={16} color={'#0D0D0F'} />
            </Pressable>
          </View>
          {/* NAME & EMAIL */}
          <Text className="mt-4 text-2xl font-bold text-foreground">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="mt-1 text-muted-foreground">
            {user?.emailAddresses[0]?.emailAddress}
          </Text>
          <View className="mt-3 flex-row items-center rounded-full bg-green-500/20 px-3 py-1.5">
            <View className="mr-2 h-2 w-2 rounded-full bg-green-500" />
            <Text className="text-sm font-medium text-green-200">Online</Text>
          </View>
        </View>
      </View>
      {/* MENU SECTIONS */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} className="mx-3 mt-6">
          <Text className="mb-2 ml-1 text-xs font-semibold uppercase tracking-wider text-subtle-foreground">
            {section.title}
          </Text>
          <View className="overflow-hidden rounded-2xl bg-surface-card">
            {section.items.map((item, index) => (
              <Pressable
                key={item.label}
                className={`flex-row items-center px-4 py-3.5 active:bg-surface-light ${
                  index < section.items.length - 1 ? 'border-b border-surface-light' : ''
                }`}>
                <View
                  className="h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.color}20` }}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text className="ml-3 flex-1 font-medium text-foreground">{item.label}</Text>
                {item.value && (
                  <Text className="mr-1 text-sm text-subtle-foreground">{item.value}</Text>
                )}
                <Ionicons name="chevron-forward" size={18} color="#6B6B70" />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      {/* Logout Button */}
      <Pressable
        className="mx-5 mt-8 items-center rounded-2xl border border-red-500/20 bg-red-500/10 py-4 active:opacity-80"
        onPress={() => signOut()}>
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="ml-2 font-semibold text-red-500">Log Out</Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}
