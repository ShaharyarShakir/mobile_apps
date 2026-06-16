import HeroAuth from "@/components/HeroAuth";
import HeroSection from "@/components/HeroSection";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const Login = () => {
  return (
    <View className="flex-1 bg-background">
      {/* gradient background */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={["#0F0E17", "#1A1A2E", "#2D1B69", "#1A1A2E", "#0F0E17"]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ width: "100%", height: "100%" }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />

      </View>
      <SafeAreaView className="flex-1 justify-between">
        <HeroSection />
        <HeroAuth />
      </SafeAreaView>

    </View>
  );
};

export default Login;
