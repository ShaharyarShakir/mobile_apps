export type CompressionFileType = "image" | "pdf";

export type SelectedFile = {
  id: string;
  uri: string;
  name: string;
  size?: number;
  width?: number;
  height?: number;
  type: CompressionFileType;
  mimeType?: string;
};

export type ImageResolutionKey = "original" | "2k" | "1080p" | "720p";

export type ImageCompressionConfig = {
  quality: number;
  maxDimension?: number;
  resolutionPreset?: ImageResolutionKey;
};

export type CompressionResult = {
  id: string;
  name: string;
  originalUri: string;
  compressedUri?: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  isAlreadyOptimized?: boolean;
  optimizationNote?: string;
  error?: string;
};

export type CompressionProgress = {
  current: number;
  total: number;
  percentage: number;
  currentFileName: string;
};

export type PDFCompressionResult = {
  id: string;
  name: string;
  originalUri: string;
  compressedUri?: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  isAlreadyOptimized?: boolean;
  optimizationNote?: string;
  error?: string;
};

export type PDFCompressionProgress = {
  current: number;
  total: number;
  percentage: number;
  currentFileName: string;
  stage?: string;
};
