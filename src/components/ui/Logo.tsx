export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-semibold text-ink ${className}`}>
      <span className="grid h-6 w-6 place-items-center rounded-md bg-ink">
        <svg viewBox="0 0 32 32" className="h-3.5 w-3.5">
          <path
            d="M9 17.5l4.2 4.2L23 11.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="tracking-[-0.01em]">
          Unbroken<span className="text-accent">Audit</span>
        </span>
      )}
    </span>
  );
}
