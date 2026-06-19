import useSocialAuth from '@/hooks/useSocialAuth'
import { Ionicons } from "@expo/vector-icons"
import { Image } from 'expo-image'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
const HeroAuth = () => {
    const { handleSocialAuth, loadingStrategy } = useSocialAuth()
    const isLoading = loadingStrategy !== null
    return (
        <View className="px-8 pb-4">
            <View className="flex-row items-center gap-3 mb-6">
                <View className="flex-1 bg-border h-px" />
                <Text className="font-medium text-foreground-subtle text-xs uppercase tracking-widest">
                    Continue with
                </Text>
                <View className="flex-1 bg-border h-px" />
            </View>

            <View className="flex-row justify-center items-center gap-4 mb-5">
                {/* GOOGLE btn */}
                <Pressable
                    className="justify-center items-center bg-white shadow-lg shadow-white/10 rounded-2xl size-20 active:scale-95"
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Google"
                    onPress={() => !isLoading && handleSocialAuth("oauth_google")}
                >
                    {loadingStrategy === "oauth_google" ? (
                        <ActivityIndicator size={"small"} color={"#6C5CE7"} />
                    ) : (
                        <Image
                            source={require("../../assets/images/google.png")}
                            style={{ width: 28, height: 28 }}
                            contentFit="contain"
                        />
                    )}
                </Pressable>

                {/* APPLE btn */}
                <Pressable
                    className="justify-center items-center bg-surface border border-border-light rounded-2xl size-20 active:scale-95"
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Apple"
                    onPress={() => !isLoading && handleSocialAuth("oauth_apple")}
                >
                    {loadingStrategy === "oauth_apple" ? (
                        <ActivityIndicator size="small" color="#6C5CE7" />
                    ) : (
                        <Ionicons name="logo-apple" size={30} color="#FFFFFE" />
                    )}
                </Pressable>

                {/* GITHUB btn */}
                <Pressable
                    className="justify-center items-center bg-surface border border-border-light rounded-2xl size-20 active:scale-95"
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    disabled={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with GitHub"
                    onPress={() => !isLoading && handleSocialAuth("oauth_github")}
                >
                    {loadingStrategy === "oauth_github" ? (
                        <ActivityIndicator size="small" color="#6C5CE7" />
                    ) : (
                        <Ionicons name="logo-github" size={28} color="#FFFFFE" />
                    )}
                </Pressable>
            </View>

            <Text className="text-[11px] text-foreground-subtle text-center leading-4">
                By continuing, you agree to our{" "}
                <Text className="text-primary-light">Terms of Service</Text> and{" "}
                <Text className="text-primary-light">Privacy Policy</Text>
            </Text>
        </View>
    )
}


export default HeroAuth