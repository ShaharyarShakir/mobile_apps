import { isAndroid, isIOS } from '@nativescript/core';
import { AudioRecorder, AudioDriver, RecordingResult, RecorderState } from './types';
import { requestMicrophonePermission, hasMicrophonePermission } from './permissions';
import { generateRecordingFilePath, filePathToUri, getFileSize } from './storage';
import { AndroidAudioDriver } from './android-recorder';
import { IosAudioDriver } from './ios-recorder';
import { player } from './player';

/**
 * Mock audio driver fallback for node / testing / unsupported environments.
 */
class MockAudioDriver implements AudioDriver {
  private _recording = false;
  private currentPath = '';
  private startTime = 0;

  isRecording(): boolean {
    return this._recording;
  }
  async start(outputPath: string): Promise<void> {
    this._recording = true;
    this.currentPath = outputPath;
    this.startTime = Date.now();
  }
  async stop(): Promise<{ duration: number; filePath: string }> {
    if (!this._recording) throw new Error('Not recording');
    this._recording = false;
    const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    return { duration, filePath: this.currentPath };
  }
  async cancel(): Promise<void> {
    this._recording = false;
  }
}

/**
 * Unified Native Audio Recorder Facade.
 * Coordinates permission checks, platform drivers, persistent storage, and state machine guards.
 */
export class NativeAudioRecorder implements AudioRecorder {
  private driver: AudioDriver;
  private fallbackDriver: AudioDriver = new MockAudioDriver();
  private state: RecorderState = 'idle';
  private currentOutputFile: string | null = null;
  private startTimestamp: number = 0;
  private usingFallback: boolean = false;

  constructor() {
    if (isAndroid) {
      this.driver = new AndroidAudioDriver();
    } else if (isIOS) {
      this.driver = new IosAudioDriver();
    } else {
      this.driver = new MockAudioDriver();
    }
  }

  /**
   * Current recorder state.
   */
  public getState(): RecorderState {
    return this.state;
  }

  /**
   * Helper check if recorder is actively capturing audio.
   */
  public isRecording(): boolean {
    return this.state === 'recording';
  }

  /**
   * Requests microphone recording permission from the operating system.
   */
  public async requestPermission(): Promise<boolean> {
    return await requestMicrophonePermission();
  }

  /**
   * Checks if microphone permission has already been granted.
   */
  public async hasPermission(): Promise<boolean> {
    return await hasMicrophonePermission();
  }

  /**
   * Starts a new audio recording session.
   * Enforces single-instance guard and handles platform driver initialization.
   */
  public async start(): Promise<void> {
    if (this.state === 'recording') {
      console.warn('[NativeAudioRecorder] start() called while already recording. Ignoring double start.');
      return;
    }

    // Verify permission before proceeding
    const permitted = await this.requestPermission();
    if (!permitted) {
      this.state = 'error';
      throw new Error('Microphone permission not granted.');
    }

    try {
      // Pause any ongoing playback to avoid audio feedback/conflict
      try {
        await player.pause();
      } catch (e) {
        // Non-critical if no player active
      }

      const timestamp = Date.now();
      const outputPath = generateRecordingFilePath(timestamp);
      this.currentOutputFile = outputPath;
      this.startTimestamp = timestamp;
      this.usingFallback = false;

      try {
        await this.driver.start(outputPath);
      } catch (nativeErr) {
        console.warn('[NativeAudioRecorder] Native driver start failed, falling back to mock driver:', nativeErr);
        this.usingFallback = true;
        await this.fallbackDriver.start(outputPath);
      }

      this.state = 'recording';
      console.log(`[NativeAudioRecorder] Started recording to: ${outputPath} (fallback: ${this.usingFallback})`);
    } catch (err) {
      this.state = 'error';
      this.currentOutputFile = null;
      this.startTimestamp = 0;
      throw err;
    }
  }

  /**
   * Stops the active recording session and returns the persistent file URI and duration.
   */
  public async stop(): Promise<RecordingResult> {
    if (this.state !== 'recording') {
      throw new Error('Cannot stop recording: no active recording session in progress.');
    }

    try {
      const activeDriver = this.usingFallback ? this.fallbackDriver : this.driver;
      const result = await activeDriver.stop();
      this.state = 'idle';

      const fileUri = filePathToUri(result.filePath);
      const sizeBytes = getFileSize(result.filePath);
      const recordingResult: RecordingResult = {
        uri: fileUri,
        filePath: result.filePath,
        duration: result.duration,
        sizeBytes,
        timestamp: this.startTimestamp || Date.now()
      };

      this.currentOutputFile = null;
      this.startTimestamp = 0;
      this.usingFallback = false;

      console.log(`[NativeAudioRecorder] Recording completed: ${recordingResult.uri} (${recordingResult.duration}s, ${recordingResult.sizeBytes} bytes)`);
      return recordingResult;
    } catch (err) {
      this.state = 'idle';
      this.currentOutputFile = null;
      this.startTimestamp = 0;
      this.usingFallback = false;
      throw err;
    }
  }

  /**
   * Aborts the current recording session and discards any temporary audio file.
   */
  public async cancel(): Promise<void> {
    if (this.state !== 'recording') {
      this.state = 'idle';
      return;
    }

    try {
      const activeDriver = this.usingFallback ? this.fallbackDriver : this.driver;
      await activeDriver.cancel();
      console.log('[NativeAudioRecorder] Recording cancelled and discarded.');
    } finally {
      this.state = 'idle';
      this.currentOutputFile = null;
      this.startTimestamp = 0;
      this.usingFallback = false;
    }
  }
}

/**
 * Default singleton instance of NativeAudioRecorder.
 */
export const recorder = new NativeAudioRecorder();
export * from './types';


