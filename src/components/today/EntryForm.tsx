import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TimeField } from '@/components/ui/TimeField';
import { Chips } from '@/components/ui/Chips';
import { useToast } from '@/components/ui/Toast';
import { entryFormSchema, type EntryFormValues } from '@/lib/validation';
import { validateEntry } from '@/lib/entryRules';
import { resolveClockToInstant, durationMinutes, formatDuration } from '@/lib/time';
import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/categories';
import type { Category, EntryRow } from '@/types/db';

interface Props {
  tz: string;
  windowStart: string;
  windowEnd: string;
  siblings: EntryRow[];
  editing?: EntryRow | null;
  onCancelEdit?: () => void;
  onSubmit: (input: {
    id?: string;
    name: string;
    start_at: string;
    end_at: string;
    category: Category;
  }) => Promise<void>;
}

const DURATIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];

function addMinutesToClock(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h! * 60 + m! + mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function EntryForm({
  tz,
  windowStart,
  windowEnd,
  siblings,
  editing,
  onCancelEdit,
  onSubmit,
}: Props) {
  const { error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const windowStartHHmm = useMemo(() => toHHmm(windowStart, tz), [windowStart, tz]);

  const defaults = useMemo<EntryFormValues>(
    () => ({
      name: editing?.name ?? '',
      startTime: editing ? toHHmm(editing.start_at, tz) : '',
      endTime: editing ? toHHmm(editing.end_at, tz) : '',
      category: editing?.category ?? 'productive',
    }),
    [editing, tz],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EntryFormValues>({ resolver: zodResolver(entryFormSchema), defaultValues: defaults });

  useEffect(() => reset(defaults), [defaults, reset]);

  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const category = watch('category') as Category;

  const livePreview = useMemo(() => {
    if (!startTime || !endTime) return null;
    try {
      const s = resolveClockToInstant(windowStart, startTime, tz);
      const e = resolveClockToInstant(s, endTime, tz);
      return { mins: durationMinutes(s, e) };
    } catch {
      return null;
    }
  }, [startTime, endTime, windowStart, tz]);

  const applyDuration = (mins: number) => {
    const base = startTime || windowStartHHmm;
    setValue('startTime', base, { shouldDirty: true });
    setValue('endTime', addMinutesToClock(base, mins), { shouldDirty: true });
  };

  const submit = handleSubmit(async (values) => {
    let s: Date;
    let e: Date;
    try {
      s = resolveClockToInstant(windowStart, values.startTime, tz);
      e = resolveClockToInstant(s, values.endTime, tz);
    } catch {
      error('Enter valid start and end times.');
      return;
    }
    const payload = { start_at: s.toISOString(), end_at: e.toISOString(), id: editing?.id };
    const problem = validateEntry(payload, { window_start: windowStart, window_end: windowEnd, siblings });
    if (problem) {
      error(problem);
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit({
        id: editing?.id,
        name: values.name.trim(),
        start_at: payload.start_at,
        end_at: payload.end_at,
        category: values.category as Category,
      });
      if (!editing) {
        reset({ name: '', startTime: values.endTime, endTime: '', category: values.category });
      }
    } catch (err) {
      error((err as Error).message || 'Could not save entry.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <input
        {...register('name')}
        placeholder="What did you work on?"
        aria-label="Entry name"
        className="input-base"
      />
      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

      <div className="grid grid-cols-2 gap-2.5">
        <TimeField label="Start" {...register('startTime')} value={startTime} />
        <TimeField label="End" {...register('endTime')} value={endTime} />
      </div>

      <Chips label="Quick duration" chips={DURATIONS} onPick={(v) => applyDuration(Number(v))} />

      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          const active = category === c;
          const Icon = meta.Icon;
          return (
            <motion.button
              key={c}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setValue('category', c, { shouldDirty: true })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[13px] font-medium transition ${
                active ? 'border-transparent text-white' : 'border-line text-ink-2 hover:bg-hover'
              }`}
              style={active ? { backgroundColor: meta.color } : undefined}
            >
              <Icon className="h-4 w-4" />
              {meta.label}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs text-ink-3">
          {livePreview ? `Duration · ${formatDuration(livePreview.mins)}` : 'Pick start & end'}
        </span>
        <div className="flex gap-2">
          {editing && (
            <Button type="button" size="sm" variant="ghost" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" loading={submitting}>
            {editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? 'Save' : 'Add'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function toHHmm(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
