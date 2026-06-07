import { Pencil, Trash2 } from 'lucide-react';
import { CATEGORY_META } from '@/lib/categories';
import { formatClock, formatDuration } from '@/lib/time';
import type { EntryRow } from '@/types/db';

interface Props {
  entries: EntryRow[];
  tz: string;
  onEdit: (entry: EntryRow) => void;
  onDelete: (entry: EntryRow) => void;
  busyId?: string | null;
}

export function EntryList({ entries, tz, onEdit, onDelete, busyId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-1 py-10 text-center">
        <p className="text-sm text-paper/60">No entries yet.</p>
        <p className="text-xs text-paper/35">Add your first time block above.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((e) => {
        const meta = CATEGORY_META[e.category];
        return (
          <li
            key={e.id}
            className="group flex items-center gap-3 rounded-xl border border-white/8 bg-ink-soft/60 px-3.5 py-3"
          >
            <span
              className="h-9 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{e.name}</span>
                <span className="shrink-0 text-xs" title={meta.label}>
                  {meta.emoji}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-paper/45">
                {formatClock(e.start_at, tz)} – {formatClock(e.end_at, tz)} ·{' '}
                {formatDuration(e.duration_minutes)}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
              <button
                onClick={() => onEdit(e)}
                aria-label={`Edit ${e.name}`}
                className="rounded-lg p-2 text-paper/60 hover:bg-white/5 hover:text-paper"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(e)}
                disabled={busyId === e.id}
                aria-label={`Delete ${e.name}`}
                className="rounded-lg p-2 text-paper/60 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
