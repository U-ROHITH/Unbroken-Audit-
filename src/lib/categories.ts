import type { Category } from '@/types/db';

export interface CategoryMeta {
  key: Category;
  label: string;
  emoji: string;
  color: string; // hex — used in card + bars
  text: string; // tailwind text class
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  productive: { key: 'productive', label: 'Productive', emoji: '⚡', color: '#e8503a', text: 'text-accent' },
  sleep: { key: 'sleep', label: 'Sleep', emoji: '😴', color: '#3b5bdb', text: 'text-accent-sleep' },
  other: { key: 'other', label: 'Other', emoji: '🌀', color: '#f08c00', text: 'text-accent-other' },
};

export const UNACCOUNTED_COLOR = '#ebeae8';

export const CATEGORY_ORDER: Category[] = ['productive', 'sleep', 'other'];
