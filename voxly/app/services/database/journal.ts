import { database } from './database';
import { JournalEntry } from '../../models/journal';

export interface JournalRepository {
  create(entry: JournalEntry): Promise<void>;
  getAll(): Promise<JournalEntry[]>;
  getById(id: string): Promise<JournalEntry | null>;
  update(entry: JournalEntry): Promise<void>;
  delete(id: string): Promise<void>;
}

interface JournalDbRow {
  id: string;
  title?: string | null;
  audio_uri: string;
  duration: number;
  created_at: string;
  emotion?: string | null;
  topic?: string | null;
}

function rowToEntry(row: JournalDbRow): JournalEntry {
  return {
    id: row.id,
    title: row.title || undefined,
    audioUri: row.audio_uri,
    duration: Number(row.duration) || 0,
    createdAt: row.created_at,
    emotion: row.emotion || undefined,
    topic: row.topic || undefined
  };
}

export class SQLiteJournalRepository implements JournalRepository {
  async create(entry: JournalEntry): Promise<void> {
    const sql = `
      INSERT INTO journal_entries (id, title, audio_uri, duration, created_at, emotion, topic)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      entry.id,
      entry.title || null,
      entry.audioUri,
      entry.duration,
      entry.createdAt,
      entry.emotion || null,
      entry.topic || null
    ];
    await database.execute(sql, params);
  }

  async getAll(): Promise<JournalEntry[]> {
    const sql = `
      SELECT id, title, audio_uri, duration, created_at, emotion, topic
      FROM journal_entries
      ORDER BY created_at DESC;
    `;
    const rows = await database.query<JournalDbRow>(sql);
    return rows.map(rowToEntry);
  }

  async getById(id: string): Promise<JournalEntry | null> {
    const sql = `
      SELECT id, title, audio_uri, duration, created_at, emotion, topic
      FROM journal_entries
      WHERE id = ?
      LIMIT 1;
    `;
    const rows = await database.query<JournalDbRow>(sql, [id]);
    if (rows && rows.length > 0) {
      return rowToEntry(rows[0]);
    }
    return null;
  }

  async update(entry: JournalEntry): Promise<void> {
    const sql = `
      UPDATE journal_entries
      SET title = ?, audio_uri = ?, duration = ?, created_at = ?, emotion = ?, topic = ?
      WHERE id = ?;
    `;
    const params = [
      entry.title || null,
      entry.audioUri,
      entry.duration,
      entry.createdAt,
      entry.emotion || null,
      entry.topic || null,
      entry.id
    ];
    await database.execute(sql, params);
  }

  async delete(id: string): Promise<void> {
    const sql = `
      DELETE FROM journal_entries
      WHERE id = ?;
    `;
    await database.execute(sql, [id]);
  }
}


export const journalRepository = new SQLiteJournalRepository();

