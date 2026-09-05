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
      <Stack.Screen
        name="project/create"
        options={{
          title: "Create project",
        }}
      />
      <Stack.Screen
        name="project/[id]"
        options={{
          title: "Project",
        }}
      />
      <Stack.Screen
        name="project/[id]/edit"
        options={{
          title: "Edit project",
        }}
      />
      <Stack.Screen
        name="accounts"
        options={{
          title: "Accounts",
        }}
      />
      <Stack.Screen
        name="account/create"
        options={{
          title: "New account",
        }}
      />
      <Stack.Screen
        name="account/[id]"
        options={{
          title: "Account",
        }}
      />
      <Stack.Screen
        name="account/[id]/edit"
        options={{
          title: "Edit account",
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: "Categories",
        }}
      />
      <Stack.Screen
        name="category/create"
        options={{
          title: "New category",
        }}
      />
      <Stack.Screen
        name="category/[id]"
        options={{
          title: "Category",
        }}
      />
      <Stack.Screen
        name="category/[id]/edit"
        options={{
          title: "Edit category",
        }}
      />
    </Stack>
  );
}


