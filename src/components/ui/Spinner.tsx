import { Loader2 } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-3">
      <Loader2 className="h-6 w-6 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid h-dvh place-items-center bg-canvas">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}
