import { AudioPlayerDriver, PlayerDriverCallbacks } from './types';

export class MockAudioPlayerDriver implements AudioPlayerDriver {
  private callbacks: PlayerDriverCallbacks = {};
  private _isPlaying: boolean = false;
  private durationMs: number = 17000;
  private positionMs: number = 0;
  private timer: any = null;

  public isPlaying(): boolean {
    return this._isPlaying;
  }

  public getCurrentPosition(): number {
    return this.positionMs;
  }

  public getDuration(): number {
    return this.durationMs;
  }

  public async load(filePath: string, callbacks: PlayerDriverCallbacks): Promise<{ duration: number }> {
    this.callbacks = callbacks;
    this.positionMs = 0;
    this._isPlaying = false;
    this.durationMs = 17000; // Mock 17 seconds
    this.stopTimer();
    return { duration: this.durationMs };
  }

  public async play(): Promise<void> {
    if (this.positionMs >= this.durationMs) {
      this.positionMs = 0;
    }
    this._isPlaying = true;
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this._isPlaying) {
        this.positionMs += 100;
        if (this.positionMs >= this.durationMs) {
          this.positionMs = this.durationMs;
          this._isPlaying = false;
          this.stopTimer();
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(this.positionMs, this.durationMs);
          }
          if (this.callbacks.onComplete) {
            this.callbacks.onComplete();
          }
        } else {
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(this.positionMs, this.durationMs);
          }
        }
      }
    }, 100);
  }

  public async pause(): Promise<void> {
    this._isPlaying = false;
    this.stopTimer();
  }

  public async stop(): Promise<void> {
    this._isPlaying = false;
    this.positionMs = 0;
    this.stopTimer();
  }

  public async seekTo(positionMs: number): Promise<void> {
    this.positionMs = Math.max(0, Math.min(positionMs, this.durationMs));
    if (this.callbacks.onProgress) {
      this.callbacks.onProgress(this.positionMs, this.durationMs);
    }
  }

  public async setSpeed(speed: number): Promise<void> {
    // Simulated speed in mock player
  }


  public async unload(): Promise<void> {
    this._isPlaying = false;
    this.positionMs = 0;
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

