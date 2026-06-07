import { forwardRef, type InputHTMLAttributes } from 'react';
import { Clock } from 'lucide-react';

interface TimeFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

/**
 * A clock-iconed native time input. The browser renders a localized, readable time
 * (incl. AM/PM) and a native picker, so we don't duplicate the value as text.
 */
export const TimeField = forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  { label, className = '', ...rest },
  ref,
) {
  return (
    <label className="block w-full">
      {label && <span className="label-base">{label}</span>}
      <span className="group flex h-11 items-center rounded-lg border border-line bg-canvas px-3 transition focus-within:border-accent/70 focus-within:ring-2 focus-within:ring-accent/15 hover:border-ink-3/60">
        <Clock className="mr-2 h-4 w-4 shrink-0 text-ink-3 transition group-focus-within:text-accent" />
        <input
          ref={ref}
          type="time"
          className={`w-full bg-transparent text-sm font-medium tabular-nums text-ink outline-none ${className}`}
          {...rest}
        />
      </span>
    </label>
  );
});
