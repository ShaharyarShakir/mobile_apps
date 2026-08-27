import * as ImageManipulator from "expo-image-manipulator";
import type {
  CompressionResult,
  CompressionSummary,
  SelectedImage,
} from "../types/image";
import { getFileInfo } from "./fileService";

/**
 * Format bytes into human readable string (e.g. 42.8 MB, 850 KB)
 */
export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm))} ${sizes[unitIndex]}`;
}

/**
 * Calculates the percentage of space saved.
 */
export function calculateSavings(
  originalSize: number,
  compressedSize: number
): number {
  if (originalSize <= 0 || compressedSize >= originalSize) return 0;

  return Math.max(
    0,
    ((originalSize - compressedSize) / originalSize) * 100
  );
}

/**
 * Aggregates summary statistics across all compressed results.
 */
export function calculateSavingsSummary(
  results: CompressionResult[]
): CompressionSummary {
  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let successfulCount = 0;
  let failedCount = 0;

  for (const item of results) {
    if (item.success) {
      successfulCount++;
      totalOriginalSize += item.originalSize;
      totalCompressedSize += item.compressedSize;
    } else {
      failedCount++;
      totalOriginalSize += item.originalSize;
      totalCompressedSize += item.originalSize;
    }
  }

  const totalSavedBytes = Math.max(0, totalOriginalSize - totalCompressedSize);
  const overallSavingsPercentage =
    totalOriginalSize > 0
      ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
      : 0;

  return {
    totalOriginalSize,
    totalCompressedSize,
    totalSavedBytes,
    overallSavingsPercentage,
    successfulCount,
    failedCount,
  };
}

/**
 * Low-level manipulation function using Expo ImageManipulator.
 * Compresses an image at uri to JPEG with specified quality (0.0 - 1.0).
 */
export async function compressImage(
  uri: string,
  quality: number
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [],
    {
      compress: Math.max(0, Math.min(1, quality)),
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
}

/**
 * Compresses a single SelectedImage, accurately measuring sizes before and after.
 * Catches any failures and returns a clean, user-friendly result object.
 */
export async function compressSingleImage(
  image: SelectedImage,
  quality: number
): Promise<CompressionResult> {
  let originalSize = image.fileSize ?? 0;

  // If original fileSize is not available, measure directly from filesystem
  if (originalSize <= 0) {
    const originalInfo = await getFileInfo(image.uri);
    originalSize = originalInfo.size;
  }

  try {
    const compressedUri = await compressImage(image.uri, quality);
    const compressedInfo = await getFileInfo(compressedUri);
    const compressedSize = compressedInfo.size;

    const savingsPct = calculateSavings(originalSize, compressedSize);
    const savedBytes = Math.max(0, originalSize - compressedSize);

    return {
      id: image.id,
      filename: image.filename,
      originalUri: image.uri,
      compressedUri,
      originalSize,
      compressedSize,
      savingsPercentage: Math.round(savingsPct),
      savedBytes,
      width: image.width,
      height: image.height,
      success: true,
    };
  } catch (error) {
    console.warn("Failed to compress image:", image.filename, error);
    return {
      id: image.id,
      filename: image.filename,
      originalUri: image.uri,
      originalSize,
      compressedSize: originalSize,
      savingsPercentage: 0,
      savedBytes: 0,
      width: image.width,
      height: image.height,
      success: false,
      error: "Couldn't compress this image.",
    };
  }
}
