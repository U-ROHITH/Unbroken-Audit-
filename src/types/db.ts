// Database row + domain types for UnbrokenAudit.

export type Category = 'productive' | 'sleep' | 'other';

export const CATEGORIES: Category[] = ['productive', 'sleep', 'other'];

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  timezone: string;
  default_window_start: string; // 'HH:mm'
  default_window_minutes: number;
  created_at: string;
}

export interface DayRow {
  id: string;
  user_id: string;
  local_date: string; // 'yyyy-MM-dd'
  window_start: string; // ISO timestamptz
  window_end: string; // ISO timestamptz
  title: string | null;
  summary: string | null;
  hashtag: string | null;
  productive_minutes: number;
  sleep_minutes: number;
  other_minutes: number;
  window_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface EntryRow {
  id: string;
  day_id: string;
  user_id: string;
  name: string;
  start_at: string; // ISO timestamptz
  end_at: string; // ISO timestamptz
  category: Category;
  duration_minutes: number;
  position: number;
  created_at: string;
}

export interface UserStats {
  current_streak: number;
  max_streak: number;
  total_days: number;
}

// A day with its entries joined — used by the Today/History views and the card.
export interface DayWithEntries extends DayRow {
  entries: EntryRow[];
  day_number?: number;
}
