import migrations from '@/drizzle/migrations'
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { Stack } from "expo-router"
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite'
import { Suspense } from 'react'
import { ActivityIndicator } from 'react-native'
import { KeyboardProvider } from "react-native-keyboard-controller"
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

const DATABSE_NAME = "pocket"
const Layout = () => {
    const { isSignedIn } = useAuth()
    // const db = openDatabaseSync(DATABSE_NAME)

    return <Stack>
        <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="(tabs)" options={{
            headerShown: false
        }} />
    </Stack>
}
const RootLayout = () => {
    const expoDb = openDatabaseSync(DATABSE_NAME)
    // console.log('migrations =', migrations);
    const db = drizzle(expoDb)
    useDrizzleStudio(expoDb)
    const { success, error } = useMigrations(db, migrations)
    // console.log('🚀 ~ RootLayout ~ error:', error);
    // console.log('🚀 ~ RootLayout ~ success:', success);
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <KeyboardProvider>
                <Suspense fallback={<ActivityIndicator />} >
                    <SQLiteProvider databaseName={DATABSE_NAME} options={{ enableChangeListener: true }}>
                        <Layout />
                    </SQLiteProvider>
                </Suspense>

            </KeyboardProvider>
        </ClerkProvider>
    )
}
export default RootLayout