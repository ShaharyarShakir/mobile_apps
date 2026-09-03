import SignUp from "@/components/sign-up";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center px-4">
      <SignUp />
    </SafeAreaView>
  );
}

