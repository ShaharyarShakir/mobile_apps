import { Utils, Application, File } from '@nativescript/core';
import { AudioDriver } from './types';
import { deleteRecordingFile, uriToFilePath } from './storage';

export class AndroidAudioDriver implements AudioDriver {
  private recorder: any = null; // android.media.MediaRecorder
  private currentFilePath: string | null = null;
  private recordingStartTime: number = 0;
  private _isRecording: boolean = false;

  public isRecording(): boolean {
    return this._isRecording;
  }

  public async start(outputPath: string): Promise<void> {
    if (this._isRecording) {
      throw new Error('Android recorder is already active.');
    }

    try {
      const cleanPath = uriToFilePath(outputPath);
      const context = Utils.android.getApplicationContext() || Application.android?.context;

      if (typeof android === 'undefined') {
        throw new Error('Android native environment not available.');
      }

      // Ensure directory exists on physical disk before recorder writes
      try {
        const javaFile = new java.io.File(cleanPath);
        const parent = javaFile.getParentFile();
        if (parent != null && !parent.exists()) {
          parent.mkdirs();
        }
      } catch (dirErr) {
        console.warn('[AndroidAudioDriver] Directory creation check note:', dirErr);
      }

      // Initialize MediaRecorder according to Android API level
      if (android.os.Build.VERSION.SDK_INT >= 31 && context) {
        this.recorder = new android.media.MediaRecorder(context);
      } else {
        this.recorder = new android.media.MediaRecorder();
      }

      this.currentFilePath = cleanPath;

      // Configure MediaRecorder for AAC / MPEG-4 audio recording
      this.recorder.setAudioSource(android.media.MediaRecorder.AudioSource.MIC);
      this.recorder.setOutputFormat(android.media.MediaRecorder.OutputFormat.MPEG_4);
      this.recorder.setAudioEncoder(android.media.MediaRecorder.AudioEncoder.AAC);
      this.recorder.setAudioEncodingBitRate(128000);
      this.recorder.setAudioSamplingRate(44100);
      this.recorder.setOutputFile(cleanPath);

      this.recorder.prepare();
      this.recorder.start();

      this.recordingStartTime = Date.now();
      this._isRecording = true;
    } catch (err) {
      this.cleanup();
      throw new Error(`Failed to start Android audio recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public async stop(): Promise<{ duration: number; filePath: string }> {
    if (!this._isRecording || !this.recorder || !this.currentFilePath) {
      throw new Error('No active recording to stop.');
    }

    const filePath = this.currentFilePath;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000));

    try {
      try {
        this.recorder.stop();
      } catch (stopErr) {
        console.warn('[AndroidAudioDriver] Note on recorder.stop():', stopErr);
      }

      this.recorder.reset();
      this.recorder.release();
      this.recorder = null;
      this._isRecording = false;
      this.currentFilePath = null;

      // Extract accurate native duration from the saved audio file
      const nativeDuration = this.extractNativeDuration(filePath, elapsedSeconds);

      return {
        duration: nativeDuration,
        filePath
      };
    } catch (err) {
      this.cleanup();
      deleteRecordingFile(filePath);
      throw new Error(`Failed to stop Android audio recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public async cancel(): Promise<void> {
    const pathToDelete = this.currentFilePath;
    this.cleanup();

    if (pathToDelete) {
      deleteRecordingFile(pathToDelete);
    }
  }

  private cleanup(): void {
    if (this.recorder) {
      try {
        this.recorder.reset();
        this.recorder.release();
      } catch (err) {
        console.warn('[AndroidAudioDriver] Error during recorder cleanup', err);
      }
      this.recorder = null;
    }
    this._isRecording = false;
    this.currentFilePath = null;
    this.recordingStartTime = 0;
  }

  private extractNativeDuration(filePath: string, fallbackDuration: number): number {
    try {
      if (typeof android !== 'undefined' && android.media?.MediaMetadataRetriever) {
        const retriever = new android.media.MediaMetadataRetriever();
        retriever.setDataSource(filePath);
        const timeStr = retriever.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION);
        retriever.release();

        if (timeStr) {
          const durationMs = parseInt(timeStr, 10);
          if (!isNaN(durationMs) && durationMs > 0) {
            return Math.max(1, Math.round(durationMs / 1000));
          }
        }
      }
    } catch (err) {
      console.warn('[AndroidAudioDriver] Could not extract duration with MediaMetadataRetriever, using measured elapsed time', err);
    }
    return fallbackDuration;
  }
}

