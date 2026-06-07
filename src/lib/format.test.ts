import { describe, it, expect } from 'vitest';
import { buildCaption, normalizeHashtags, cardFilename } from './format';

describe('normalizeHashtags', () => {
  it('prefixes bare tokens with #', () => {
    expect(normalizeHashtags('buildinpublic 100daysofcode')).toBe('#buildinpublic #100daysofcode');
  });
  it('keeps existing # and splits on commas', () => {
    expect(normalizeHashtags('#a, b')).toBe('#a #b');
  });
  it('ignores empties', () => {
    expect(normalizeHashtags('   ')).toBe('');
  });
});

describe('buildCaption', () => {
  it('joins title, summary and hashtags', () => {
    const c = buildCaption({ title: 'Day 1', summary: 'Great day', hashtag: 'win' });
    expect(c).toBe('Day 1\n\nGreat day\n\n#win');
  });
  it('omits missing parts', () => {
    expect(buildCaption({ title: 'Solo', summary: null, hashtag: null })).toBe('Solo');
  });
  it('returns empty string when nothing is set', () => {
    expect(buildCaption({ title: null, summary: null, hashtag: null })).toBe('');
  });
});

describe('cardFilename', () => {
  it('zero-pads the day number', () => {
    expect(cardFilename(7)).toBe('progress-day-07.png');
    expect(cardFilename(42)).toBe('progress-day-42.png');
  });
  it('defaults to day 01 for missing/invalid', () => {
    expect(cardFilename(undefined)).toBe('progress-day-01.png');
    expect(cardFilename(0)).toBe('progress-day-01.png');
  });
});
