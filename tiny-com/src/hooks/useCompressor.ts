import { useCallback, useRef, useState } from "react";
import { compressSingleImage } from "../lib/compressor";
import { cleanupTempFiles } from "../lib/fileService";
import type { CompressionResult, SelectedImage } from "../types/image";

export type UseCompressorReturn = {
  isCompressing: boolean;
  isComplete: boolean;
  current: number;
  total: number;
  progress: number;
  results: CompressionResult[];
  error: string | null;
  currentFilename: string | null;
  startCompression: (
    images: SelectedImage[],
    quality: number
  ) => Promise<CompressionResult[]>;
  reset: () => void;
  cancel: () => void;
};

export function useCompressor(): UseCompressorReturn {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);

  const isCancelledRef = useRef(false);
  const previousTempUrisRef = useRef<string[]>([]);

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    setIsCompressing(false);
  }, []);

  const reset = useCallback(() => {
    isCancelledRef.current = false;
    setIsCompressing(false);
    setIsComplete(false);
    setCurrent(0);
    setTotal(0);
    setProgress(0);
    setError(null);
    setCurrentFilename(null);
    setResults([]);
  }, []);

  const startCompression = useCallback(
    async (
      images: SelectedImage[],
      quality: number
    ): Promise<CompressionResult[]> => {
      if (!images || images.length === 0) {
        return [];
      }

      // Cleanup any previous compressed temp files if re-running
      if (previousTempUrisRef.current.length > 0) {
        cleanupTempFiles(previousTempUrisRef.current).catch(() => {});
        previousTempUrisRef.current = [];
      }

      isCancelledRef.current = false;
      setIsCompressing(true);
      setIsComplete(false);
      setError(null);
      setTotal(images.length);
      setCurrent(0);
      setProgress(0);
      setResults([]);

      const accumulatedResults: CompressionResult[] = [];
      const generatedTempUris: string[] = [];

      try {
        for (let i = 0; i < images.length; i++) {
          if (isCancelledRef.current) {
            break;
          }

          const image = images[i];
          setCurrent(i + 1);
          setCurrentFilename(image.filename);
          // Set progress at start of item
          setProgress(i / images.length);

          // Allow the UI thread to update frame before CPU-heavy operation
          await new Promise((resolve) => setTimeout(resolve, 10));

          const result = await compressSingleImage(image, quality);

          if (result.compressedUri) {
            generatedTempUris.push(result.compressedUri);
          }

          accumulatedResults.push(result);
          setResults([...accumulatedResults]);
          setProgress((i + 1) / images.length);

          // Yield briefly after finishing an item
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        previousTempUrisRef.current = generatedTempUris;

        if (!isCancelledRef.current) {
          setIsComplete(true);
        }

        return accumulatedResults;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during compression.";
        setError(errorMsg);
        return accumulatedResults;
      } finally {
        setIsCompressing(false);
        setCurrentFilename(null);
      }
    },
    []
  );

  return {
    isCompressing,
    isComplete,
    current,
    total,
    progress,
    results,
    error,
    currentFilename,
    startCompression,
    reset,
    cancel,
  };
}

