import { useState } from 'react';
import { Clock3, Check, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TimeField } from '@/components/ui/TimeField';
import { Chips } from '@/components/ui/Chips';
import { formatClock, formatDuration, resolveClockToInstant, windowMinutes } from '@/lib/time';
import { useToast } from '@/components/ui/Toast';

interface Props {
  tz: string;
  windowStart: string;
  windowEnd: string;
  hasEntries: boolean;
  onSave: (next: { window_start: string; window_end: string }) => Promise<void>;
}

const START_PRESETS = [
  { label: '12 AM', value: '00:00' },
  { label: '5 AM', value: '05:00' },
  { label: '6 AM', value: '06:00' },
  { label: '7 AM', value: '07:00' },
  { label: '8 AM', value: '08:00' },
  { label: '9 AM', value: '09:00' },
];
const LENGTHS = [
  { label: '8h', value: 480 },
  { label: '12h', value: 720 },
  { label: '16h', value: 960 },
  { label: '18h', value: 1080 },
  { label: '24h', value: 1440 },
];

function addMinutesToClock(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h! * 60 + m! + mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function WindowControls({ tz, windowStart, windowEnd, hasEntries, onSave }: Props) {
  const { error } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [start, setStart] = useState(() => toHHmm(windowStart, tz));
  const [end, setEnd] = useState(() => toHHmm(windowEnd, tz));

  const lenLabel = formatDuration(windowMinutes(windowStart, windowEnd));

  const save = async () => {
    const newStart = resolveClockToInstant(windowStart, start, tz);
    const newEnd = resolveClockToInstant(newStart, end, tz);
    if (newEnd.getTime() <= newStart.getTime()) {
      error('Window end must be after the start.');
      return;
    }
    try {
      setSaving(true);
      await onSave({ window_start: newStart.toISOString(), window_end: newEnd.toISOString() });
      setEditing(false);
    } catch (e) {
      error((e as Error).message || 'Could not update window.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl2 border border-line bg-sidebar/60 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/12 text-accent">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">Day window</p>
            <p className="text-xs text-ink-3">Starts when your day starts — change it anytime</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-2 hover:bg-hover hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {hasEntries && (
                <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                  Narrowing the window may push existing entries outside it.
                </p>
              )}
              <div className="flex items-end gap-2.5">
                <TimeField label="Starts" value={start} onChange={(e) => setStart(e.target.value)} />
                <span className="pb-3 text-ink-3">→</span>
                <TimeField label="Ends" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
              <Chips label="Start at" chips={START_PRESETS} active={start} onPick={(v) => setStart(String(v))} />
              <Chips label="Length" chips={LENGTHS} onPick={(v) => setEnd(addMinutesToClock(start, Number(v)))} />
              <div className="flex gap-2 pt-0.5">
                <Button size="sm" loading={saving} onClick={save}>
                  <Check className="h-4 w-4" /> Save window
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tabular-nums">
              {formatClock(windowStart, tz)} <span className="font-normal text-ink-3">→</span>{' '}
              {formatClock(windowEnd, tz)}
            </span>
            <span className="text-xs text-ink-3">{lenLabel}</span>
          </div>
        )}
      </AnimatePresence>
    </div>
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
