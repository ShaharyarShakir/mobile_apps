import { Dialogs } from '@nativescript/core';
import { openAppSettings } from '../services/audio/permissions';

/**
 * Displays a modal explaining why microphone permission is required,
 * with a quick action to open system app settings.
 */
export async function showPermissionDeniedDialog(): Promise<void> {
  const result = await Dialogs.confirm({
    title: 'Microphone access needed',
    message: 'Voxly needs microphone access to record your thoughts.',
    okButtonText: 'Open Settings',
    cancelButtonText: 'Cancel'
  });

  if (result) {
    openAppSettings();
  }
}

/**
 * Displays an alert when starting a recording fails.
 */
export async function showRecordingErrorAlert(errorMessage?: string): Promise<void> {
  await Dialogs.alert({
    title: 'Recording Error',
    message: errorMessage || "Couldn't start recording. Please try again.",
    okButtonText: 'OK'
  });
}

/**
 * Displays an alert when saving a recording fails.
 */
export async function showSaveErrorAlert(errorMessage?: string): Promise<void> {
  await Dialogs.alert({
    title: 'Save Error',
    message: errorMessage || "Couldn't save this recording. Try recording again.",
    okButtonText: 'OK'
  });
}

/**
 * Displays an alert when audio playback fails.
 */
export async function showPlaybackErrorAlert(errorMessage?: string): Promise<void> {
  await Dialogs.alert({
    title: 'Playback Error',
    message: errorMessage || 'Something went wrong while playing this recording.',
    okButtonText: 'OK'
  });
}

/**
 * Displays a dialog when an audio file cannot be located on disk,
 * offering the user to clean up the orphaned entry.
 */
export async function showMissingAudioFileDialog(): Promise<boolean> {
  return await Dialogs.confirm({
    title: 'Recording unavailable',
    message: 'The audio file could not be found.',
    okButtonText: 'Remove Entry',
    cancelButtonText: 'Cancel'
  });
}

/**
 * Prompts the user before discarding an active recording.
 */
export async function confirmDiscardRecording(): Promise<boolean> {
  const result = await Dialogs.confirm({
    title: 'Discard recording?',
    message: 'Your current recording will be lost.',
    okButtonText: 'Discard',
    cancelButtonText: 'Keep recording'
  });
  return result; // true = discard, false = keep recording
}

/**
 * Prompts the user to confirm permanently deleting a journal entry.
 */
export async function confirmDeleteEntry(): Promise<boolean> {
  return await Dialogs.confirm({
    title: 'Delete recording?',
    message: 'This voice snippet will be permanently removed.',
    okButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  });
}
