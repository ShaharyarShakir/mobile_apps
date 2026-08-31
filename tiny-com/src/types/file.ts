export type CompressionFileType = "image" | "pdf";

export type SelectedFile = {
  id: string;
  uri: string;
  name: string;
  size?: number;
  type: CompressionFileType;
  mimeType?: string;
};

export type CompressionResult = {
  id: string;
  name: string;
  originalUri: string;
  compressedUri?: string;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
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
