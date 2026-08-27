import * as FileSystem from "expo-file-system/legacy";

export type MeasuredFileInfo = {
  exists: boolean;
  size: number;
};

/**
 * Gets file metadata including actual file size in bytes directly from disk.
 */
export async function getFileInfo(uri: string): Promise<MeasuredFileInfo> {
  try {
    if (!uri) {
      return { exists: false, size: 0 };
    }

    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      return {
        exists: true,
        size: info.size ?? 0,
      };
    }

    return { exists: false, size: 0 };
  } catch (error) {
    console.warn("Failed to get file info for URI:", uri, error);
    return { exists: false, size: 0 };
  }
}

/**
 * Safely deletes a file if it exists.
 */
export async function deleteFile(uri?: string): Promise<void> {
  if (!uri) return;

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Non-critical cleanup error, ignore
  }
}

/**
 * Safely cleans up an array of temporary files.
 */
export async function cleanupTempFiles(uris: (string | undefined)[]): Promise<void> {
  const validUris = uris.filter((uri): uri is string => Boolean(uri));
  await Promise.allSettled(validUris.map((uri) => deleteFile(uri)));
}

