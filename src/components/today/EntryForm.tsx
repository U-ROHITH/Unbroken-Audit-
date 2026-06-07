import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    const problem = validateEntry(payload, {
      window_start: windowStart,
      window_end: windowEnd,
      siblings,
    });
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
    <form onSubmit={submit} className="space-y-3">
      <input
        {...register('name')}
        placeholder="What did you do?"
        aria-label="Entry name"
        className="input-base"
      />
      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

      <div className="flex items-end gap-2">
        <label className="flex-1">
          <span className="label-base">Start</span>
          <input type="time" {...register('startTime')} className="input-base" />
        </label>
        <span className="pb-2 text-ink-3">→</span>
        <label className="flex-1">
          <span className="label-base">End</span>
          <input type="time" {...register('endTime')} className="input-base" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CATEGORY_ORDER.map((c) => {
          const meta = CATEGORY_META[c];
          const active = category === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setValue('category', c, { shouldDirty: true })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[13px] transition ${
                active ? 'border-transparent text-white' : 'border-line text-ink-2 hover:bg-hover'
              }`}
              style={active ? { backgroundColor: meta.color } : undefined}
            >
              <span>{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs text-ink-3">
          {livePreview ? `Duration: ${formatDuration(livePreview.mins)}` : 'Pick start & end'}
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
