import * as Haptics from "expo-haptics";
import { settingsStore } from "./settingsStore";

/**
 * Trigger subtle haptics only when enabled by the user in settings.
 */
export async function triggerHaptic(
  type: "selection" | "success" | "warning" | "light" = "light"
): Promise<void> {
  try {
    const enabled = await settingsStore.getHapticsEnabled();
    if (!enabled) return;

    switch (type) {
      case "selection":
        await Haptics.selectionAsync();
        break;
      case "success":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "light":
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
  } catch {
    // Non-critical, ignore if device has no haptic motor
  }
}
