import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Logo } from '../ui/logo'

export default function OnboardingSplashContainer() {
    const insets = useSafeAreaInsets()
    return (
        <View
            className="flex-1 bg-accent items-center justify-center px-6"
            style={{
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }}
        >
            <View className="items-center gap-6">
                <Logo size={1.25} color="#FFFFFF" />
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        </View>
    )
}
