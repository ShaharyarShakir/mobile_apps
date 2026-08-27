export type SelectedImage = {
  id: string;
  uri: string;
  filename: string;
  width: number;
  height: number;
  fileSize?: number;
};

export type CompressionResult = {
  id: string;
  originalUri: string;
  compressedUri?: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  savedBytes: number;
  filename: string;
  width?: number;
  height?: number;
  success: boolean;
  error?: string;
};

export type CompressionSummary = {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavedBytes: number;
  overallSavingsPercentage: number;
  successfulCount: number;
  failedCount: number;
};

