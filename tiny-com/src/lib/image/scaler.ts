/**
 * Pure helper module for calculating target dimensions while preserving aspect ratio.
 */

export interface TargetDimensions {
  width: number;
  height: number;
}

/**
 * Calculates resized dimensions constrained by a max edge limit.
 * Never upscales images that are already smaller than the target max dimension.
 *
 * @param originalWidth - Width of the original image in pixels
 * @param originalHeight - Height of the original image in pixels
 * @param maxDimension - Maximum allowed width or height in pixels
 * @returns TargetDimensions or null if no resize is required
 */
export function computeTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension?: number
): TargetDimensions | null {
  if (!maxDimension || maxDimension <= 0) {
    return null;
  }

  if (originalWidth <= 0 || originalHeight <= 0) {
    return null;
  }

  // Already smaller than or equal to max dimension — no scaling needed
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return null;
  }

  if (originalWidth >= originalHeight) {
    // Landscape or square
    const scaleFactor = maxDimension / originalWidth;
    return {
      width: maxDimension,
      height: Math.max(1, Math.round(originalHeight * scaleFactor)),
    };
  } else {
    // Portrait
    const scaleFactor = maxDimension / originalHeight;
    return {
      width: Math.max(1, Math.round(originalWidth * scaleFactor)),
      height: maxDimension,
    };
  }
}
