import { describe, it, expect } from 'vitest';
import {
  durationMinutes,
  isWithinWindow,
  windowMinutes,
  resolveClockToInstant,
  buildWindow,
  localDateOf,
  formatDuration,
} from './time';

const TZ = 'Asia/Kolkata'; // UTC+5:30, no DST — good for deterministic tests

describe('durationMinutes', () => {
  it('computes a simple duration', () => {
    expect(durationMinutes('2026-01-01T09:00:00Z', '2026-01-01T10:30:00Z')).toBe(90);
  });

  it('is positive across midnight (real instants)', () => {
    // 23:00 -> 01:00 next day
    expect(durationMinutes('2026-01-01T23:00:00Z', '2026-01-02T01:00:00Z')).toBe(120);
  });

  it('floors partial minutes', () => {
    expect(durationMinutes('2026-01-01T09:00:00Z', '2026-01-01T09:00:59Z')).toBe(0);
  });
});

describe('isWithinWindow', () => {
  const ws = '2026-01-01T01:30:00Z'; // 7:00 IST
  const we = '2026-01-02T01:30:00Z'; // 7:00 IST next day

  it('accepts an entry inside the window', () => {
    expect(isWithinWindow('2026-01-01T03:30:00Z', '2026-01-01T05:30:00Z', ws, we)).toBe(true);
  });

  it('rejects an entry starting before the window', () => {
    expect(isWithinWindow('2026-01-01T00:00:00Z', '2026-01-01T03:00:00Z', ws, we)).toBe(false);
  });

  it('rejects an entry ending after the window', () => {
    expect(isWithinWindow('2026-01-02T00:30:00Z', '2026-01-02T02:00:00Z', ws, we)).toBe(false);
  });

  it('rejects a zero/negative length entry', () => {
    expect(isWithinWindow('2026-01-01T03:30:00Z', '2026-01-01T03:30:00Z', ws, we)).toBe(false);
  });

  it('accepts entries flush with the window edges', () => {
    expect(isWithinWindow(ws, we, ws, we)).toBe(true);
  });
});

describe('windowMinutes', () => {
  it('measures a 24h window as 1440', () => {
    expect(windowMinutes('2026-01-01T01:30:00Z', '2026-01-02T01:30:00Z')).toBe(1440);
  });
});

describe('resolveClockToInstant', () => {
  it('resolves a clock time on the same day after the anchor', () => {
    const anchor = '2026-01-01T01:30:00Z'; // 7:00 IST
    const r = resolveClockToInstant(anchor, '09:00', TZ); // 9:00 IST = 03:30Z
    expect(r.toISOString()).toBe('2026-01-01T03:30:00.000Z');
  });

  it('rolls past-midnight clock times to the next day (§4.1)', () => {
    const anchor = '2026-01-01T01:30:00Z'; // 7:00 IST start of window
    // 01:00 IST is "earlier" than 7:00 -> belongs to the next day
    const r = resolveClockToInstant(anchor, '01:00', TZ); // 01:00 IST next day = 2026-01-01T19:30Z
    expect(r.toISOString()).toBe('2026-01-01T19:30:00.000Z');
    expect(r.getTime()).toBeGreaterThan(new Date(anchor).getTime());
  });

  it('rejects malformed clock input', () => {
    expect(() => resolveClockToInstant('2026-01-01T01:30:00Z', '25:00', TZ)).toThrow();
  });
});

describe('buildWindow', () => {
  it('builds a 24h window anchored to the local date in tz', () => {
    const w = buildWindow('2026-03-10', '07:00', 1440, TZ);
    expect(w.local_date).toBe('2026-03-10');
    // 7:00 IST on 2026-03-10 = 01:30Z
    expect(w.window_start).toBe('2026-03-10T01:30:00.000Z');
    expect(w.window_end).toBe('2026-03-11T01:30:00.000Z');
    expect(windowMinutes(w.window_start, w.window_end)).toBe(1440);
  });
});

describe('localDateOf', () => {
  it('uses the user tz, not UTC, for the calendar date', () => {
    // 2026-01-01T20:00Z is 2026-01-02 01:30 IST -> next day in IST
    expect(localDateOf('2026-01-01T20:00:00Z', TZ)).toBe('2026-01-02');
    expect(localDateOf('2026-01-01T20:00:00Z', 'UTC')).toBe('2026-01-01');
  });
});

describe('formatDuration', () => {
  it.each([
    [45, '45m'],
    [60, '1h'],
    [90, '1h 30m'],
    [120, '2h'],
    [0, '0m'],
  ])('formats %i minutes as %s', (mins, label) => {
    expect(formatDuration(mins)).toBe(label);
  });
});
