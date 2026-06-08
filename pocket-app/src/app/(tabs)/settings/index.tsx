import { useAuth, useUser } from "@clerk/expo"
import { Link } from "expo-router"
import { Button, ScrollView, Text, TouchableOpacity } from "react-native"

export default function Settings() {
    const { isSignedIn, signOut } = useAuth()
    const { user } = useUser()
    return (
        <ScrollView contentContainerStyle={{ flex: 1 }} contentInsetAdjustmentBehavior="automatic">
            <Text>Your account: {user?.emailAddresses[0].emailAddress} </Text>
            {isSignedIn && <Button title="Sign Out" onPress={() => signOut()} />}
            {!isSignedIn && <Link href={'/'} asChild>
                <TouchableOpacity>
                    <Text>Sign in or Sign up</Text>
                </TouchableOpacity>
            </Link>}
        </ScrollView>
    )
}


