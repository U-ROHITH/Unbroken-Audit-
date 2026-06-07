import { describe, it, expect } from 'vitest';
import { friendlyDbError } from './errors';

describe('friendlyDbError', () => {
  it('maps the overlap exclusion violation', () => {
    expect(friendlyDbError({ code: '23P01' })).toMatch(/overlaps/);
    expect(friendlyDbError({ message: 'conflicting key value violates exclusion constraint "entries_no_overlap"' }))
      .toMatch(/overlaps/);
  });

  it('maps the window-bounds trigger message', () => {
    expect(friendlyDbError({ message: 'This entry falls outside your day window' })).toMatch(
      /outside your day window/,
    );
  });

  it('maps unique violations by column', () => {
    expect(friendlyDbError({ code: '23505', message: 'duplicate key ... local_date' })).toMatch(
      /already have a day/,
    );
    expect(friendlyDbError({ code: '23505', message: 'duplicate key ... username' })).toMatch(/taken/);
  });

  it('maps time-order checks', () => {
    expect(friendlyDbError({ message: 'entries_time_order' })).toMatch(/after the start/);
  });

  it('falls back to the raw message, then a default', () => {
    expect(friendlyDbError({ message: 'Some weird error' })).toBe('Some weird error');
    expect(friendlyDbError(null)).toBe('Something went wrong.');
  });
});
