import { File } from '@nativescript/core';
import { AudioPlayerDriver, PlayerDriverCallbacks } from './types';
import { uriToFilePath } from './storage';

export class AndroidAudioPlayerDriver implements AudioPlayerDriver {
  private player: any = null; // android.media.MediaPlayer
  private callbacks: PlayerDriverCallbacks = {};
  private progressTimer: any = null;
  private _isLoaded: boolean = false;
  private _isPlaying: boolean = false;
  private durationMs: number = 0;

  public isPlaying(): boolean {
    return this._isPlaying;
  }

  public getCurrentPosition(): number {
    if (!this.player || !this._isLoaded) return 0;
    try {
      return this.player.getCurrentPosition();
    } catch (e) {
      return 0;
    }
  }

  public getDuration(): number {
    return this.durationMs;
  }

  public async load(filePathOrUri: string, callbacks: PlayerDriverCallbacks): Promise<{ duration: number }> {
    this.callbacks = callbacks;
    const cleanPath = uriToFilePath(filePathOrUri);

    if (!File.exists(cleanPath)) {
      throw new Error('Recording unavailable: This audio file could not be found.');
    }

    if (typeof android === 'undefined') {
      throw new Error('Android native audio environment is not available.');
    }

    try {
      await this.unload();

      this.player = new android.media.MediaPlayer();

      if (android.os.Build.VERSION.SDK_INT >= 21) {
        const attributes = new android.media.AudioAttributes.Builder()
          .setUsage(android.media.AudioAttributes.USAGE_MEDIA)
          .setContentType(android.media.AudioAttributes.CONTENT_TYPE_MUSIC)
          .build();
        this.player.setAudioAttributes(attributes);
      } else {
        this.player.setAudioStreamType(android.media.AudioManager.STREAM_MUSIC);
      }



      this.player.setDataSource(cleanPath);
      this.player.prepare();

      this.durationMs = this.player.getDuration();
      if (this.durationMs < 0) {
        this.durationMs = 0;
      }
      this._isLoaded = true;

      // Register completion listener
      this.player.setOnCompletionListener(
        new android.media.MediaPlayer.OnCompletionListener({
          onCompletion: (mp: any) => {
            this.stopProgressTimer();
            this._isPlaying = false;
            if (this.callbacks.onComplete) {
              this.callbacks.onComplete();
            }
          }
        })
      );

      // Register error listener
      this.player.setOnErrorListener(
        new android.media.MediaPlayer.OnErrorListener({
          onError: (mp: any, what: number, extra: number) => {
            this.stopProgressTimer();
            this._isPlaying = false;
            console.error(`[AndroidAudioPlayer] Error: what=${what}, extra=${extra}`);
            if (this.callbacks.onError) {
              this.callbacks.onError(new Error(`Unable to play recording (Code: ${what}, ${extra}).`));
            }
            return true;
          }
        })
      );

      return { duration: this.durationMs };
    } catch (err) {
      await this.unload();
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Unable to load recording: ${message}`);
    }
  }

  public async play(): Promise<void> {
    if (!this.player || !this._isLoaded) {
      throw new Error('No audio file loaded to play.');
    }

    try {
      // If playback reached the end, reset to beginning before restarting
      const currentPos = this.player.getCurrentPosition();
      if (this.durationMs > 0 && currentPos >= this.durationMs - 50) {
        await this.seekTo(0);
      }

      this.player.start();
      this._isPlaying = true;
      this.startProgressTimer();
    } catch (err) {
      this._isPlaying = false;
      this.stopProgressTimer();
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to play audio: ${message}`);
    }
  }

  public async pause(): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      if (this.player.isPlaying()) {
        this.player.pause();
      }
    } catch (err) {
      console.warn('[AndroidAudioPlayer] Warning pausing playback:', err);
    } finally {
      this._isPlaying = false;
      this.stopProgressTimer();
    }
  }

  public async stop(): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      if (this.player.isPlaying()) {
        this.player.pause();
      }
      this.player.seekTo(0);
    } catch (err) {
      console.warn('[AndroidAudioPlayer] Warning stopping playback:', err);
    } finally {
      this._isPlaying = false;
      this.stopProgressTimer();
    }
  }

  public async seekTo(positionMs: number): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      const clamped = Math.max(0, Math.min(positionMs, this.durationMs));
      if (android.os.Build.VERSION.SDK_INT >= 26) {
        this.player.seekTo(clamped, android.media.MediaPlayer.SEEK_CLOSEST);
      } else {
        this.player.seekTo(clamped);
      }

      if (this.callbacks.onProgress) {
        this.callbacks.onProgress(clamped, this.durationMs);
      }
    } catch (err) {
      console.warn('[AndroidAudioPlayer] Seek error:', err);
    }
  }

  public async setSpeed(speed: number): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      if (typeof android !== 'undefined' && android.os.Build.VERSION.SDK_INT >= 23) {
        const params = new android.media.PlaybackParams();
        params.setSpeed(speed);
        params.setPitch(1.0);
        this.player.setPlaybackParams(params);
      }
    } catch (err) {
      console.warn('[AndroidAudioPlayer] Error setting playback speed:', err);
    }
  }



  public async unload(): Promise<void> {
    this.stopProgressTimer();
    this._isPlaying = false;
    this._isLoaded = false;
    this.durationMs = 0;

    if (this.player) {
      try {
        this.player.reset();
        this.player.release();
      } catch (err) {
        console.warn('[AndroidAudioPlayer] Error releasing MediaPlayer:', err);
      }
      this.player = null;
    }
  }

  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (this.player && this._isPlaying) {
        try {
          const currentPos = this.player.getCurrentPosition();
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(currentPos, this.durationMs);
          }
        } catch (e) {
          // Player may be transitioning states
        }
      }
    }, 50);
  }

  private stopProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }
}

