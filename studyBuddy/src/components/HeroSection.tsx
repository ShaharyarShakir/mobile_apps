import { Ionicons } from "@expo/vector-icons"
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
const HeroSection = () => {
    return (
        <>

            < View >
                <View className="items-center pt-10 pb-2">
                    <View className="justify-center items-center bg-primary/15 border border-primary/20 rounded-[20px] w-16 h-16">
                        <Ionicons name="school" size={30} color="#A29BFE" />
                    </View>

                    <Text className="mt-4 font-mono font-extrabold text-foreground text-3xl tracking-tight">
                        StudyBuddy
                    </Text>

                    <Text className="mt-1.5 text-[15px] text-foreground-muted tracking-wide">
                        Learn together, grow together
                    </Text>
                </View>

                <View className="items-center mt-4 px-6">
                    <Image
                        source={require("@/assets/images/auth.png")}
                        style={{ width: 320, height: 350 }}
                        contentFit="cover"
                    />
                </View>

                {/* feature chips */}
                <View className="flex-row flex-wrap justify-center gap-3 mt-5 px-6">
                    {[
                        {
                            icon: "videocam" as const,
                            label: "Video Calls",
                            color: "#A29BFE",
                            bg: "bg-primary/12 border-primary/20",
                        },
                        {
                            icon: "chatbubbles" as const,
                            label: "Study Rooms",
                            color: "#FF6B6B",
                            bg: "bg-accent/12 border-accent/20",
                        },
                        {
                            icon: "people" as const,
                            label: "Find Partners",
                            color: "#00B894",
                            bg: "bg-accent-secondary/12 border-accent-secondary/20",
                        },
                    ].map((chip) => (
                        <View
                            key={chip.label}
                            className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${chip.bg}`}
                        >
                            <Ionicons name={chip.icon} size={14} color={chip.color} />
                            <Text className="font-semibold text-foreground-muted text-xs tracking-wide">
                                {chip.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View >
        </>
    )
}


export default HeroSection