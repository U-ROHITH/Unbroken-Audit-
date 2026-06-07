import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { useUpdateDay } from '@/hooks/useDay';
import { useCreateEntry, useUpdateEntry, useDeleteEntry } from '@/hooks/useEntries';
import { computeBreakdown } from '@/lib/breakdown';
import { buildCaption } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { WindowControls } from './WindowControls';
import { EntryForm } from './EntryForm';
import { EntryList } from './EntryList';
import { BreakdownBar } from './BreakdownBar';
import { DayMeta } from './DayMeta';
import { CardExport } from '@/components/card/CardExport';
import type { CardData } from '@/components/card/ProgressCard';
import type { DayWithEntries, EntryRow } from '@/types/db';

interface Props {
  day: DayWithEntries;
  localDate: string;
  tz: string;
  currentStreak: number;
}

export function DayWorkspace({ day, localDate, tz, currentStreak }: Props) {
  const { error } = useToast();
  const updateDay = useUpdateDay(localDate);
  const createEntry = useCreateEntry(localDate);
  const updateEntry = useUpdateEntry(localDate);
  const deleteEntry = useDeleteEntry(localDate);

  const [editing, setEditing] = useState<EntryRow | null>(null);
  const [tab, setTab] = useState<'log' | 'card'>('log');

  const breakdown = computeBreakdown(day.entries, day.window_minutes);
  const productiveItems = day.entries.filter((e) => e.category === 'productive').map((e) => e.name);

  const cardData: CardData = {
    dayNumber: day.day_number ?? 1,
    currentStreak,
    dateLabel: format(parseISO(day.local_date), 'EEE, MMM d yyyy'),
    title: day.title ?? '',
    productiveItems,
    summary: day.summary,
    hashtag: day.hashtag,
    breakdown,
  };

  const onDeleteEntry = async (e: EntryRow) => {
    try {
      await deleteEntry.mutateAsync(e.id);
      if (editing?.id === e.id) setEditing(null);
    } catch (err) {
      error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-ink-soft/60 p-1">
        <TabButton active={tab === 'log'} onClick={() => setTab('log')}>
          Log
        </TabButton>
        <TabButton active={tab === 'card'} onClick={() => setTab('card')}>
          <Sparkles className="h-4 w-4" /> Share card
        </TabButton>
      </div>

      {tab === 'log' ? (
        <div className="space-y-4">
          <WindowControls
            tz={tz}
            windowStart={day.window_start}
            windowEnd={day.window_end}
            hasEntries={day.entries.length > 0}
            onSave={(next) => updateDay.mutateAsync({ id: day.id, ...next }).then(() => undefined)}
          />

          <EntryForm
            tz={tz}
            windowStart={day.window_start}
            windowEnd={day.window_end}
            siblings={day.entries}
            editing={editing}
            onCancelEdit={() => setEditing(null)}
            onSubmit={async (input) => {
              if (input.id) {
                await updateEntry.mutateAsync({
                  id: input.id,
                  name: input.name,
                  start_at: input.start_at,
                  end_at: input.end_at,
                  category: input.category,
                });
                setEditing(null);
              } else {
                await createEntry.mutateAsync({
                  day_id: day.id,
                  name: input.name,
                  start_at: input.start_at,
                  end_at: input.end_at,
                  category: input.category,
                  position: day.entries.length,
                });
              }
            }}
          />

          <EntryList
            entries={day.entries}
            tz={tz}
            onEdit={setEditing}
            onDelete={onDeleteEntry}
            busyId={deleteEntry.isPending ? (deleteEntry.variables as string) : null}
          />

          {day.window_minutes > 0 && (
            <div className="card-surface p-4">
              <BreakdownBar b={breakdown} />
            </div>
          )}

          <DayMeta
            title={day.title}
            summary={day.summary}
            hashtag={day.hashtag}
            onSave={(meta) => updateDay.mutateAsync({ id: day.id, ...meta }).then(() => undefined)}
          />
        </div>
      ) : (
        <CardExport data={cardData} caption={buildCaption(day)} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
        active ? 'bg-accent text-white' : 'text-paper/60 hover:text-paper'
      }`}
    >
      {children}
    </button>
  );
}
