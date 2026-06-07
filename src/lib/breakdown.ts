// Category breakdown (spec §4.4, §4.5). Percentages are of the user-defined window,
// NOT a forced 24h. Unlogged gaps are intentionally left unaccounted, so the three
// categories can sum to < 100%.

import type { Category, EntryRow } from '@/types/db';

export interface Breakdown {
  productiveMinutes: number;
  sleepMinutes: number;
  otherMinutes: number;
  windowMinutes: number;
  unaccountedMinutes: number;
  productivePct: number;
  sleepPct: number;
  otherPct: number;
  unaccountedPct: number;
}

type MinutesByCategory = Pick<EntryRow, 'category' | 'duration_minutes'>;

export function computeBreakdown(
  entries: MinutesByCategory[],
  windowMinutes: number,
): Breakdown {
  const sums: Record<Category, number> = { productive: 0, sleep: 0, other: 0 };
  for (const e of entries) {
    sums[e.category] += Math.max(0, e.duration_minutes);
  }

  const win = Math.max(0, windowMinutes);
  const accounted = sums.productive + sums.sleep + sums.other;
  const unaccountedMinutes = Math.max(0, win - accounted);
  const pct = (m: number) => (win === 0 ? 0 : (m / win) * 100);

  return {
    productiveMinutes: sums.productive,
    sleepMinutes: sums.sleep,
    otherMinutes: sums.other,
    windowMinutes: win,
    unaccountedMinutes,
    productivePct: pct(sums.productive),
    sleepPct: pct(sums.sleep),
    otherPct: pct(sums.other),
    unaccountedPct: pct(unaccountedMinutes),
  };
}

/** Rounded integer percent for display, e.g. 42. */
export function pctLabel(value: number): number {
  return Math.round(value);
}
