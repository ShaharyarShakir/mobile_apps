import { SelectedImage } from "../types/image";

export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm))} ${sizes[unitIndex]}`;
}

export function calculateSavings(
  originalBytes?: number,
  compressedBytes?: number
): { savedBytes: number; percentage: number } {
  if (!originalBytes || !compressedBytes || originalBytes <= compressedBytes) {
    return { savedBytes: 0, percentage: 0 };
  }

  const savedBytes = originalBytes - compressedBytes;
  const percentage = Math.round((savedBytes / originalBytes) * 100);

  return { savedBytes, percentage };
}

/**
 * Stub image compressor function to be expanded in Phase 1C.
 */
export async function compressImage(
  image: SelectedImage,
  quality: number
): Promise<SelectedImage> {
  // Foundation stub: returns the image metadata.
  // Real compression using expo-image-manipulator will be added in Phase 1C.
  return {
    ...image,
    id: `${image.id}-compressed-${quality}`,
  };
}

