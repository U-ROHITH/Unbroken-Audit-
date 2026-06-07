import { useState, type ReactNode } from 'react';
import { useUpdateDay } from '@/hooks/useDay';
import { useCreateEntry, useUpdateEntry, useDeleteEntry } from '@/hooks/useEntries';
import { computeBreakdown } from '@/lib/breakdown';
import { useToast } from '@/components/ui/Toast';
import { WindowControls } from './WindowControls';
import { EntryForm } from './EntryForm';
import { EntryList } from './EntryList';
import { BreakdownBar } from './BreakdownBar';
import { DayMeta } from './DayMeta';
import type { DayWithEntries, EntryRow } from '@/types/db';

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function DayLog({ day, localDate, tz }: { day: DayWithEntries; localDate: string; tz: string }) {
  const { error } = useToast();
  const updateDay = useUpdateDay(localDate);
  const createEntry = useCreateEntry(localDate);
  const updateEntry = useUpdateEntry(localDate);
  const deleteEntry = useDeleteEntry(localDate);
  const [editing, setEditing] = useState<EntryRow | null>(null);

  const breakdown = computeBreakdown(day.entries, day.window_minutes);

  const onDeleteEntry = async (e: EntryRow) => {
    try {
      await deleteEntry.mutateAsync(e.id);
      if (editing?.id === e.id) setEditing(null);
    } catch (err) {
      error((err as Error).message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left column: window + add entry + details */}
      <div className="space-y-4">
        <WindowControls
          tz={tz}
          windowStart={day.window_start}
          windowEnd={day.window_end}
          hasEntries={day.entries.length > 0}
          onSave={(next) => updateDay.mutateAsync({ id: day.id, ...next }).then(() => undefined)}
        />

        <Section title={editing ? 'Edit entry' : 'Add entry'}>
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
        </Section>

        <Section title="Day details">
          <DayMeta
            title={day.title}
            summary={day.summary}
            hashtag={day.hashtag}
            onSave={(meta) => updateDay.mutateAsync({ id: day.id, ...meta }).then(() => undefined)}
          />
        </Section>
      </div>

      {/* Right column: entries + breakdown */}
      <div className="space-y-4">
        <Section title={`Entries · ${day.entries.length}`}>
          <EntryList
            entries={day.entries}
            tz={tz}
            onEdit={setEditing}
            onDelete={onDeleteEntry}
            busyId={deleteEntry.isPending ? (deleteEntry.variables as string) : null}
          />
        </Section>

        {day.window_minutes > 0 && (
          <Section title="Breakdown">
            <BreakdownBar b={breakdown} />
          </Section>
        )}
      </div>
    </div>
  );
}
