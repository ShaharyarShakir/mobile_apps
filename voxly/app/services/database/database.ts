import { isAndroid, isIOS, Utils, Application, knownFolders, File } from '@nativescript/core';

export interface DatabaseDriver {
  open(): Promise<void>;
  execute(sql: string, params?: any[]): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  close(): Promise<void>;
}

/**
 * Android Native SQLite Driver using android.database.sqlite.SQLiteDatabase and SQLiteStatement.
 */
class AndroidDatabaseDriver implements DatabaseDriver {
  private db: any = null;

  async open(): Promise<void> {
    if (this.db) return;

    if (typeof android === 'undefined') {
      throw new Error('Android environment not available.');
    }

    const context = Utils.android.getApplicationContext() || Application.android?.context;
    if (!context) {
      throw new Error('Android context not found for SQLite initialization.');
    }

    // MODE_PRIVATE = 0
    this.db = context.openOrCreateDatabase('voxly.db', 0, null as any);
    console.log('[AndroidDatabaseDriver] SQLite database voxly.db opened successfully.');
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    if (!this.db) await this.open();

    if (!params || params.length === 0) {
      this.db.execSQL(sql);
      return;
    }

    // Use compiled statement with explicit typed bindings for rock-solid reliability
    const stmt = this.db.compileStatement(sql);
    try {
      for (let i = 0; i < params.length; i++) {
        const val = params[i];
        const bindIndex = i + 1; // 1-indexed in SQLiteStatement
        if (val === null || val === undefined) {
          stmt.bindNull(bindIndex);
        } else if (typeof val === 'number') {
          if (Number.isInteger(val)) {
            stmt.bindLong(bindIndex, val);
          } else {
            stmt.bindDouble(bindIndex, val);
          }
        } else {
          stmt.bindString(bindIndex, String(val));
        }
      }
      stmt.execute();
    } finally {
      try {
        stmt.close();
      } catch (e) {
        // Ignored
      }
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.db) await this.open();

    let selectionArgs: any = null;
    if (params && params.length > 0 && typeof java !== 'undefined') {
      const stringParams = params.map((p) => (p === null || p === undefined ? '' : String(p)));
      selectionArgs = Array.create(java.lang.String, stringParams.length);
      for (let i = 0; i < stringParams.length; i++) {
        selectionArgs[i] = stringParams[i];
      }
    }

    const cursor = this.db.rawQuery(sql, selectionArgs);
    const results: T[] = [];

    if (cursor != null) {
      try {
        const colCount = cursor.getColumnCount();
        const colNames: string[] = [];
        for (let i = 0; i < colCount; i++) {
          colNames.push(cursor.getColumnName(i));
        }

        while (cursor.moveToNext()) {
          const row: any = {};
          for (let i = 0; i < colCount; i++) {
            try {
              const type = cursor.getType ? cursor.getType(i) : 3;
              // 0: NULL, 1: INTEGER, 2: FLOAT, 3: STRING, 4: BLOB
              if (type === 0) {
                row[colNames[i]] = null;
              } else if (type === 1) {
                row[colNames[i]] = Number(cursor.getLong(i));
              } else if (type === 2) {
                row[colNames[i]] = Number(cursor.getDouble(i));
              } else {
                row[colNames[i]] = cursor.getString(i);
              }
            } catch (colErr) {
              row[colNames[i]] = cursor.getString(i);
            }
          }
          results.push(row as T);
        }
      } finally {
        cursor.close();
      }
    }

    return results;
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        this.db.close();
      } catch (e) {
        console.warn('[AndroidDatabaseDriver] Error closing DB:', e);
      }
      this.db = null;
    }
  }
}

/**
 * File-backed persistent SQLite simulation driver for iOS, Node, and test environments.
 * Ensures metadata persistence across app restarts using local storage.
 */
class PersistentFileDatabaseDriver implements DatabaseDriver {
  private memoryData: Map<string, any> = new Map();
  private fileName = 'voxly_journal_db.json';
  private initialized = false;

  private getStorageFile(): File {
    const docFolder = knownFolders.documents();
    return docFolder.getFile(this.fileName);
  }

  async open(): Promise<void> {
    if (this.initialized) return;

    try {
      const file = this.getStorageFile();
      if (File.exists(file.path)) {
        const content = file.readTextSync();
        if (content && content.trim().length > 0) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            this.memoryData.clear();
            for (const item of parsed) {
              if (item && item.id) {
                this.memoryData.set(item.id, item);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[PersistentFileDatabaseDriver] Could not load saved database file, initializing empty:', err);
    }
    this.initialized = true;
  }

  private saveSync(): void {
    try {
      const file = this.getStorageFile();
      const records = Array.from(this.memoryData.values());
      file.writeTextSync(JSON.stringify(records, null, 2));
    } catch (err) {
      console.error('[PersistentFileDatabaseDriver] Failed to save DB to disk:', err);
    }
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    await this.open();
    const upper = sql.trim().toUpperCase();

    if (upper.startsWith('CREATE TABLE')) {
      return;
    }

    if (upper.startsWith('INSERT INTO')) {
      if (params && params.length >= 4) {
        const [id, audio_uri, duration, created_at, emotion, topic] = params;
        this.memoryData.set(id, {
          id,
          audio_uri,
          duration: Number(duration),
          created_at,
          emotion: emotion || null,
          topic: topic || null
        });
        this.saveSync();
      }
      return;
    }

    if (upper.startsWith('UPDATE')) {
      if (params && params.length >= 6) {
        const [audio_uri, duration, created_at, emotion, topic, id] = params;
        if (this.memoryData.has(id)) {
          this.memoryData.set(id, {
            id,
            audio_uri,
            duration: Number(duration),
            created_at,
            emotion: emotion || null,
            topic: topic || null
          });
          this.saveSync();
        }
      }
      return;
    }

    if (upper.startsWith('DELETE FROM')) {
      if (params && params.length >= 1) {
        const id = params[0];
        this.memoryData.delete(id);
        this.saveSync();
      }
      return;
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    await this.open();
    const upper = sql.trim().toUpperCase();

    if (upper.includes('WHERE ID =')) {
      const id = params?.[0];
      const found = id ? this.memoryData.get(id) : null;
      return found ? [found as T] : [];
    }

    // Default SELECT * FROM journal_entries ORDER BY created_at DESC
    const records = Array.from(this.memoryData.values());
    records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return records as T[];
  }

  async close(): Promise<void> {
    this.saveSync();
  }
}

/**
 * Unified Database Service Manager with Automatic Failover.
 */
export class DatabaseService {
  private primaryDriver: DatabaseDriver;
  private fallbackDriver: DatabaseDriver = new PersistentFileDatabaseDriver();
  private usingFallback = false;
  private isInitialized = false;

  constructor() {
    if (isAndroid) {
      this.primaryDriver = new AndroidDatabaseDriver();
    } else {
      this.primaryDriver = new PersistentFileDatabaseDriver();
      this.usingFallback = true;
    }
  }

  /**
   * Initializes SQLite database and ensures the schema tables exist.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.usingFallback) {
      try {
        await this.primaryDriver.open();
        await this.createTables(this.primaryDriver);
        this.isInitialized = true;
        console.log('[DatabaseService] Native SQLite database initialization complete.');
        return;
      } catch (err) {
        console.warn('[DatabaseService] Native SQLite initialization failed. Switching to Persistent JSON driver:', err);
        this.usingFallback = true;
      }
    }

    try {
      await this.fallbackDriver.open();
      await this.createTables(this.fallbackDriver);
      this.isInitialized = true;
      console.log('[DatabaseService] Persistent JSON database initialization complete.');
    } catch (fallbackErr) {
      console.error('[DatabaseService] Fallback database initialization failed:', fallbackErr);
      this.isInitialized = true; // prevent infinite loops
    }
  }

  private async createTables(driver: DatabaseDriver): Promise<void> {
    const createJournalEntriesTable = `
      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY NOT NULL,
        audio_uri TEXT NOT NULL,
        duration INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        emotion TEXT,
        topic TEXT
      );
    `;
    await driver.execute(createJournalEntriesTable);
  }

  public async execute(sql: string, params?: any[]): Promise<void> {
    await this.initialize();
    const activeDriver = this.usingFallback ? this.fallbackDriver : this.primaryDriver;
    try {
      await activeDriver.execute(sql, params);
    } catch (err) {
      if (!this.usingFallback) {
        console.warn('[DatabaseService] Primary execute failed, migrating to fallback driver:', err);
        this.usingFallback = true;
        await this.fallbackDriver.open();
        await this.fallbackDriver.execute(sql, params);
      } else {
        throw err;
      }
    }
  }

  public async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    await this.initialize();
    const activeDriver = this.usingFallback ? this.fallbackDriver : this.primaryDriver;
    try {
      return await activeDriver.query<T>(sql, params);
    } catch (err) {
      if (!this.usingFallback) {
        console.warn('[DatabaseService] Primary query failed, migrating to fallback driver:', err);
        this.usingFallback = true;
        await this.fallbackDriver.open();
        return await this.fallbackDriver.query<T>(sql, params);
      } else {
        return [];
      }
    }
  }

  public async close(): Promise<void> {
    if (this.isInitialized) {
      try {
        const activeDriver = this.usingFallback ? this.fallbackDriver : this.primaryDriver;
        await activeDriver.close();
      } catch (e) {
        // Ignored
      }
      this.isInitialized = false;
    }
  }
}

export const database = new DatabaseService();

