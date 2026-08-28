import { File } from '@nativescript/core';
import { AudioPlayerDriver, PlayerDriverCallbacks } from './types';
import { uriToFilePath } from './storage';

let IosAudioPlayerDelegateImpl: any = null;

function getDelegateClass() {
  if (!IosAudioPlayerDelegateImpl && typeof NSObject !== 'undefined') {
    @NativeClass()
    class DelegateImpl extends NSObject implements AVAudioPlayerDelegate {
      public static ObjCProtocols = typeof AVAudioPlayerDelegate !== 'undefined' ? [AVAudioPlayerDelegate] : [];
      private owner?: WeakRef<IosAudioPlayerDriver>;

      public static initWithOwner(owner: WeakRef<IosAudioPlayerDriver>): DelegateImpl {
        const delegate = <DelegateImpl>DelegateImpl.new();
        delegate.owner = owner;
        return delegate;
      }

      public audioPlayerDidFinishPlayingSuccessfully(player: any, flag: boolean): void {
        const owner = this.owner?.get();
        if (owner) {
          owner.handlePlaybackComplete(flag);
        }
      }

      public audioPlayerDecodeErrorDidOccurError(player: any, error: any): void {
        const owner = this.owner?.get();
        if (owner) {
          owner.handleDecodeError(error);
        }
      }
    }
    IosAudioPlayerDelegateImpl = DelegateImpl;
  }
  return IosAudioPlayerDelegateImpl;
}

export class IosAudioPlayerDriver implements AudioPlayerDriver {
  private player: any = null; // AVAudioPlayer
  private delegate: any = null;
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
      return Math.round(this.player.currentTime * 1000);
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

    if (typeof AVAudioSession === 'undefined' || typeof AVAudioPlayer === 'undefined') {
      throw new Error('iOS native audio environment is not available.');
    }

    try {
      await this.unload();

      const session = AVAudioSession.sharedInstance();
      session.setCategoryWithOptionsError(
        AVAudioSessionCategoryPlayback,
        AVAudioSessionCategoryOptions.DefaultToSpeaker | AVAudioSessionCategoryOptions.AllowBluetooth
      );
      session.setActiveError(true);

      const url = NSURL.fileURLWithPath(cleanPath);
      this.player = AVAudioPlayer.alloc().initWithContentsOfURLError(url);

      if (!this.player) {
        throw new Error('Unable to initialize AVAudioPlayer from file.');
      }

      const DelegateClass = getDelegateClass();
      if (DelegateClass) {
        this.delegate = DelegateClass.initWithOwner(new WeakRef(this));
        this.player.delegate = this.delegate;
      }

      const prepared = this.player.prepareToPlay();
      if (!prepared) {
        throw new Error('Failed to prepare audio player.');
      }

      this.durationMs = Math.round(this.player.duration * 1000);
      this._isLoaded = true;

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
      const currentPosMs = Math.round(this.player.currentTime * 1000);
      if (this.durationMs > 0 && currentPosMs >= this.durationMs - 50) {
        await this.seekTo(0);
      }

      const played = this.player.play();
      if (!played) {
        throw new Error('Audio player rejected play command.');
      }

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
      if (this.player.isPlaying) {
        this.player.pause();
      }
    } catch (err) {
      console.warn('[IosAudioPlayer] Warning pausing audio:', err);
    } finally {
      this._isPlaying = false;
      this.stopProgressTimer();
    }
  }

  public async stop(): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      this.player.stop();
      this.player.currentTime = 0;
    } catch (err) {
      console.warn('[IosAudioPlayer] Warning stopping audio:', err);
    } finally {
      this._isPlaying = false;
      this.stopProgressTimer();
    }
  }

  public async seekTo(positionMs: number): Promise<void> {
    if (!this.player || !this._isLoaded) return;

    try {
      const clamped = Math.max(0, Math.min(positionMs, this.durationMs));
      this.player.currentTime = clamped / 1000;

      if (this.callbacks.onProgress) {
        this.callbacks.onProgress(clamped, this.durationMs);
      }
    } catch (err) {
      console.warn('[IosAudioPlayer] Seek error:', err);
    }
  }

  public async unload(): Promise<void> {
    this.stopProgressTimer();
    this._isPlaying = false;
    this._isLoaded = false;
    this.durationMs = 0;

    if (this.player) {
      try {
        if (this.player.isPlaying) {
          this.player.stop();
        }
        this.player.delegate = null;
      } catch (err) {
        console.warn('[IosAudioPlayer] Error releasing AVAudioPlayer:', err);
      }
      this.player = null;
    }
    this.delegate = null;
  }

  public handlePlaybackComplete(success: boolean): void {
    this.stopProgressTimer();
    this._isPlaying = false;
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete();
    }
  }

  public handleDecodeError(error: any): void {
    this.stopProgressTimer();
    this._isPlaying = false;
    console.error('[IosAudioPlayer] Decode error:', error);
    if (this.callbacks.onError) {
      this.callbacks.onError(new Error('Something went wrong while playing this recording.'));
    }
  }

  private startProgressTimer(): void {
    this.stopProgressTimer();
    this.progressTimer = setInterval(() => {
      if (this.player && this._isPlaying) {
        try {
          const currentPosMs = Math.round(this.player.currentTime * 1000);
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(currentPosMs, this.durationMs);
          }
        } catch (e) {
          // Ignore transient error during state transition
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
