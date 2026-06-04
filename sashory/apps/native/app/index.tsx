import { useAuthSession } from '@/hooks/use-auth-session'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import OnboardingSplashContainer from '@/components/containers/onboarding-splash-container'
export default function Home() {
    const router = useRouter()
    const { data: session, isPending } = useAuthSession()
    useEffect(() => {
        if (!isPending && session?.data?.user) {
            const user = session.data.user
            //TODO:

        }
    }, [isPending, session, router])

    if (isPending) {
        return (
            <>
                <StatusBar style='auto' />
                <OnboardingSplashContainer />
            </>
        )
    }
    return (
        <View>
            <Text>Home Page</Text>
        </View>
    )
}
