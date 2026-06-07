import { describe, it, expect } from 'vitest';
import {
  entryFormSchema,
  credentialsSchema,
  profileSchema,
  dayMetaSchema,
} from './validation';

describe('entryFormSchema', () => {
  it('accepts a valid entry', () => {
    expect(
      entryFormSchema.safeParse({
        name: 'Deep work',
        startTime: '09:00',
        endTime: '11:30',
        category: 'productive',
      }).success,
    ).toBe(true);
  });

  it('rejects an empty name and bad time', () => {
    expect(entryFormSchema.safeParse({ name: '', startTime: '9:00', endTime: '25:00', category: 'productive' }).success).toBe(false);
  });

  it('rejects an unknown category', () => {
    expect(
      entryFormSchema.safeParse({ name: 'x', startTime: '09:00', endTime: '10:00', category: 'play' }).success,
    ).toBe(false);
  });
});

describe('credentialsSchema', () => {
  it('requires a valid email and 8+ char password', () => {
    expect(credentialsSchema.safeParse({ email: 'a@b.com', password: '12345678' }).success).toBe(true);
    expect(credentialsSchema.safeParse({ email: 'nope', password: '123' }).success).toBe(false);
  });
});

describe('profileSchema', () => {
  it('accepts a valid profile', () => {
    expect(
      profileSchema.safeParse({
        display_name: 'Rohith',
        username: 'rohith_09',
        timezone: 'Asia/Kolkata',
        default_window_start: '07:00',
        default_window_minutes: 1440,
      }).success,
    ).toBe(true);
  });

  it('rejects an out-of-range window length', () => {
    expect(
      profileSchema.safeParse({
        timezone: 'UTC',
        default_window_start: '07:00',
        default_window_minutes: 5,
      }).success,
    ).toBe(false);
  });
});

describe('dayMetaSchema', () => {
  it('accepts optional fields', () => {
    expect(dayMetaSchema.safeParse({}).success).toBe(true);
  });
});
