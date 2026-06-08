import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Stack } from "expo-router"
import { KeyboardProvider } from "react-native-keyboard-controller"
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
const Layout = () => {
    const { isSignedIn } = useAuth()
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
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <KeyboardProvider>
                <Layout />
            </KeyboardProvider>
        </ClerkProvider>
    )
}
export default RootLayout