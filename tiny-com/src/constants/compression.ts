export type CompressionPresetKey = "high" | "balanced" | "maximum";
export type ImagePresetKey = CompressionPresetKey;
export type PDFPresetKey = CompressionPresetKey;
export type ImageResolutionKey = "original" | "2k" | "1080p" | "720p";

export interface ResolutionPreset {
  key: ImageResolutionKey;
  label: string;
  subtitle: string;
  maxDimension?: number;
}

export const RESOLUTION_PRESETS: Record<ImageResolutionKey, ResolutionPreset> = {
  original: {
    key: "original",
    label: "Original",
    subtitle: "Same pixels",
    maxDimension: undefined,
  },
  "2k": {
    key: "2k",
    label: "2K",
    subtitle: "2048px",
    maxDimension: 2048,
  },
  "1080p": {
    key: "1080p",
    label: "1080p",
    subtitle: "1080px (Best for chat)",
    maxDimension: 1080,
  },
  "720p": {
    key: "720p",
    label: "720p",
    subtitle: "720px (Smallest)",
    maxDimension: 720,
  },
};

export const PRESET_OPTIONS: Record<
  CompressionPresetKey,
  { key: CompressionPresetKey; title: string; subtitle: string; imageQuality: number }
> = {
  high: {
    key: "high",
    title: "High",
    subtitle: "Better quality",
    imageQuality: 0.85,
  },
  balanced: {
    key: "balanced",
    title: "Balanced",
    subtitle: "Recommended",
    imageQuality: 0.7,
  },
  maximum: {
    key: "maximum",
    title: "Maximum",
    subtitle: "Smallest size",
    imageQuality: 0.5,
  },
};

export const IMAGE_PRESETS = {
  high: 0.85,
  balanced: 0.7,
  maximum: 0.5,
} as const;

export const IMAGE_PRESET_DETAILS = PRESET_OPTIONS;

export const PDF_PRESETS = {
  high: {
    imageQuality: 0.85,
  },
  balanced: {
    imageQuality: 0.7,
  },
  maximum: {
    imageQuality: 0.5,
  },
} as const;

export const PDF_PRESET_DETAILS = PRESET_OPTIONS;

