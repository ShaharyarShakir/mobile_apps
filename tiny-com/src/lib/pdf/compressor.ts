import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import {
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
} from "pdf-lib";
import {
  PDF_PRESET_DETAILS,
  PDFPresetKey,
} from "../../constants/compression";
import {
  PDFCompressionProgress,
  PDFCompressionResult,
  SelectedFile,
} from "../../types/file";
import { calculateSavings, getFileSizeAsync } from "../fileUtils";

/**
 * Converts Uint8Array to base64 string safely in chunks.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Converts base64 string to Uint8Array safely.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses an individual PDF on-device:
 * - Extracts and recompresses embedded image streams.
 * - Preserves searchable text, vector graphics, fonts, and page structures.
 * - Validates output size to reject larger files.
 */
export async function compressPDF(
  file: SelectedFile,
  presetKey: PDFPresetKey = "balanced",
  onProgress?: (progress: PDFCompressionProgress) => void
): Promise<PDFCompressionResult> {
  const preset = PDF_PRESET_DETAILS[presetKey];
  let originalSize = file.size;
  if (!originalSize || originalSize === 0) {
    originalSize = (await getFileSizeAsync(file.uri)) || 0;
  }

  try {
    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 10,
        currentFileName: file.name,
        stage: "Reading PDF...",
      });
    }

    // 1. Read PDF file as Base64
    const pdfBase64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 25,
        currentFileName: file.name,
        stage: "Analyzing document...",
      });
    }

    // 2. Load into pdf-lib (suppress non-critical parser recovery warnings)
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const msg = args.map(String).join(" ");
      if (
        msg.includes("Trying to parse invalid object") ||
        msg.includes("Invalid object ref:")
      ) {
        return;
      }
      originalWarn(...args);
    };

    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(pdfBase64, {
        ignoreEncryption: true,
      });
    } finally {
      console.warn = originalWarn;
    }

    // 3. Find embedded image XObjects
    const imageObjects: Array<{ ref: unknown; obj: PDFRawStream }> = [];
    for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
      if (
        obj instanceof PDFRawStream &&
        obj.dict &&
        obj.dict.get(PDFName.of("Subtype"))?.toString() === "/Image"
      ) {
        imageObjects.push({ ref, obj });
      }
    }

    // 4. Recompress embedded images
    const totalImages = imageObjects.length;
    for (let i = 0; i < totalImages; i++) {
      const { obj } = imageObjects[i];
      const contents = obj.getContents();

      if (onProgress) {
        const imgPercent = Math.min(
          80,
          25 + Math.round(((i + 1) / Math.max(1, totalImages)) * 55)
        );
        onProgress({
          current: 1,
          total: 1,
          percentage: imgPercent,
          currentFileName: file.name,
          stage: `Compressing images (${i + 1}/${totalImages})...`,
        });
      }

      if (contents && contents.length > 500) {
        const tmpImgPath = `${FileSystem.cacheDirectory}tmp_pdf_img_${Date.now()}_${i}.jpg`;
        try {
          const imgBase64 = uint8ArrayToBase64(contents);
          await FileSystem.writeAsStringAsync(tmpImgPath, imgBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const manip = await ImageManipulator.manipulateAsync(
            tmpImgPath,
            [],
            {
              compress: preset.imageQuality,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );

          const compressedImgBase64 = await FileSystem.readAsStringAsync(
            manip.uri,
            { encoding: FileSystem.EncodingType.Base64 }
          );
          const compressedBytes = base64ToUint8Array(compressedImgBase64);

          // Only replace if recompressed image is strictly smaller
          if (compressedBytes.length < contents.length) {
            (obj as unknown as { contents: Uint8Array }).contents = compressedBytes;
            obj.dict.set(
              PDFName.of("Length"),
              PDFNumber.of(compressedBytes.length)
            );
            obj.dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
            obj.dict.delete(PDFName.of("DecodeParms"));
          }

          // Clean up temporary image files
          await FileSystem.deleteAsync(tmpImgPath, { idempotent: true });
          await FileSystem.deleteAsync(manip.uri, { idempotent: true });
        } catch {
          // If a single image fails recompression, keep original image stream
        }
      }
    }

    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 85,
        currentFileName: file.name,
        stage: "Rebuilding PDF...",
      });
    }

    // 5. Save the modified PDF with object streams enabled
    const compressedPdfBase64 = await doc.saveAsBase64({
      dataUri: false,
      useObjectStreams: true,
    });
    const outFileName = `compressed_${Date.now()}_${file.name}`;
    const outputPath = `${FileSystem.cacheDirectory}${outFileName}`;
    await FileSystem.writeAsStringAsync(outputPath, compressedPdfBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 6. Measure output size
    let compressedSize = originalSize;
    try {
      const info = await FileSystem.getInfoAsync(outputPath);
      if (info.exists && typeof info.size === "number") {
        compressedSize = info.size;
      }
    } catch {
      compressedSize = originalSize;
    }

    if (onProgress) {
      onProgress({
        current: 1,
        total: 1,
        percentage: 100,
        currentFileName: file.name,
        stage: "Done",
      });
    }

    // 7. Validate output against original
    const rawSavingsPercentage = calculateSavings(originalSize, compressedSize);
    const isMinimalSavings = rawSavingsPercentage < 3 || compressedSize >= originalSize;

    if (isMinimalSavings) {
      // Clean up the temporary file since original is already optimal
      await FileSystem.deleteAsync(outputPath, { idempotent: true });
      return {
        id: file.id,
        name: file.name,
        originalUri: file.uri,
        compressedUri: file.uri,
        originalSize,
        compressedSize: originalSize,
        savingsPercentage: 0,
        isAlreadyOptimized: true,
        optimizationNote: "This file is already close to its smallest practical size.",
      };
    }

    return {
      id: file.id,
      name: file.name,
      originalUri: file.uri,
      compressedUri: outputPath,
      originalSize,
      compressedSize,
      savingsPercentage: rawSavingsPercentage,
      isAlreadyOptimized: false,
    };
  } catch {
    return {
      id: file.id,
      name: file.name,
      originalUri: file.uri,
      compressedUri: file.uri,
      originalSize,
      compressedSize: originalSize,
      savingsPercentage: 0,
      error: "Couldn't compress this PDF.",
    };
  }
}

/**
 * Compresses multiple PDFs sequentially to minimize memory load on Android.
 */
export async function compressPDFsBatch(
  files: SelectedFile[],
  presetKey: PDFPresetKey = "balanced",
  onProgress?: (progress: PDFCompressionProgress) => void
): Promise<PDFCompressionResult[]> {
  const results: PDFCompressionResult[] = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round((i / total) * 100),
        currentFileName: file.name,
        stage: `Processing PDF ${i + 1} of ${total}...`,
      });
    }

    const result = await compressPDF(file, presetKey, (singleProgress) => {
      if (onProgress) {
        const itemFraction = singleProgress.percentage / 100;
        const overall = Math.round(((i + itemFraction) / total) * 100);
        onProgress({
          current: i + 1,
          total,
          percentage: overall,
          currentFileName: file.name,
          stage: singleProgress.stage,
        });
      }
    });

    results.push(result);
  }

  return results;
}

