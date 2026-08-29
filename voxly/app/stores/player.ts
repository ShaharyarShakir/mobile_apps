import { writable } from 'svelte/store';

export const currentAudioUri = writable<string | null>(null);
export const isPlaying = writable<boolean>(false);
export const playbackPosition = writable<number>(0);
export const playbackDuration = writable<number>(0);
export const playbackSpeed = writable<number>(1.0);

const AVAILABLE_SPEEDS = [1.0, 1.5, 2.0];

/**
 * Cycles playback speed between 1.0x, 1.5x, and 2.0x.
 */
export function cyclePlaybackSpeed(): number {
  let nextSpeed = 1.0;
  playbackSpeed.update((current) => {
    const currentIndex = AVAILABLE_SPEEDS.indexOf(current);
    const nextIndex = (currentIndex + 1) % AVAILABLE_SPEEDS.length;
    nextSpeed = AVAILABLE_SPEEDS[nextIndex];
    return nextSpeed;
  });
  return nextSpeed;
}

/**
 * Resets all player stores to their initial default values.
 */
export function resetPlaybackState(): void {
  currentAudioUri.set(null);
  isPlaying.set(false);
  playbackPosition.set(0);
  playbackDuration.set(0);
  playbackSpeed.set(1.0);
}



