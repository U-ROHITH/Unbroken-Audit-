interface Props {
  current: number;
  max: number;
  total: number;
  loading?: boolean;
}

function Stat({ emoji, value, label, loading }: { emoji: string; value: number; label: string; loading?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2">
      <span className="text-base leading-none">{emoji}</span>
      <span className="font-display text-lg font-semibold tabular-nums leading-none">
        {loading ? '–' : value}
      </span>
      <span className="text-xs text-ink-2">{label}</span>
    </div>
  );
}

export function StatRow({ current, max, total, loading }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Stat emoji="🔥" value={current} label="Current" loading={loading} />
      <Stat emoji="🏆" value={max} label="Best" loading={loading} />
      <Stat emoji="📅" value={total} label="Total days" loading={loading} />
    </div>
  );
}
