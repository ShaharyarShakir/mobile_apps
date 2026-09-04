import { Redirect, Stack } from "expo-router";
import { useAuthSession } from "@/hooks/use-auth-session";

export default function AppLayout() {
  const { data: session, isPending } = useAuthSession();

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="projects"
        options={{
          title: "Projects",
        }}
      />
    </Stack>
  );
}

