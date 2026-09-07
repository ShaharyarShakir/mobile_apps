import { Alert } from "react-native";

export function showMutationError(
  error: unknown,
  fallback: string,
) {
  const message =
    error instanceof Error ? error.message : fallback;

  Alert.alert("Something went wrong", message);
}

