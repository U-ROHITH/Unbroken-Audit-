import { describe, it, expect } from 'vitest';
import { computeBreakdown, pctLabel } from './breakdown';
import type { Category } from '@/types/db';

const e = (category: Category, duration_minutes: number) => ({ category, duration_minutes });

describe('computeBreakdown', () => {
  it('sums minutes per category and computes % of the window', () => {
    const b = computeBreakdown(
      [e('productive', 480), e('sleep', 420), e('other', 120)],
      1440,
    );
    expect(b.productiveMinutes).toBe(480);
    expect(b.sleepMinutes).toBe(420);
    expect(b.otherMinutes).toBe(120);
    expect(b.windowMinutes).toBe(1440);
    expect(Math.round(b.productivePct)).toBe(33);
  });

  it('leaves gaps unaccounted (categories may sum to < 100%)', () => {
    const b = computeBreakdown([e('productive', 600)], 1440);
    expect(b.unaccountedMinutes).toBe(840);
    expect(Math.round(b.productivePct + b.unaccountedPct)).toBe(100);
  });

  it('uses the user-defined window, not a forced 24h', () => {
    // an 8h (480m) window fully productive => 100%
    const b = computeBreakdown([e('productive', 480)], 480);
    expect(Math.round(b.productivePct)).toBe(100);
    expect(b.unaccountedMinutes).toBe(0);
  });

  it('guards against a zero-length window', () => {
    const b = computeBreakdown([e('productive', 60)], 0);
    expect(b.productivePct).toBe(0);
    expect(b.unaccountedMinutes).toBe(0);
  });

  it('handles no entries', () => {
    const b = computeBreakdown([], 1440);
    expect(b.unaccountedMinutes).toBe(1440);
    expect(b.productivePct).toBe(0);
  });
});

describe('pctLabel', () => {
  it('rounds to an integer', () => {
    expect(pctLabel(33.33)).toBe(33);
    expect(pctLabel(66.66)).toBe(67);
  });
});
