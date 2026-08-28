import { AudioDriver } from './types';
import { deleteRecordingFile } from './storage';

export class IosAudioDriver implements AudioDriver {
  private recorder: any = null; // AVAudioRecorder
  private currentFilePath: string | null = null;
  private recordingStartTime: number = 0;
  private _isRecording: boolean = false;

  public isRecording(): boolean {
    return this._isRecording;
  }

  public async start(outputPath: string): Promise<void> {
    if (this._isRecording) {
      throw new Error('iOS recorder is already active.');
    }

    try {
      if (typeof AVAudioSession === 'undefined' || typeof AVAudioRecorder === 'undefined') {
        throw new Error('iOS native audio environment not available.');
      }

      const session = AVAudioSession.sharedInstance();
      session.setCategoryWithOptionsError(
        AVAudioSessionCategoryPlayAndRecord,
        AVAudioSessionCategoryOptions.DefaultToSpeaker | AVAudioSessionCategoryOptions.AllowBluetooth
      );
      session.setActiveError(true);

      // 0x61616320 ('aac ') is standard kAudioFormatMPEG4AAC (1633772320)
      const aacFormatCode = 0x61616320;

      const settings = NSDictionary.dictionaryWithObjectsForKeys(
        [
          NSNumber.numberWithInt(aacFormatCode),
          NSNumber.numberWithFloat(44100.0),
          NSNumber.numberWithInt(2),
          NSNumber.numberWithInt(AVAudioQuality.High)
        ],
        [
          AVFormatIDKey,
          AVSampleRateKey,
          AVNumberOfChannelsKey,
          AVEncoderAudioQualityKey
        ]
      );

      const url = NSURL.fileURLWithPath(outputPath);
      this.recorder = AVAudioRecorder.alloc().initWithURLSettingsError(url, settings);
      this.currentFilePath = outputPath;

      const prepared = this.recorder.prepareToRecord();
      if (!prepared) {
        throw new Error('Failed to prepare AVAudioRecorder.');
      }

      const started = this.recorder.record();
      if (!started) {
        throw new Error('Failed to start AVAudioRecorder.');
      }

      this.recordingStartTime = Date.now();
      this._isRecording = true;
    } catch (err) {
      this.cleanup();
      throw new Error(`Failed to start iOS audio recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  public async stop(): Promise<{ duration: number; filePath: string }> {
    if (!this._isRecording || !this.recorder || !this.currentFilePath) {
      throw new Error('No active recording to stop.');
    }

    const filePath = this.currentFilePath;
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - this.recordingStartTime) / 1000));

    try {
      const nativeDurationSeconds = this.recorder.currentTime > 0
        ? Math.round(this.recorder.currentTime)
        : elapsedSeconds;

      this.recorder.stop();
      this.recorder = null;
      this._isRecording = false;
      this.currentFilePath = null;

      try {
        const session = AVAudioSession.sharedInstance();
        session.setActiveWithOptionsError(false, AVAudioSessionSetActiveOptions.NotifyOthersOnDeactivation);
      } catch (e) {
        // Ignored
      }

      return {
        duration: nativeDurationSeconds,
        filePath
      };
    } catch (err) {
      this.cleanup();
      deleteRecordingFile(filePath);
      throw new Error(`Failed to stop iOS audio recording: ${err instanceof Error ? err.message : String(err)}`);
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
        if (this.recorder.isRecording()) {
          this.recorder.stop();
        }
      } catch (err) {
        console.warn('[IosAudioDriver] Error during recorder cleanup', err);
      }
      this.recorder = null;
    }
    this._isRecording = false;
    this.currentFilePath = null;
    this.recordingStartTime = 0;
  }
}
