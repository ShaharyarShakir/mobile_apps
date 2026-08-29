/**
 * Formats a duration in seconds into a standard MM:SS string.
 * Example: 75 -> "01:15"
 */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const secs = (safeSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

/**
 * Formats a byte count into a human-readable file size string.
 * Example: 131072 -> "128 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = (bytes / Math.pow(1024, index)).toFixed(1);
  return `${size} ${units[index]}`;
}

/**
 * Formats a timestamp into a readable date string.
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

