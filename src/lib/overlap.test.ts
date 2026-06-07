import { describe, it, expect } from 'vitest';
import { intervalsOverlap, findOverlap } from './overlap';

const iv = (s: string, e: string, id?: string) => ({
  start_at: `2026-01-01T${s}:00Z`,
  end_at: `2026-01-01T${e}:00Z`,
  id,
});

describe('intervalsOverlap', () => {
  it('detects a clear overlap', () => {
    expect(intervalsOverlap(iv('09:00', '11:00'), iv('10:00', '12:00'))).toBe(true);
  });

  it('treats touching edges as non-overlapping (half-open)', () => {
    expect(intervalsOverlap(iv('09:00', '10:00'), iv('10:00', '11:00'))).toBe(false);
  });

  it('detects full containment', () => {
    expect(intervalsOverlap(iv('09:00', '12:00'), iv('10:00', '11:00'))).toBe(true);
  });

  it('returns false for fully separate intervals', () => {
    expect(intervalsOverlap(iv('09:00', '10:00'), iv('11:00', '12:00'))).toBe(false);
  });
});

describe('findOverlap', () => {
  const existing = [iv('09:00', '10:00', 'a'), iv('12:00', '13:00', 'b')];

  it('finds the overlapping sibling', () => {
    expect(findOverlap(iv('09:30', '09:45'), existing)?.id).toBe('a');
  });

  it('returns null when there is a free gap', () => {
    expect(findOverlap(iv('10:30', '11:30'), existing)).toBeNull();
  });

  it('ignores the row being edited (same id)', () => {
    expect(findOverlap(iv('09:00', '10:00', 'a'), existing)).toBeNull();
  });
});
