export type ImagePresetKey = "high" | "balanced" | "maximum";

export const IMAGE_PRESETS = {
  high: 0.85,
  balanced: 0.7,
  maximum: 0.5,
} as const;

export const IMAGE_PRESET_DETAILS: Record<
  ImagePresetKey,
  { key: ImagePresetKey; title: string; subtitle: string; quality: number }
> = {
  high: {
    key: "high",
    title: "High",
    subtitle: "Best quality",
    quality: IMAGE_PRESETS.high,
  },
  balanced: {
    key: "balanced",
    title: "Balanced",
    subtitle: "Recommended",
    quality: IMAGE_PRESETS.balanced,
  },
  maximum: {
    key: "maximum",
    title: "Maximum",
    subtitle: "Smallest file",
    quality: IMAGE_PRESETS.maximum,
  },
};

export type PDFPresetKey = "high" | "balanced" | "maximum";

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

export const PDF_PRESET_DETAILS: Record<
  PDFPresetKey,
  { key: PDFPresetKey; title: string; subtitle: string; imageQuality: number }
> = {
  high: {
    key: "high",
    title: "High",
    subtitle: "Better quality",
    imageQuality: PDF_PRESETS.high.imageQuality,
  },
  balanced: {
    key: "balanced",
    title: "Balanced",
    subtitle: "Recommended",
    imageQuality: PDF_PRESETS.balanced.imageQuality,
  },
  maximum: {
    key: "maximum",
    title: "Maximum",
    subtitle: "Smallest file",
    imageQuality: PDF_PRESETS.maximum.imageQuality,
  },
};
