import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Search, Trash2, Flame } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { useDay, useDeleteDay } from '@/hooks/useDay';
import { useProfile } from '@/hooks/useProfile';
import { useStats } from '@/hooks/useStats';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { DayWorkspace } from '@/components/today/DayWorkspace';
import { CATEGORY_META, UNACCOUNTED_COLOR } from '@/lib/categories';
import type { HistoryDay } from '@/hooks/useHistory';

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

  if (isLoading) return <Spinner label="Loading history…" />;

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-paper/50">{data?.length ?? 0} days logged</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or date…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card-surface py-12 text-center text-sm text-paper/50">
          {data?.length ? 'No matching days.' : 'No days logged yet.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((d) => (
            <HistoryRow key={d.id} day={d} onClick={() => onSelect(d.local_date)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({ day, onClick }: { day: HistoryDay; onClick: () => void }) {
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
        className="flex w-full items-center gap-4 rounded-xl border border-white/8 bg-ink-soft/60 px-4 py-3.5 text-left transition hover:border-white/20"
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wide text-paper/40">Day</span>
          <span className="font-display text-xl font-semibold tabular-nums">{day.day_number}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">
            {day.title || format(parseISO(day.local_date), 'EEEE, MMM d')}
          </div>
          <div className="text-xs text-paper/45">{format(parseISO(day.local_date), 'EEE, MMM d yyyy')}</div>
          <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: UNACCOUNTED_COLOR }}>
            {segs.map((s, i) => (
              <div key={i} style={{ width: `${(s.m / total) * 100}%`, background: s.c }} />
            ))}
            <div style={{ width: `${(unaccounted / total) * 100}%`, background: UNACCOUNTED_COLOR }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-accent">
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
  const stats = useStats();
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

  return (
    <div className="animate-fade-up space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-paper/60 hover:text-paper">
        <ChevronLeft className="h-4 w-4" /> Back to history
      </button>

      {isLoading ? (
        <Spinner />
      ) : !day ? (
        <div className="card-surface py-12 text-center text-sm text-paper/50">Day not found.</div>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {day.title || format(parseISO(day.local_date), 'EEEE, MMM d')}
              </h1>
              <p className="text-sm text-paper/50">{format(parseISO(day.local_date), 'EEEE, MMMM d yyyy')}</p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-paper/60">Day {day.day_number}</span>
          </div>

          <DayWorkspace day={day} localDate={localDate} tz={tz} currentStreak={stats.data?.current_streak ?? 0} />

          <div className="card-surface flex items-center justify-between p-4">
            <div className="text-sm">
              <p className="font-medium text-paper/80">Delete this day</p>
              <p className="text-xs text-paper/45">Removes the day and all its entries. Cannot be undone.</p>
            </div>
            {confirming ? (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="danger" loading={deleteDay.isPending} onClick={removeDay}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setConfirming(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
