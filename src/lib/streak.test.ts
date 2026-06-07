import { describe, it, expect } from 'vitest';
import { computeStreaks } from './streak';

describe('computeStreaks', () => {
  const today = '2026-06-07';

  it('returns zeros with no logged days', () => {
    expect(computeStreaks([], today)).toEqual({ current: 0, max: 0, total: 0 });
  });

  it('counts a current streak ending today', () => {
    const r = computeStreaks(['2026-06-05', '2026-06-06', '2026-06-07'], today);
    expect(r.current).toBe(3);
    expect(r.max).toBe(3);
    expect(r.total).toBe(3);
  });

  it('keeps the streak alive if today not yet logged but yesterday was', () => {
    const r = computeStreaks(['2026-06-05', '2026-06-06'], today);
    expect(r.current).toBe(2);
  });

  it('resets current streak after a skipped day while max persists (§ Phase 5 verify)', () => {
    // a 4-day run, then a gap, then 1 day today
    const dates = [
      '2026-05-01',
      '2026-05-02',
      '2026-05-03',
      '2026-05-04', // max run = 4
      // gap
      '2026-06-07', // today, isolated
    ];
    const r = computeStreaks(dates, today);
    expect(r.max).toBe(4);
    expect(r.current).toBe(1);
    expect(r.total).toBe(5);
  });

  it('current streak is 0 when the latest log is older than yesterday', () => {
    const r = computeStreaks(['2026-06-01', '2026-06-02'], today);
    expect(r.current).toBe(0);
    expect(r.max).toBe(2);
  });

  it('dedupes repeated dates and ignores future dates', () => {
    const r = computeStreaks(
      ['2026-06-06', '2026-06-06', '2026-06-07', '2026-12-31'],
      today,
    );
    expect(r.total).toBe(2);
    expect(r.current).toBe(2);
  });

  it('handles an unsorted input', () => {
    const r = computeStreaks(['2026-06-07', '2026-06-05', '2026-06-06'], today);
    expect(r.current).toBe(3);
  });

  it('rejects malformed dates', () => {
    expect(() => computeStreaks(['not-a-date'], today)).toThrow();
  });
});
