import { motion } from 'framer-motion';
import type { Breakdown } from '@/lib/breakdown';
import { CATEGORY_META, UNACCOUNTED_COLOR } from '@/lib/categories';
import { formatDuration } from '@/lib/time';
import type { LucideIcon } from 'lucide-react';

export function BreakdownBar({ b }: { b: Breakdown }) {
  const segs = [
    { color: CATEGORY_META.productive.color, pct: b.productivePct },
    { color: CATEGORY_META.sleep.color, pct: b.sleepPct },
    { color: CATEGORY_META.other.color, pct: b.otherPct },
    { color: UNACCOUNTED_COLOR, pct: b.unaccountedPct },
  ];

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-line">
        {segs.map((s, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${s.pct}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
            style={{ backgroundColor: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        <Legend Icon={CATEGORY_META.productive.Icon} color={CATEGORY_META.productive.color} label="Productive" minutes={b.productiveMinutes} pct={b.productivePct} />
        <Legend Icon={CATEGORY_META.sleep.Icon} color={CATEGORY_META.sleep.color} label="Sleep" minutes={b.sleepMinutes} pct={b.sleepPct} />
        <Legend Icon={CATEGORY_META.other.Icon} color={CATEGORY_META.other.color} label="Other" minutes={b.otherMinutes} pct={b.otherPct} />
      </div>
      {b.unaccountedMinutes > 0 && (
        <p className="mt-2 text-xs text-ink-3">
          {Math.round(b.unaccountedPct)}% unlogged · {formatDuration(b.unaccountedMinutes)}
        </p>
      )}
    </div>
  );
}

function Legend({ Icon, color, label, minutes, pct }: {
  Icon: LucideIcon;
  color: string;
  label: string;
  minutes: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold tabular-nums leading-none">{Math.round(pct)}%</div>
        <div className="mt-0.5 truncate text-xs text-ink-3">{label} · {formatDuration(minutes)}</div>
      </div>
    </div>
  );
}
