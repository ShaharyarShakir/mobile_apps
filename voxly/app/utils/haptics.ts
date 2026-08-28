import { isAndroid, isIOS, Utils, Application } from '@nativescript/core';

/**
 * Trigger light tactile feedback when starting recording or tapping interactive controls.
 */
export function triggerRecordStartHaptic(): void {
  try {
    if (isAndroid) {
      const activity = Application.android?.foregroundActivity || Application.android?.startActivity;
      const view = activity?.getWindow()?.getDecorView();
      if (view && typeof android !== 'undefined') {
        // HapticFeedbackConstants.KEYBOARD_TAP = 3 or VIRTUAL_KEY = 1
        view.performHapticFeedback(android.view.HapticFeedbackConstants.KEYBOARD_TAP);
      }
    } else if (isIOS && typeof UIImpactFeedbackGenerator !== 'undefined') {
      const generator = UIImpactFeedbackGenerator.alloc().initWithStyle(UIImpactFeedbackStyle.Medium);
      generator.prepare();
      generator.impactOccurred();
    }
  } catch (e) {
    // Non-critical, ignore on devices without vibration hardware
  }
}

/**
 * Trigger medium tactile feedback when completing an audio recording.
 */
export function triggerRecordStopHaptic(): void {
  try {
    if (isAndroid) {
      const activity = Application.android?.foregroundActivity || Application.android?.startActivity;
      const view = activity?.getWindow()?.getDecorView();
      if (view && typeof android !== 'undefined') {
        // HapticFeedbackConstants.CONFIRM = 16 or LONG_PRESS = 0
        view.performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS);
      }
    } else if (isIOS && typeof UINotificationFeedbackGenerator !== 'undefined') {
      const generator = UINotificationFeedbackGenerator.new();
      generator.prepare();
      generator.notificationOccurred(UINotificationFeedbackType.Success);
    }
  } catch (e) {
    // Non-critical
  }
}

/**
 * Trigger selection feedback when tapping tags or chips.
 */
export function triggerTagSelectHaptic(): void {
  try {
    if (isAndroid) {
      const activity = Application.android?.foregroundActivity || Application.android?.startActivity;
      const view = activity?.getWindow()?.getDecorView();
      if (view && typeof android !== 'undefined') {
        view.performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK);
      }
    } else if (isIOS && typeof UISelectionFeedbackGenerator !== 'undefined') {
      const generator = UISelectionFeedbackGenerator.new();
      generator.prepare();
      generator.selectionChanged();
    }
  } catch (e) {
    // Non-critical
  }
}

