import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import {
  CompressionProgress,
  CompressionResult,
  SelectedFile,
} from "../../types/file";
import { calculateSavings, getFileSizeAsync } from "../fileUtils";

/**
 * Determines the optimal save format for the input image.
 * PNG and WebP use WebP to preserve alpha transparency with lossy compression.
 */
function resolveSaveFormat(file: SelectedFile): ImageManipulator.SaveFormat {
  const name = (file.name || "").toLowerCase();
  const mime = (file.mimeType || "").toLowerCase();

  if (
    name.endsWith(".png") ||
    mime.includes("png") ||
    name.endsWith(".webp") ||
    mime.includes("webp")
  ) {
    return ImageManipulator.SaveFormat.WEBP;
  }

  return ImageManipulator.SaveFormat.JPEG;
}

/**
 * Compresses an individual image on-device and measures actual savings.
 */
export async function compressImage(
  image: SelectedFile,
  quality: number
): Promise<CompressionResult> {
  const format = resolveSaveFormat(image);

  let originalSize = image.size;
  if (!originalSize || originalSize === 0) {
    originalSize = (await getFileSizeAsync(image.uri)) || 0;
  }

  const manipResult = await ImageManipulator.manipulateAsync(
    image.uri,
    [], // No transformations, pure quality compression
    {
      compress: quality,
      format,
    }
  );

  let compressedSize = 0;
  try {
    const info = await FileSystem.getInfoAsync(manipResult.uri);
    if (info.exists && typeof info.size === "number") {
      compressedSize = info.size;
    }
  } catch {
    compressedSize = originalSize;
  }

  const rawSavingsPercentage = calculateSavings(originalSize, compressedSize);
  const isMinimalSavings = rawSavingsPercentage < 3 || compressedSize >= originalSize;

  if (isMinimalSavings) {
    // Cleanup temporary image file
    await FileSystem.deleteAsync(manipResult.uri, { idempotent: true });
    return {
      id: image.id,
      name: image.name,
      originalUri: image.uri,
      compressedUri: image.uri,
      originalSize,
      compressedSize: originalSize,
      savingsPercentage: 0,
      isAlreadyOptimized: true,
      optimizationNote: "This image is already close to its smallest practical size.",
    };
  }

  return {
    id: image.id,
    name: image.name,
    originalUri: image.uri,
    compressedUri: manipResult.uri,
    originalSize,
    compressedSize,
    savingsPercentage: rawSavingsPercentage,
    isAlreadyOptimized: false,
  };
}

/**
 * Compresses an array of images sequentially (1 by 1) to prevent high memory pressure.
 */
export async function compressImagesBatch(
  files: SelectedFile[],
  quality: number,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round((i / total) * 100),
        currentFileName: file.name,
      });
    }

    try {
      const result = await compressImage(file, quality);
      results.push(result);
    } catch {
      results.push({
        id: file.id,
        name: file.name,
        originalUri: file.uri,
        originalSize: file.size ?? 0,
        compressedSize: file.size ?? 0,
        savingsPercentage: 0,
        error: "Couldn't compress this image.",
      });
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        currentFileName: file.name,
      });
    }
  }

  return results;
}
