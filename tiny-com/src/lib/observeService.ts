import { Observe } from "expo-observe";

/**
 * Calculates human-readable privacy-safe size buckets.
 * No exact bytes or user file names are ever transmitted.
 */
export function getSizeBucket(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "<1MB";
  if (mb < 5) return "1-5MB";
  if (mb < 10) return "5-10MB";
  if (mb < 25) return "10-25MB";
  if (mb < 50) return "25-50MB";
  return "50MB+";
}

/**
 * Logs compression_started event with privacy-safe metadata.
 */
export function logCompressionStarted(
  fileType: "image" | "pdf",
  preset: string,
  count: number,
  totalBytes: number
): void {
  try {
    Observe.logEvent("compression_started", {
      attributes: {
        file_type: fileType,
        compression_preset: preset,
        file_count: count,
        input_size_bucket: getSizeBucket(totalBytes),
      },
    });
  } catch {
    // Ignore logging failures gracefully
  }
}

/**
 * Logs compression_completed event with duration and size buckets.
 */
export function logCompressionCompleted(
  fileType: "image" | "pdf",
  preset: string,
  count: number,
  inputBytes: number,
  outputBytes: number,
  durationMs: number
): void {
  try {
    Observe.logEvent("compression_completed", {
      attributes: {
        file_type: fileType,
        compression_preset: preset,
        file_count: count,
        input_size_bucket: getSizeBucket(inputBytes),
        output_size_bucket: getSizeBucket(outputBytes),
        duration_ms: Math.round(durationMs),
      },
    });
  } catch {
    // Ignore logging failures gracefully
  }
}

/**
 * Logs compression_failed event.
 */
export function logCompressionFailed(
  fileType: "image" | "pdf",
  preset: string,
  count: number
): void {
  try {
    Observe.logEvent("compression_failed", {
      attributes: {
        file_type: fileType,
        compression_preset: preset,
        file_count: count,
      },
    });
  } catch {
    // Ignore logging failures gracefully
  }
}

/**
 * Logs file_saved event.
 */
export function logFileSaved(fileType: "image" | "pdf", count: number = 1): void {
  try {
    Observe.logEvent("file_saved", {
      attributes: {
        file_type: fileType,
        file_count: count,
      },
    });
  } catch {
    // Ignore logging failures gracefully
  }
}

/**
 * Logs file_shared event.
 */
export function logFileShared(fileType: "image" | "pdf"): void {
  try {
    Observe.logEvent("file_shared", {
      attributes: {
        file_type: fileType,
      },
    });
  } catch {
    // Ignore logging failures gracefully
  }
}
