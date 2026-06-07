// Overlap detection (spec §4.2). Half-open intervals [start, end): touching edges
// (e.g. 9:00–10:00 and 10:00–11:00) do NOT overlap. Client-side mirror of the DB
// EXCLUDE constraint, for instant feedback.

export interface Interval {
  id?: string;
  start_at: string | Date;
  end_at: string | Date;
}

function ms(v: string | Date): number {
  return (v instanceof Date ? v : new Date(v)).getTime();
}

/** Do two half-open intervals intersect? */
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return ms(a.start_at) < ms(b.end_at) && ms(b.start_at) < ms(a.end_at);
}

/**
 * Return the first existing entry that overlaps `candidate`, or null.
 * Entries sharing `candidate.id` (i.e. the row being edited) are ignored.
 */
export function findOverlap(candidate: Interval, existing: Interval[]): Interval | null {
  for (const e of existing) {
    if (candidate.id && e.id === candidate.id) continue;
    if (intervalsOverlap(candidate, e)) return e;
  }
  return null;
}
