import { View } from "react-native";

interface BrandLogoProps {
  /**
   * Size of the logo square (default: 48)
   */
  size?: number;
  /**
   * Theme variant: "dark" (white squircle on dark container) or "light" (dark squircle on light container)
   */
  variant?: "dark" | "light";
  className?: string;
}

/**
 * Tiny Compressor Brand Logo
 * Geometric document container being compressed inward by two subtle compression marks.
 */
export function BrandLogo({
  size = 48,
  variant = "dark",
  className = "",
}: BrandLogoProps) {
  const isDark = variant === "dark";
  const containerBg = isDark ? "#09090B" : "#F4F4F5";
  const docBg = isDark ? "#FFFFFF" : "#09090B";
  const markColor = isDark ? "#09090B" : "#FFFFFF";

  const scale = size / 48;

  const docWidth = 24 * scale;
  const docHeight = 28 * scale;
  const docRadius = 6.5 * scale;

  const barWidth = 14 * scale;
  const barHeight = 2 * scale;
  const barRadius = 1 * scale;

  const coreWidth = 8 * scale;
  const coreHeight = 1.8 * scale;
  const coreRadius = 0.9 * scale;

  const arrowSize = 4 * scale;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12 * scale,
        backgroundColor: containerBg,
        alignItems: "center",
        justifyContent: "center",
      }}
      className={className}
      accessibilityRole="image"
      accessibilityLabel="Tiny Compressor logo"
    >
      {/* Document Card */}
      <View
        style={{
          width: docWidth,
          height: docHeight,
          borderRadius: docRadius,
          backgroundColor: docBg,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Top Compression Mark (Bar + Arrow) */}
        <View style={{ alignItems: "center", marginBottom: 1 * scale }}>
          <View
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: barRadius,
              backgroundColor: markColor,
            }}
          />
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: arrowSize,
              borderRightWidth: arrowSize,
              borderTopWidth: arrowSize * 0.9,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: markColor,
            }}
          />
        </View>

        {/* Compressed Center Core */}
        <View
          style={{
            width: coreWidth,
            height: coreHeight,
            borderRadius: coreRadius,
            backgroundColor: markColor,
            marginVertical: 0.8 * scale,
          }}
        />

        {/* Bottom Compression Mark (Arrow + Bar) */}
        <View style={{ alignItems: "center", marginTop: 1 * scale }}>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: arrowSize,
              borderRightWidth: arrowSize,
              borderBottomWidth: arrowSize * 0.9,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: markColor,
            }}
          />
          <View
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: barRadius,
              backgroundColor: markColor,
            }}
          />
        </View>
      </View>
    </View>
  );
}

