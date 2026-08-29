import { writable } from 'svelte/store';
import { RecordingResult } from '../services/audio/types';

export const isRecording = writable<boolean>(false);
export const recordingDuration = writable<number>(0);
export const audioLevels = writable<number[]>([20, 35, 55, 40, 60, 30, 20]);
export const lastRecordingResult = writable<RecordingResult | null>(null);

let durationInterval: any = null;
let levelInterval: any = null;

/**
 * Starts the UI duration timer and live audio waveform animation.
 */
export function startDurationTimer(): void {
  stopDurationTimer();
  recordingDuration.set(0);
  durationInterval = setInterval(() => {
    recordingDuration.update((n) => n + 1);
  }, 1000);

  levelInterval = setInterval(() => {
    audioLevels.set([
      14 + Math.floor(Math.random() * 32),
      22 + Math.floor(Math.random() * 36),
      34 + Math.floor(Math.random() * 26),
      26 + Math.floor(Math.random() * 34),
      36 + Math.floor(Math.random() * 24),
      20 + Math.floor(Math.random() * 38),
      14 + Math.floor(Math.random() * 28)
    ]);
  }, 120);
}

/**
 * Stops the UI duration timer and waveform animation.
 */
export function stopDurationTimer(): void {
  if (durationInterval) {
    clearInterval(durationInterval);
    durationInterval = null;
  }
  if (levelInterval) {
    clearInterval(levelInterval);
    levelInterval = null;
  }
  audioLevels.set([12, 22, 36, 48, 38, 26, 14]);
}

/**
 * Resets recording state and timers.
 */
export function resetRecordingState(): void {
  stopDurationTimer();
  isRecording.set(false);
  recordingDuration.set(0);
}


