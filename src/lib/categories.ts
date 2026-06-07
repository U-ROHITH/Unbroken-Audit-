import { Zap, Moon, Orbit, type LucideIcon } from 'lucide-react';
import type { Category } from '@/types/db';

export interface CategoryMeta {
  key: Category;
  label: string;
  Icon: LucideIcon;
  color: string; // hex — bars, chips, card
  tint: string; // translucent fill for soft chips
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  productive: { key: 'productive', label: 'Productive', Icon: Zap, color: '#e8503a', tint: 'rgba(232,80,58,0.12)' },
  sleep: { key: 'sleep', label: 'Sleep', Icon: Moon, color: '#3b5bdb', tint: 'rgba(59,91,219,0.12)' },
  other: { key: 'other', label: 'Other', Icon: Orbit, color: '#f08c00', tint: 'rgba(240,140,0,0.12)' },
};

export const UNACCOUNTED_COLOR = '#ebeae8';

export const CATEGORY_ORDER: Category[] = ['productive', 'sleep', 'other'];
