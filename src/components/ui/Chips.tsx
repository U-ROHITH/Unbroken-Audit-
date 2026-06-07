import { motion } from 'framer-motion';

interface Chip {
  label: string;
  value: string | number;
}

interface Props {
  chips: Chip[];
  active?: string | number;
  onPick: (value: string | number) => void;
  label?: string;
}

/** Compact quick-pick row used for time presets and durations. */
export function Chips({ chips, active, onPick, label }: Props) {
  return (
    <div>
      {label && <span className="label-base">{label}</span>}
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => {
          const isActive = active === c.value;
          return (
            <motion.button
              key={String(c.value)}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onPick(c.value)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums transition ${
                isActive
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-line text-ink-2 hover:border-ink-3/60 hover:bg-hover'
              }`}
            >
              {c.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
