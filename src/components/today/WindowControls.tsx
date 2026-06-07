import { useState } from 'react';
import { Clock3, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatClock, formatDuration, resolveClockToInstant, windowMinutes } from '@/lib/time';
import { useToast } from '@/components/ui/Toast';

interface Props {
  tz: string;
  windowStart: string;
  windowEnd: string;
  hasEntries: boolean;
  onSave: (next: { window_start: string; window_end: string }) => Promise<void>;
}

export function WindowControls({ tz, windowStart, windowEnd, hasEntries, onSave }: Props) {
  const { error } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [start, setStart] = useState(() => formatInput(windowStart, tz));
  const [end, setEnd] = useState(() => formatInput(windowEnd, tz));

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
    <div className="rounded-lg border border-line bg-sidebar/60 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-2">
          <Clock3 className="h-4 w-4 text-accent" />
          <span className="text-[13px] font-medium">Day window</span>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-ink-3 hover:text-ink">
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3">
          {hasEntries && (
            <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
              Narrowing the window may push existing entries outside it.
            </p>
          )}
          <div className="flex items-end gap-2">
            <label className="flex-1">
              <span className="label-base">Starts</span>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="input-base" />
            </label>
            <span className="pb-2 text-ink-3">→</span>
            <label className="flex-1">
              <span className="label-base">Ends</span>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="input-base" />
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={save}>
              <Check className="h-4 w-4" /> Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-base font-medium">
            {formatClock(windowStart, tz)} <span className="text-ink-3">→</span> {formatClock(windowEnd, tz)}
          </span>
          <span className="text-xs text-ink-3">({lenLabel})</span>
        </div>
      )}
    </div>
  );
}

function formatInput(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}
