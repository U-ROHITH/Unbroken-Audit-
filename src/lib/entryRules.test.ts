import { describe, it, expect } from 'vitest';
import { validateEntry } from './entryRules';

const guard = {
  window_start: '2026-01-01T01:30:00Z', // 7:00 IST
  window_end: '2026-01-02T01:30:00Z',
  siblings: [
    { id: 'a', start_at: '2026-01-01T03:30:00Z', end_at: '2026-01-01T05:30:00Z' },
  ],
};

describe('validateEntry', () => {
  it('accepts a valid entry in a free slot', () => {
    expect(
      validateEntry(
        { start_at: '2026-01-01T06:00:00Z', end_at: '2026-01-01T07:00:00Z' },
        guard,
      ),
    ).toBeNull();
  });

  it('rejects end before start', () => {
    expect(
      validateEntry(
        { start_at: '2026-01-01T07:00:00Z', end_at: '2026-01-01T06:00:00Z' },
        guard,
      ),
    ).toMatch(/after the start/);
  });

  it('rejects an entry outside the window', () => {
    expect(
      validateEntry(
        { start_at: '2026-01-01T00:00:00Z', end_at: '2026-01-01T01:00:00Z' },
        guard,
      ),
    ).toMatch(/outside your day window/);
  });

  it('rejects an overlapping entry', () => {
    expect(
      validateEntry(
        { start_at: '2026-01-01T04:00:00Z', end_at: '2026-01-01T04:30:00Z' },
        guard,
      ),
    ).toMatch(/overlaps/);
  });

  it('allows editing the same row without self-overlap', () => {
    expect(
      validateEntry(
        { id: 'a', start_at: '2026-01-01T03:30:00Z', end_at: '2026-01-01T05:30:00Z' },
        guard,
      ),
    ).toBeNull();
  });
});
