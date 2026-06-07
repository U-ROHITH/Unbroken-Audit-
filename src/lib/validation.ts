import { z } from 'zod';
import { CATEGORIES } from '@/types/db';

const hhmm = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, 'Use HH:mm')
  .refine((v) => {
    const [h, m] = v.split(':').map(Number);
    return h! <= 23 && m! <= 59;
  }, 'Invalid time');

export const entryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Keep it under 120 chars'),
  startTime: hhmm,
  endTime: hhmm,
  category: z.enum(CATEGORIES as [string, ...string[]]),
});
export type EntryFormValues = z.infer<typeof entryFormSchema>;

export const windowFormSchema = z.object({
  startTime: hhmm,
  endTime: hhmm,
});
export type WindowFormValues = z.infer<typeof windowFormSchema>;

export const dayMetaSchema = z.object({
  title: z.string().trim().max(120).optional(),
  summary: z.string().trim().max(280).optional(),
  hashtag: z.string().trim().max(160).optional(),
});
export type DayMetaValues = z.infer<typeof dayMetaSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type Credentials = z.infer<typeof credentialsSchema>;

export const emailOnlySchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

export const profileSchema = z.object({
  display_name: z.string().trim().max(60).optional(),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]{3,24}$/, '3–24 letters, numbers or _')
    .optional()
    .or(z.literal('')),
  timezone: z.string().min(1),
  default_window_start: hhmm,
  default_window_minutes: z.number().int().min(60).max(1800),
});
export type ProfileValues = z.infer<typeof profileSchema>;
