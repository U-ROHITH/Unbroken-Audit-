import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-line py-10 text-center">
        <p className="text-sm text-ink-2">No entries yet.</p>
        <p className="text-xs text-ink-3">Add your first time block.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      <AnimatePresence initial={false}>
        {entries.map((e) => {
          const meta = CATEGORY_META[e.category];
          const Icon = meta.Icon;
          return (
            <motion.li
              key={e.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-center gap-3 rounded-lg border border-line bg-panel px-3 py-2.5 transition hover:border-ink-3/40 hover:shadow-notion"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ background: meta.tint, color: meta.color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{e.name}</div>
                <div className="mt-0.5 text-xs tabular-nums text-ink-3">
                  {formatClock(e.start_at, tz)} – {formatClock(e.end_at, tz)} · {formatDuration(e.duration_minutes)}
                </div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button
                  onClick={() => onEdit(e)}
                  aria-label={`Edit ${e.name}`}
                  className="rounded-md p-1.5 text-ink-3 hover:bg-hover hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(e)}
                  disabled={busyId === e.id}
                  aria-label={`Delete ${e.name}`}
                  className="rounded-md p-1.5 text-ink-3 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
