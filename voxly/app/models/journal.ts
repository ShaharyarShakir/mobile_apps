export interface JournalEntry {
  id: string;
  audioUri: string;
  duration: number;
  createdAt: string;
  emotion?: string;
  topic?: string;
}

