import * as FileSystem from "expo-file-system/legacy";
import { SelectedFile } from "../types/file";

/**
 * Calculates the sum of all file sizes in bytes.
 */
export function getTotalSize(files: SelectedFile[]): number {
  return files.reduce((total, file) => total + (file.size ?? 0), 0);
}

/**
 * Calculates percentage savings between original and compressed size.
 */
export function calculateSavings(
  original: number,
  compressed: number
): number {
  if (!original || original <= 0) return 0;
  return Math.max(0, ((original - compressed) / original) * 100);
}

/**
 * Formats a byte number into a human-readable string (e.g., "2.4 MB", "850 KB").
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) {
    return "--";
  }
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);
  const value = bytes / Math.pow(k, unitIndex);

  // Return integer for B, 1 decimal place for KB, MB, GB
  return `${unitIndex === 0 ? value : value.toFixed(1)} ${sizes[unitIndex]}`;
}

/**
 * Fallback helper to fetch file size via expo-file-system if not provided by picker.
 */
export async function getFileSizeAsync(
  uri: string
): Promise<number | undefined> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && typeof info.size === "number") {
      return info.size;
    }
  } catch {
    // Ignore error if file system check fails
  }
  return undefined;
}
