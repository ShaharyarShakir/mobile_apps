import { expoClient } from "@better-auth/expo/client";
import { env } from "@sashory/env/native";
import type { auth } from "@sashory/auth";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { inferAdditionalFields } from "better-auth/client/plugins";

const rawScheme = Constants.expoConfig?.scheme;
const scheme = Array.isArray(rawScheme) ? rawScheme[0] : rawScheme;

if (!scheme) {
  throw new Error(
    "Expo scheme is missing. Add `scheme: 'sashory'` to the Expo configuration.",
  );
}

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme,
      storagePrefix: scheme,
      storage: SecureStore,
    }),
    inferAdditionalFields<typeof auth>(),
  ],
});

