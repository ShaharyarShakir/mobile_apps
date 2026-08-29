import { writable, derived } from 'svelte/store';
import type { JournalEntry } from '../models/journal';
import { journalRepository } from '../services/database/journal';
import { deleteRecordingFile, listRecordingFiles, filePathToUri } from '../services/audio/storage';
import { player } from '../services/audio/player';

export const journalEntries = writable<JournalEntry[]>([]);
export const isLoadingJournal = writable<boolean>(false);
export const activePlayingEntryId = writable<string | null>(null);

// Search and filtering stores
export const searchQuery = writable<string>('');
export const selectedEmotionFilter = writable<string | null>(null);
export const selectedTopicFilter = writable<string | null>(null);

/**
 * Filtered entries derived from active search query, emotion filter, and topic filter.
 */
export const filteredJournalEntries = derived(
  [journalEntries, searchQuery, selectedEmotionFilter, selectedTopicFilter],
  ([$entries, $query, $emotion, $topic]) => {
    let list = $entries;

    if ($emotion) {
      list = list.filter((e) => e.emotion?.toLowerCase() === $emotion.toLowerCase());
    }

    if ($topic) {
      list = list.filter((e) => e.topic?.toLowerCase() === $topic.toLowerCase());
    }

    if ($query && $query.trim().length > 0) {
      const q = $query.trim().toLowerCase();
      list = list.filter((e) => {
        const matchesEmotion = e.emotion?.toLowerCase().includes(q);
        const matchesTopic = e.topic?.toLowerCase().includes(q);
        const matchesId = e.id.toLowerCase().includes(q);
        const matchesDate = new Date(e.createdAt).toLocaleDateString().toLowerCase().includes(q);
        return matchesEmotion || matchesTopic || matchesId || matchesDate;
      });
    }

    return list;
  }
);

/**
 * Journal analytics derived store (total thoughts, total audio duration, tag counts).
 */
export const journalStats = derived(journalEntries, ($entries) => {
  let totalMs = 0;
  const emotionMap: Record<string, number> = {};
  const topicMap: Record<string, number> = {};

  for (const e of $entries) {
    const dur = e.duration > 1000 ? e.duration : e.duration * 1000;
    totalMs += dur;
    if (e.emotion) {
      emotionMap[e.emotion] = (emotionMap[e.emotion] || 0) + 1;
    }
    if (e.topic) {
      topicMap[e.topic] = (topicMap[e.topic] || 0) + 1;
    }
  }

  return {
    totalCount: $entries.length,
    totalDurationMs: totalMs,
    emotionMap,
    topicMap
  };
});

/**
 * Loads all journal entries from SQLite database into store.
 * Also automatically checks and synchronizes any physical .m4a recording files
 * that exist on device storage so no recorded thoughts are ever lost.
 */
export async function loadJournal(): Promise<void> {
  isLoadingJournal.set(true);
  try {
    let entries = await journalRepository.getAll();

    // Auto-sync any existing physical recordings on disk not yet in SQLite
    try {
      const physicalFiles = listRecordingFiles();
      const existingUris = new Set(entries.map((e) => e.audioUri));
      let newImports = false;

      for (const filePath of physicalFiles) {
        const uri = filePathToUri(filePath);
        if (!existingUris.has(uri) && !existingUris.has(filePath)) {
          const match = filePath.match(/recording-(\d+)\.m4a/);
          const timestamp = match ? parseInt(match[1], 10) : Date.now();
          const dateIso = new Date(timestamp).toISOString();
          const entryId = `01J${timestamp.toString(36)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

          const importedEntry: JournalEntry = {
            id: entryId,
            audioUri: uri,
            duration: 0,
            createdAt: dateIso
          };

          try {
            await journalRepository.create(importedEntry);
            entries.push(importedEntry);
            existingUris.add(uri);
            newImports = true;
            console.log('[JournalStore] Auto-synced orphaned recording into SQLite:', uri);
          } catch (e) {
            console.warn('[JournalStore] Could not auto-import recording:', filePath, e);
          }
        }
      }

      if (newImports) {
        entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (fsErr) {
      console.warn('[JournalStore] Error during storage sync check:', fsErr);
    }

    journalEntries.set(entries);
  } catch (err) {
    console.error('[JournalStore] Failed to load journal entries:', err);
    journalEntries.set([]);
  } finally {
    isLoadingJournal.set(false);
  }
}

/**
 * Persists a new journal entry to SQLite and adds it to the top of the reactive store.
 */
export async function addJournalEntry(entry: JournalEntry): Promise<void> {
  try {
    await journalRepository.create(entry);
    journalEntries.update((entries) => [entry, ...entries.filter((e) => e.id !== entry.id)]);
    console.log(`[JournalStore] Entry saved: ${entry.id}`);
  } catch (err) {
    console.error('[JournalStore] Failed to create journal entry:', err);
    // Optimistically keep in memory store even if database had a warning
    journalEntries.update((entries) => [entry, ...entries.filter((e) => e.id !== entry.id)]);
  }
}

/**
 * Updates an existing journal entry in SQLite and store (e.g. adding emotion/topic tags).
 */
export async function updateJournalEntry(entry: JournalEntry): Promise<void> {
  try {
    await journalRepository.update(entry);
    journalEntries.update((entries) =>
      entries.map((e) => (e.id === entry.id ? { ...entry } : e))
    );
    console.log(`[JournalStore] Entry updated: ${entry.id}`);
  } catch (err) {
    console.error('[JournalStore] Failed to update journal entry:', err);
    journalEntries.update((entries) =>
      entries.map((e) => (e.id === entry.id ? { ...entry } : e))
    );
  }
}

/**
 * Deletes an entry: removes audio file from disk, deletes SQLite row, and updates store.
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  let targetEntry: JournalEntry | undefined;

  journalEntries.subscribe((entries) => {
    targetEntry = entries.find((e) => e.id === id);
  })();

  try {
    let activeId: string | null = null;
    activePlayingEntryId.subscribe((val) => (activeId = val))();
    if (activeId === id) {
      await player.stop();
      await player.unload();
      activePlayingEntryId.set(null);
    }

    if (targetEntry?.audioUri) {
      deleteRecordingFile(targetEntry.audioUri);
    }

    await journalRepository.delete(id);
    journalEntries.update((entries) => entries.filter((e) => e.id !== id));
    console.log(`[JournalStore] Entry deleted successfully: ${id}`);
  } catch (err) {
    console.error('[JournalStore] Failed to delete journal entry:', err);
    journalEntries.update((entries) => entries.filter((e) => e.id !== id));
  }
}

