import type { JournalEntry } from '../models/journal';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/**
 * Formats an ISO date string into a clean 12-hour time string (e.g. "11:12 AM").
 */
export function formatJournalTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minutesStr} ${ampm}`;
  } catch (e) {
    return '';
  }
}

/**
 * Formats an ISO date string into a human-friendly relative date header (e.g. "Today", "Yesterday", "August 28").
 */
export function formatJournalDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays > 1 && diffDays < 7) {
      return WEEKDAY_NAMES[date.getDay()];
    } else {
      const month = FULL_MONTH_NAMES[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear() !== now.getFullYear() ? `, ${date.getFullYear()}` : '';
      return `${month} ${day}${year}`;
    }
  } catch (e) {
    return '';
  }
}

/**
 * Combines date and time into a single label (e.g. "Today · 11:12 AM").
 */
export function formatJournalHeader(isoDate: string): string {
  const dateLabel = formatJournalDate(isoDate);
  const timeLabel = formatJournalTime(isoDate);
  if (!dateLabel) return timeLabel;
  if (!timeLabel) return dateLabel;
  return `${dateLabel} · ${timeLabel}`;
}

/**
 * Groups journal entries by their uppercase date section header (e.g. "TODAY", "YESTERDAY", "AUGUST 28")
 * preserving chronological order (newest first).
 */
export function groupEntriesByDate(entries: JournalEntry[]): { dateLabel: string; entries: JournalEntry[] }[] {
  const groups: { dateLabel: string; entries: JournalEntry[] }[] = [];
  const map = new Map<string, JournalEntry[]>();

  for (const entry of entries) {
    const rawLabel = formatJournalDate(entry.createdAt) || 'Earlier';
    const label = rawLabel.toUpperCase();
    if (!map.has(label)) {
      map.set(label, []);
      groups.push({ dateLabel: label, entries: map.get(label)! });
    }
    map.get(label)!.push(entry);
  }

  return groups;
}

