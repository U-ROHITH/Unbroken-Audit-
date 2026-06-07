import { Flame, Trophy, CalendarDays, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  current: number;
  max: number;
  total: number;
  loading?: boolean;
}

function Stat({ Icon, value, label, tint, color, loading, i }: {
  Icon: LucideIcon;
  value: number;
  label: string;
  tint: string;
  color: string;
  loading?: boolean;
  i: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 items-center gap-2.5 rounded-xl2 border border-line bg-panel px-3.5 py-3"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: tint, color }}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold leading-none tabular-nums">
          {loading ? '–' : value}
        </div>
        <div className="mt-0.5 text-xs text-ink-2">{label}</div>
      </div>
    </motion.div>
  );
}

export function StatRow({ current, max, total, loading }: Props) {
  return (
    <div className="flex gap-2.5">
      <Stat Icon={Flame} value={current} label="Current streak" tint="rgba(232,80,58,0.12)" color="#e8503a" loading={loading} i={0} />
      <Stat Icon={Trophy} value={max} label="Best streak" tint="rgba(240,140,0,0.12)" color="#f08c00" loading={loading} i={1} />
      <Stat Icon={CalendarDays} value={total} label="Total days" tint="rgba(59,91,219,0.12)" color="#3b5bdb" loading={loading} i={2} />
    </div>
  );
}
