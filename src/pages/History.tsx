import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Search, Trash2, Flame } from 'lucide-react';
import { useHistory, type HistoryDay } from '@/hooks/useHistory';
import { useDay, useDeleteDay } from '@/hooks/useDay';
import { useProfile } from '@/hooks/useProfile';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { PageShell } from '@/components/ui/PageShell';
import { useToast } from '@/components/ui/Toast';
import { DayLog } from '@/components/today/DayLog';
import { CATEGORY_META, UNACCOUNTED_COLOR } from '@/lib/categories';

export function HistoryPage() {
  const [selected, setSelected] = useState<string | null>(null);
  if (selected) return <HistoryDetail localDate={selected} onBack={() => setSelected(null)} />;
  return <HistoryList onSelect={setSelected} />;
}

function HistoryList({ onSelect }: { onSelect: (localDate: string) => void }) {
  const { data, isLoading } = useHistory();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const rows = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (d) =>
        (d.title ?? '').toLowerCase().includes(term) ||
        d.local_date.includes(term) ||
        format(parseISO(d.local_date), 'EEEE MMMM d yyyy').toLowerCase().includes(term),
    );
  }, [data, q]);

  return (
    <PageShell title="History" subtitle={`${data?.length ?? 0} days logged`}>
      {isLoading ? (
        <Spinner label="Loading history…" />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or date…"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line py-12 text-center text-sm text-ink-2">
              {data?.length ? 'No matching days.' : 'No days logged yet.'}
            </div>
          ) : (
            <ul className="overflow-hidden rounded-xl2 border border-line">
              {filtered.map((d, i) => (
                <HistoryRow key={d.id} day={d} onClick={() => onSelect(d.local_date)} first={i === 0} />
              ))}
            </ul>
          )}
        </div>
      )}
    </PageShell>
  );
}

function HistoryRow({ day, onClick, first }: { day: HistoryDay; onClick: () => void; first: boolean }) {
  const total = day.window_minutes || 1;
  const segs = [
    { c: CATEGORY_META.productive.color, m: day.productive_minutes },
    { c: CATEGORY_META.sleep.color, m: day.sleep_minutes },
    { c: CATEGORY_META.other.color, m: day.other_minutes },
  ];
  const accounted = day.productive_minutes + day.sleep_minutes + day.other_minutes;
  const unaccounted = Math.max(0, day.window_minutes - accounted);

  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-hover ${first ? '' : 'border-t border-line'}`}
      >
        <div className="flex w-8 flex-col items-center">
          <span className="text-[9px] uppercase tracking-wide text-ink-3">Day</span>
          <span className="font-display text-base font-semibold tabular-nums">{day.day_number}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink">
            {day.title || format(parseISO(day.local_date), 'EEEE, MMM d')}
          </div>
          <div className="text-xs text-ink-3">{format(parseISO(day.local_date), 'EEE, MMM d yyyy')}</div>
          <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: UNACCOUNTED_COLOR }}>
            {segs.map((s, i) => (
              <div key={i} style={{ width: `${(s.m / total) * 100}%`, background: s.c }} />
            ))}
            <div style={{ width: `${(unaccounted / total) * 100}%`, background: UNACCOUNTED_COLOR }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-accent">
          <Flame className="h-3.5 w-3.5" />
          {Math.round((day.productive_minutes / total) * 100)}%
        </div>
      </button>
    </li>
  );
}

function HistoryDetail({ localDate, onBack }: { localDate: string; onBack: () => void }) {
  const { data: profile } = useProfile();
  const tz = profile?.timezone ?? 'UTC';
  const { data: day, isLoading } = useDay(localDate);
  const deleteDay = useDeleteDay();
  const { error, success } = useToast();
  const [confirming, setConfirming] = useState(false);

  const removeDay = async () => {
    if (!day) return;
    try {
      await deleteDay.mutateAsync(day.id);
      success('Day deleted.');
      onBack();
    } catch (e) {
      error((e as Error).message);
    }
  };

  const titleNode = (
    <button onClick={onBack} className="flex items-center gap-1.5 text-ink hover:text-accent">
      <ChevronLeft className="h-4 w-4" />
      {day?.title || (day ? format(parseISO(day.local_date), 'EEEE, MMM d') : 'Day')}
    </button>
  );

  return (
    <PageShell
      title={titleNode}
      subtitle={day ? `${format(parseISO(day.local_date), 'EEEE, MMMM d yyyy')} · Day ${day.day_number}` : undefined}
      actions={
        day ? (
          confirming ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button size="sm" variant="danger" loading={deleteDay.isPending} onClick={removeDay}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" /> Delete day
            </Button>
          )
        ) : undefined
      }
    >
      {isLoading ? (
        <Spinner />
      ) : !day ? (
        <div className="rounded-lg border border-dashed border-line py-12 text-center text-sm text-ink-2">Day not found.</div>
      ) : (
        <DayLog day={day} localDate={localDate} tz={tz} />
      )}
    </PageShell>
  );
}
