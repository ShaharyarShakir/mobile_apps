import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { CompressionFileType } from "../types/file";

export type SaveResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Saves a compressed file to the device's native media or document storage.
 */
export async function saveToDevice(
  uri: string,
  fileName: string,
  type: CompressionFileType
): Promise<SaveResult> {
  try {
    if (type === "image") {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        return {
          success: false,
          error: "Photo library permission is required to save images.",
        };
      }

      await MediaLibrary.createAssetAsync(uri);
      return {
        success: true,
        message: "Saved to Photos successfully.",
      };
    } else {
      // For PDFs, shareAsync opens the native system share/save-to-files dialog
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          error: "Saving documents is not supported on this device.",
        };
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Save ${fileName}`,
        UTI: "com.adobe.pdf",
      });

      return {
        success: true,
        message: "Saved document successfully.",
      };
    }
  } catch {
    return {
      success: false,
      error: "Couldn't save the compressed file.",
    };
  }
}

/**
 * Shares a compressed file via native system share sheet.
 */
export async function shareFile(
  uri: string,
  mimeType?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: "Sharing is not supported on this device.",
      };
    }

    await Sharing.shareAsync(uri, {
      mimeType: mimeType || "application/octet-stream",
      dialogTitle: "Share Compressed File",
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Couldn't open the share menu.",
    };
  }
}

/**
 * Cleans up temporary cache files.
 */
export async function cleanupTempFiles(uris: string[]): Promise<void> {
  for (const uri of uris) {
    if (uri && uri.startsWith(FileSystem.cacheDirectory || "")) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

