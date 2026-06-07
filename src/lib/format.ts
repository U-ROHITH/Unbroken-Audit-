import type { DayWithEntries } from '@/types/db';

/** Caption for the "copy caption" button: title + summary + hashtag. */
export function buildCaption(day: Pick<DayWithEntries, 'title' | 'summary' | 'hashtag'>): string {
  const parts: string[] = [];
  if (day.title?.trim()) parts.push(day.title.trim());
  if (day.summary?.trim()) parts.push(day.summary.trim());
  if (day.hashtag?.trim()) parts.push(normalizeHashtags(day.hashtag));
  return parts.join('\n\n');
}

/** Ensure each token in a hashtag string is prefixed with '#'. */
export function normalizeHashtags(raw: string): string {
  return raw
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ');
}

/** Export filename, e.g. 'progress-day-07.png'. */
export function cardFilename(dayNumber: number | undefined): string {
  const n = dayNumber && dayNumber > 0 ? dayNumber : 1;
  return `progress-day-${String(n).padStart(2, '0')}.png`;
}
