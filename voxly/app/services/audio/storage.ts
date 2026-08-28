import { knownFolders, path, File, Folder } from '@nativescript/core';

const RECORDINGS_FOLDER_NAME = 'recordings';

/**
 * Ensures and returns the application-private recordings directory.
 * Located in documents folder so files survive app restarts without requiring storage permissions.
 */
export function getRecordingsDirectory(): Folder {
  const documents = knownFolders.documents();
  return documents.getFolder(RECORDINGS_FOLDER_NAME);
}

/**
 * Generates a unique, predictable audio recording file path.
 * Format: recording-{timestamp}.m4a
 */
export function generateRecordingFilePath(timestamp: number = Date.now()): string {
  const folder = getRecordingsDirectory();
  const filename = `recording-${timestamp}.m4a`;
  return path.join(folder.path, filename);
}

/**
 * Converts a filesystem path to a standard file:// URI format.
 */
export function filePathToUri(filePath: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('file://')) {
    return filePath;
  }
  return `file://${filePath}`;
}

/**
 * Converts a file:// URI back to a local filesystem path.
 */
export function uriToFilePath(uri: string): string {
  if (!uri) return '';
  let cleaned = uri;
  if (cleaned.startsWith('file://')) {
    cleaned = cleaned.replace(/^file:\/\//, '');
  }
  try {
    return decodeURIComponent(cleaned);
  } catch (e) {
    return cleaned;
  }
}

/**
 * Safely retrieves file size in bytes if file exists.
 */
export function getFileSize(filePath: string): number {
  const cleanPath = uriToFilePath(filePath);
  if (cleanPath && File.exists(cleanPath)) {
    const file = File.fromPath(cleanPath);
    return file.size || 0;
  }
  return 0;
}

/**
 * Deletes a recording file if it exists.
 */
export function deleteRecordingFile(filePathOrUri: string): boolean {
  try {
    const cleanPath = uriToFilePath(filePathOrUri);
    if (cleanPath && File.exists(cleanPath)) {
      const file = File.fromPath(cleanPath);
      file.removeSync();
      return true;
    }
  } catch (err) {
    console.error(`[AudioStorage] Failed to delete file: ${filePathOrUri}`, err);
  }
  return false;
}

/**
 * Lists all recording files saved in the recordings folder.
 */
export function listRecordingFiles(): string[] {
  try {
    const folder = getRecordingsDirectory();
    const entities = folder.getEntitiesSync();
    return entities
      .filter((entity) => !Folder.exists(entity.path) && entity.name.endsWith('.m4a'))
      .map((entity) => entity.path);
  } catch (err) {
    console.error('[AudioStorage] Failed to list recording files', err);
    return [];
  }
}


