// Time logic — see spec §4.1 (duration & past-midnight), §4.3 (window bounds), §7 (timezones).
//
// Two layers:
//  1. Instant-based pure helpers (tz-agnostic) — the source of truth, fully unit-tested.
//  2. Timezone-aware clock<->instant resolvers built on date-fns-tz — used at the UI/DB boundary.

import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export const MINUTE_MS = 60_000;
export const DAY_MS = 24 * 60 * MINUTE_MS;

/** Whole minutes between two instants (floored). Naturally positive across midnight. */
export function durationMinutes(startAt: Date | string, endAt: Date | string): number {
  const s = toDate(startAt).getTime();
  const e = toDate(endAt).getTime();
  return Math.floor((e - s) / MINUTE_MS);
}

/** True when [start, end) is fully inside [windowStart, windowEnd) and non-empty. */
export function isWithinWindow(
  startAt: Date | string,
  endAt: Date | string,
  windowStart: Date | string,
  windowEnd: Date | string,
): boolean {
  const s = toDate(startAt).getTime();
  const e = toDate(endAt).getTime();
  const ws = toDate(windowStart).getTime();
  const we = toDate(windowEnd).getTime();
  return e > s && s >= ws && e <= we;
}

/** Window length in whole minutes. */
export function windowMinutes(windowStart: Date | string, windowEnd: Date | string): number {
  return durationMinutes(windowStart, windowEnd);
}

/**
 * Resolve a user-entered clock time ('HH:mm', wall-clock in `tz`) to an instant that
 * falls at or after `anchor`, within the next 24h. Past-midnight handling: if the
 * clock time precedes the anchor's clock time, it rolls to the next day (§4.1).
 */
export function resolveClockToInstant(
  anchor: Date | string,
  hhmm: string,
  tz: string,
): Date {
  const anchorDate = toDate(anchor);
  const localDay = formatInTimeZone(anchorDate, tz, 'yyyy-MM-dd');
  let candidate = fromZonedTime(`${localDay}T${normalizeHHmm(hhmm)}:00`, tz);
  // roll forward day-by-day until we're at/after the anchor (handles DST cleanly)
  let guard = 0;
  while (candidate.getTime() < anchorDate.getTime() && guard < 3) {
    const nextDay = formatInTimeZone(
      new Date(candidate.getTime() + DAY_MS),
      tz,
      'yyyy-MM-dd',
    );
    candidate = fromZonedTime(`${nextDay}T${normalizeHHmm(hhmm)}:00`, tz);
    guard += 1;
  }
  return candidate;
}

/**
 * Build a day window from a local date, default start clock time and length in minutes.
 * `local_date` (§7) is the date the window *starts* in the user's tz.
 */
export function buildWindow(
  localDate: string,
  startHHmm: string,
  lengthMinutes: number,
  tz: string,
): { window_start: string; window_end: string; local_date: string } {
  const start = fromZonedTime(`${localDate}T${normalizeHHmm(startHHmm)}:00`, tz);
  const end = new Date(start.getTime() + lengthMinutes * MINUTE_MS);
  return {
    window_start: start.toISOString(),
    window_end: end.toISOString(),
    local_date: localDate,
  };
}

/** The local calendar date (yyyy-MM-dd) for an instant in the given tz. */
export function localDateOf(instant: Date | string, tz: string): string {
  return formatInTimeZone(toDate(instant), tz, 'yyyy-MM-dd');
}

/** 'yyyy-MM-dd' of "today" in the user's tz. */
export function todayLocalDate(tz: string, now: Date = new Date()): string {
  return formatInTimeZone(now, tz, 'yyyy-MM-dd');
}

/** Format an instant as a wall-clock time label, e.g. '7:05 AM', in the user's tz. */
export function formatClock(instant: Date | string, tz: string): string {
  return formatInTimeZone(toDate(instant), tz, 'h:mm a');
}

/** Human duration: 90 -> '1h 30m', 45 -> '45m', 120 -> '2h'. */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

function normalizeHHmm(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error(`Invalid time "${hhmm}", expected HH:mm`);
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh > 23 || mm > 59) throw new Error(`Invalid time "${hhmm}"`);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}
