import SignIn from "@/components/sign-in";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center px-4">
      <SignIn />
    </SafeAreaView>
  );
}

