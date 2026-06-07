// Map Postgres / Supabase errors to friendly, user-facing messages (spec §10).

interface PgLikeError {
  message?: string;
  code?: string;
  details?: string;
}

export function friendlyDbError(err: unknown, fallback = 'Something went wrong.'): string {
  const e = err as PgLikeError | null;
  const msg = e?.message ?? '';

  if (e?.code === '23P01' || /entries_no_overlap|exclusion/i.test(msg)) {
    return 'That time overlaps an existing entry.';
  }
  if (/outside your day window/i.test(msg)) {
    return 'This entry falls outside your day window.';
  }
  if (e?.code === '23505' || /duplicate key|unique/i.test(msg)) {
    if (/local_date/i.test(msg)) return 'You already have a day for this date.';
    if (/username/i.test(msg)) return 'That username is taken.';
    return 'That value must be unique.';
  }
  if (/end must be after start|entries_time_order|days_window_order/i.test(msg)) {
    return 'End time must be after the start time.';
  }
  if (e?.code === '23514' || /check constraint/i.test(msg)) {
    return 'One of the values is invalid.';
  }
  return msg || fallback;
}
