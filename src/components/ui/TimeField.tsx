import { forwardRef, type InputHTMLAttributes } from 'react';
import { Clock } from 'lucide-react';
import { formatClockLabel } from '@/lib/time';

interface TimeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

/**
 * A large, tappable time control: a clock-iconed native time input plus a friendly
 * 12-hour label so the value is unambiguous. Native input keeps mobile keypads + AM/PM.
 */
export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  { label, value, className = '', ...rest },
  ref,
) {
  const pretty = typeof value === 'string' && value ? formatClockLabel(value) : '';
  return (
    <div className="w-full">
      {label && <span className="label-base">{label}</span>}
      <div className="group relative flex h-11 items-center rounded-lg border border-line bg-canvas px-3 transition focus-within:border-accent/70 focus-within:ring-2 focus-within:ring-accent/15 hover:border-ink-3/60">
        <Clock className="mr-2 h-4 w-4 shrink-0 text-ink-3 transition group-focus-within:text-accent" />
        <input
          ref={ref}
          type="time"
          value={value}
          className={`w-full bg-transparent text-sm font-medium tabular-nums text-ink outline-none ${className}`}
          {...rest}
        />
        {pretty && (
          <span className="pointer-events-none ml-2 shrink-0 text-xs tabular-nums text-ink-3">{pretty}</span>
        )}
      </div>
    </div>
  );
});
