export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display font-semibold ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink-soft ring-1 ring-white/10">
        <svg viewBox="0 0 32 32" className="h-4 w-4">
          <path
            d="M9 17.5l4.2 4.2L23 11.5"
            fill="none"
            stroke="#e8503a"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="tracking-tight">
        Unbroken<span className="text-accent">Audit</span>
      </span>
    </span>
  );
}
