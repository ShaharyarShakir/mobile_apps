import { isAndroid, isIOS } from '@nativescript/core';
import { AudioPlayer, AudioPlayerDriver, PlaybackState } from './types';
import { AndroidAudioPlayerDriver } from './android-player';
import { IosAudioPlayerDriver } from './ios-player';
import { MockAudioPlayerDriver } from './mock-player';
import {
  currentAudioUri,
  isPlaying,
  playbackPosition,
  playbackDuration,
  resetPlaybackState
} from '../../stores/player';

export class NativeAudioPlayer implements AudioPlayer {
  private driver: AudioPlayerDriver;
  private currentUri: string | null = null;

  constructor() {
    if (isAndroid) {
      this.driver = new AndroidAudioPlayerDriver();
    } else if (isIOS) {
      this.driver = new IosAudioPlayerDriver();
    } else {
      this.driver = new MockAudioPlayerDriver();
    }
  }

  /**
   * Loads an audio file from URI or file path.
   * Automatically stops and unloads any previously playing audio to ensure single player active.
   * Does NOT auto-play on load.
   */
  public async load(uri: string): Promise<void> {
    if (!uri) {
      throw new Error('Invalid audio URI: uri cannot be empty.');
    }

    // Stop and clean up any currently loaded/playing audio
    if (this.currentUri) {
      await this.unload();
    }

    try {
      const result = await this.driver.load(uri, {
        onProgress: (positionMs, durationMs) => {
          playbackPosition.set(positionMs);
          playbackDuration.set(durationMs);
        },
        onComplete: () => {
          isPlaying.set(false);
          const duration = this.driver.getDuration();
          playbackPosition.set(duration);
          console.log(`[NativeAudioPlayer] Playback completed for: ${this.currentUri}`);
        },
        onError: (error) => {
          isPlaying.set(false);
          console.error('[NativeAudioPlayer] Native playback error:', error);
        }
      });

      this.currentUri = uri;
      currentAudioUri.set(uri);
      playbackPosition.set(0);
      playbackDuration.set(result.duration);
      isPlaying.set(false);

      console.log(`[NativeAudioPlayer] Audio loaded: ${uri} (duration: ${result.duration}ms)`);
    } catch (err) {
      await this.unload();
      throw err;
    }
  }

  /**
   * Starts or resumes playback.
   */
  public async play(): Promise<void> {
    if (!this.currentUri) {
      throw new Error('No audio file loaded. Please load an audio file first.');
    }

    try {
      await this.driver.play();
      isPlaying.set(true);
    } catch (err) {
      isPlaying.set(false);
      throw err;
    }
  }

  /**
   * Pauses active playback. Position is preserved.
   */
  public async pause(): Promise<void> {
    try {
      await this.driver.pause();
    } finally {
      isPlaying.set(false);
    }
  }

  /**
   * Stops playback and resets position to the beginning.
   */
  public async stop(): Promise<void> {
    try {
      await this.driver.stop();
    } finally {
      isPlaying.set(false);
      playbackPosition.set(0);
    }
  }

  /**
   * Seeks to a specific timestamp in milliseconds.
   */
  public async seekTo(positionMs: number): Promise<void> {
    const safePos = Math.max(0, Math.round(positionMs));
    await this.driver.seekTo(safePos);
    playbackPosition.set(safePos);
  }

  /**
   * Skips forward or backward by a delta in seconds (e.g. +10 or -10).
   */
  public async skip(seconds: number): Promise<void> {
    const currentPos = this.driver.getCurrentPosition();
    const duration = this.driver.getDuration();
    const targetPos = Math.max(0, Math.min(currentPos + seconds * 1000, duration > 0 ? duration : currentPos + 10000));
    await this.seekTo(targetPos);
  }

  /**
   * Adjusts playback speed rate (e.g. 0.8x, 1.0x, 1.5x, 2.0x).
   */
  public async setSpeed(speed: number): Promise<void> {
    if (this.driver.setSpeed) {
      await this.driver.setSpeed(speed);
    }
  }


  /**
   * Releases native player resources and resets Svelte stores.
   */
  public async unload(): Promise<void> {
    try {
      await this.driver.unload();
    } finally {
      this.currentUri = null;
      resetPlaybackState();
    }
  }

  /**
   * Returns current snapshot of playback state.
   */
  public getState(): PlaybackState {
    return {
      uri: this.currentUri,
      isPlaying: this.driver.isPlaying(),
      position: this.driver.getCurrentPosition(),
      duration: this.driver.getDuration()
    };
  }
}

/**
 * Singleton player instance.
 */
export const player = new NativeAudioPlayer();

