import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthRouteLayout() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <Redirect href={"/"} />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
