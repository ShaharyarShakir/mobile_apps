export type RecorderState = 'idle' | 'recording' | 'paused' | 'error';

export interface RecordingResult {
  uri: string;
  filePath: string;
  duration: number; // in seconds
  sizeBytes?: number;
  timestamp: number;
}

export interface AudioRecorder {
  requestPermission(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<RecordingResult>;
  cancel(): Promise<void>;
  isRecording(): boolean;
  getState(): RecorderState;
}

export interface AudioDriver {
  start(outputPath: string): Promise<void>;
  stop(): Promise<{ duration: number; filePath: string }>;
  cancel(): Promise<void>;
  isRecording(): boolean;
}

// ==========================================
// Audio Player Interfaces & State Types
// ==========================================

export interface PlaybackState {
  uri: string | null;
  isPlaying: boolean;
  position: number; // in milliseconds
  duration: number; // in milliseconds
}

export interface AudioPlayer {
  load(uri: string): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seekTo(position: number): Promise<void>;
  skip(seconds: number): Promise<void>;
  setSpeed(speed: number): Promise<void>;
  unload(): Promise<void>;
}

export interface PlayerDriverCallbacks {
  onProgress?: (positionMs: number, durationMs: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioPlayerDriver {
  load(filePath: string, callbacks: PlayerDriverCallbacks): Promise<{ duration: number }>;
  play(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  seekTo(positionMs: number): Promise<void>;
  setSpeed?(speed: number): Promise<void>;
  unload(): Promise<void>;
  isPlaying(): boolean;
  getCurrentPosition(): number;
  getDuration(): number;
}

