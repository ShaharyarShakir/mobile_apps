export const COMPRESSION_PRESETS = {
  high: {
    label: "High",
    quality: 0.85,
  },
  balanced: {
    label: "Balanced",
    quality: 0.7,
  },
  maximum: {
    label: "Maximum",
    quality: 0.5,
  },
} as const;

export type CompressionPresetKey = keyof typeof COMPRESSION_PRESETS;

