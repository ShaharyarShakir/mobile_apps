import { useAuthSession } from "@/hooks/use-auth-session";
import { Redirect } from "expo-router";
import OnboardingSplashContainer from "@/components/containers/onboarding-splash-container";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  const { data: session, isPending } = useAuthSession();

  if (isPending) {
    return (
      <>
        <StatusBar style="auto" />
        <OnboardingSplashContainer />
      </>
    );
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(app)/home" />;
}

