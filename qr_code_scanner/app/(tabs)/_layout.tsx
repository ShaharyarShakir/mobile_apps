import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
export default function TabLayout() {
    return <Tabs screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray"
    }} >

        <Tabs.Screen name='index' options={{
            tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="qrcode-scan" size={24} color={color} />
            )
        }} />
        <Tabs.Screen name='generator' options={{
            tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name='qrcode-plus' size={24} color={color} />
            )
        }} />
    </Tabs>
}

const styles = StyleSheet.create({})