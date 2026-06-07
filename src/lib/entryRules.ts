// Pure client-side entry validation — mirror of the DB rules (spec §4.2/§4.3) for
// instant feedback. The DB constraints remain the last line of defense.

import { findOverlap } from './overlap';
import { isWithinWindow } from './time';
import type { EntryRow } from '@/types/db';

export interface WindowGuard {
  window_start: string;
  window_end: string;
  siblings: Pick<EntryRow, 'id' | 'start_at' | 'end_at'>[];
}

export function validateEntry(
  input: { start_at: string; end_at: string; id?: string },
  guard: WindowGuard,
): string | null {
  if (new Date(input.end_at).getTime() <= new Date(input.start_at).getTime()) {
    return 'End time must be after the start time.';
  }
  if (!isWithinWindow(input.start_at, input.end_at, guard.window_start, guard.window_end)) {
    return 'This entry falls outside your day window.';
  }
  if (findOverlap(input, guard.siblings)) {
    return 'That time overlaps an existing entry.';
  }
  return null;
}
