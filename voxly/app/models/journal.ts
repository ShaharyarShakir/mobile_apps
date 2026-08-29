export interface JournalEntry {
  id: string;
  title?: string;
  audioUri: string;
  duration: number; // in milliseconds (or seconds)
  createdAt: string; // ISO 8601 string
  emotion?: string;
  topic?: string;
}


export const EMOTIONS = [
  'happy',
  'calm',
  'excited',
  'sad',
  'angry',
  'anxious'
] as const;

export type Emotion = typeof EMOTIONS[number];

export const TOPICS = [
  'work',
  'study',
  'ideas',
  'personal',
  'goals',
  'random'
] as const;

export type Topic = typeof TOPICS[number];
