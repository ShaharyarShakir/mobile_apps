import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";

const useSocialAuth = () => {
    const [loadingStrategy, setLoadingStrategy] = useState<string | null>();
    const { startSSOFlow } = useSSO();
    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple" | "oauth_github") => {
        if (loadingStrategy) return;

        setLoadingStrategy(strategy);
        try {
            const { createdSessionId, setActive } = await startSSOFlow({ strategy });
            if (!createdSessionId || !setActive) {
                const provider =
                    strategy === "oauth_google" ? "Google" : strategy === "oauth_apple" ? "Apple" : "Github";
                Alert.alert(
                    "Sign-in incomplete",
                    `${provider} sign-in did not complete successfully, please try again.`,
                );
                return;
            }
            await setActive({ session: createdSessionId });
        } catch (error) {
            console.log("🔥 Error in social auth", error);
            const provider =
                strategy === "oauth_google" ? "Google" : strategy === "oauth_apple" ? "Apple" : "Github";
            Alert.alert(
                "Sign-in incomplete",
                `${provider} sign-in did not complete successfully, please try again.`,
            );
        } finally {
            setLoadingStrategy(null);
        }
    };
    return { handleSocialAuth, loadingStrategy };
};

export default useSocialAuth;
