interface Props {
  current: number;
  max: number;
  total: number;
  loading?: boolean;
}

function Stat({ emoji, value, label, loading }: { emoji: string; value: number; label: string; loading?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-white/8 bg-ink-soft/60 px-3 py-3">
      <span className="text-lg leading-none">{emoji}</span>
      <span className="font-display text-2xl font-semibold tabular-nums">
        {loading ? '–' : value}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-paper/45">{label}</span>
    </div>
  );
}

export function StatRow({ current, max, total, loading }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat emoji="🔥" value={current} label="Current" loading={loading} />
      <Stat emoji="🏆" value={max} label="Best" loading={loading} />
      <Stat emoji="📅" value={total} label="Total days" loading={loading} />
    </div>
  );
}
