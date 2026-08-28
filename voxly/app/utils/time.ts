/**
 * Formats a duration in milliseconds into a standard M:SS string.
 * Example:
 *    0      -> "0:00"
 *    1000   -> "0:01"
 *    65000  -> "1:05"
 *    125000 -> "2:05"
 */
export function formatDuration(milliseconds: number): string {
  const safeMs = Math.max(0, isNaN(milliseconds) ? 0 : milliseconds);
  const totalSeconds = Math.floor(safeMs / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

