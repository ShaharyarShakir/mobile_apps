import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { Image as RNImage } from "react-native";
import {
  CompressionProgress,
  CompressionResult,
  ImageCompressionConfig,
  SelectedFile,
} from "../../types/file";
import { calculateSavings, getFileSizeAsync } from "../fileUtils";
import { computeTargetDimensions } from "./scaler";

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
 * Safely resolves image dimensions either from file metadata or via RN Image.getSize.
 */
async function resolveDimensions(
  image: SelectedFile
): Promise<{ width: number; height: number } | null> {
  if (image.width && image.height && image.width > 0 && image.height > 0) {
    return { width: image.width, height: image.height };
  }

  return new Promise((resolve) => {
    RNImage.getSize(
      image.uri,
      (width, height) => resolve({ width, height }),
      () => resolve(null)
    );
  });
}

/**
 * Normalizes quality number or full ImageCompressionConfig.
 */
function normalizeConfig(
  input: number | ImageCompressionConfig
): ImageCompressionConfig {
  if (typeof input === "number") {
    return { quality: input };
  }
  return input;
}

/**
 * Compresses an individual image on-device with optional resolution scaling and measures actual savings.
 */
export async function compressImage(
  image: SelectedFile,
  configOrQuality: number | ImageCompressionConfig
): Promise<CompressionResult> {
  const config = normalizeConfig(configOrQuality);
  const format = resolveSaveFormat(image);

  let originalSize = image.size;
  if (!originalSize || originalSize === 0) {
    originalSize = (await getFileSizeAsync(image.uri)) || 0;
  }

  const actions: ImageManipulator.Action[] = [];

  // Apply resolution scaling if maxDimension is requested
  if (config.maxDimension && config.maxDimension > 0) {
    const dims = await resolveDimensions(image);
    if (dims) {
      const targetDims = computeTargetDimensions(
        dims.width,
        dims.height,
        config.maxDimension
      );
      if (targetDims) {
        actions.push({
          resize: {
            width: targetDims.width,
            height: targetDims.height,
          },
        });
      }
    }
  }

  const manipResult = await ImageManipulator.manipulateAsync(
    image.uri,
    actions,
    {
      compress: config.quality,
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
  configOrQuality: number | ImageCompressionConfig,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult[]> {
  const config = normalizeConfig(configOrQuality);
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
      const result = await compressImage(file, config);
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
