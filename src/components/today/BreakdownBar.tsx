import type { Breakdown } from '@/lib/breakdown';
import { CATEGORY_META, UNACCOUNTED_COLOR } from '@/lib/categories';
import { formatDuration } from '@/lib/time';

export function BreakdownBar({ b }: { b: Breakdown }) {
  const segs = [
    { color: CATEGORY_META.productive.color, pct: b.productivePct },
    { color: CATEGORY_META.sleep.color, pct: b.sleepPct },
    { color: CATEGORY_META.other.color, pct: b.otherPct },
    { color: UNACCOUNTED_COLOR, pct: b.unaccountedPct },
  ];

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {segs.map((s, i) => (
          <div
            key={i}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            className="h-full transition-[width] duration-500"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        <Legend color={CATEGORY_META.productive.color} emoji="⚡" label="Productive" minutes={b.productiveMinutes} pct={b.productivePct} />
        <Legend color={CATEGORY_META.sleep.color} emoji="😴" label="Sleep" minutes={b.sleepMinutes} pct={b.sleepPct} />
        <Legend color={CATEGORY_META.other.color} emoji="🌀" label="Other" minutes={b.otherMinutes} pct={b.otherPct} />
        {b.unaccountedMinutes > 0 && (
          <Legend color={UNACCOUNTED_COLOR} emoji="" label="Unlogged" minutes={b.unaccountedMinutes} pct={b.unaccountedPct} muted />
        )}
      </div>
    </div>
  );
}

function Legend({
  color,
  emoji,
  label,
  minutes,
  pct,
  muted,
}: {
  color: string;
  emoji: string;
  label: string;
  minutes: number;
  pct: number;
  muted?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${muted ? 'text-ink-3' : 'text-ink-2'}`}>
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
      <span className="tabular-nums text-ink-3">
        {Math.round(pct)}% · {formatDuration(minutes)}
      </span>
    </span>
  );
}
