import { useThemeColor } from 'heroui-native'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Logo } from '../ui/logo'

export default function OnboardingSplashContainer() {
    const insets = useSafeAreaInsets()
    const backgroundColor = useThemeColor('accent')
    const foregroundColor = useThemeColor('foreground')
    return (
        <View style={{
            flex: 1,
            backgroundColor,
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 28,
            paddingHorizontal: 24
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 26,
                paddingBottom: 140
            }}>
                <Logo size={1.25} color={foregroundColor} />
                <ActivityIndicator size={'large'} color={foregroundColor} />
            </View>

        </View>
    )
}
