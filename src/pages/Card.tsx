import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Image } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useDay } from '@/hooks/useDay';
import { useStats } from '@/hooks/useStats';
import { todayLocalDate } from '@/lib/time';
import { computeBreakdown } from '@/lib/breakdown';
import { buildCaption } from '@/lib/format';
import { Spinner } from '@/components/ui/Spinner';
import { PageShell } from '@/components/ui/PageShell';
import { CardExport } from '@/components/card/CardExport';
import type { CardData } from '@/components/card/ProgressCard';

export function CardPage() {
  const { data: profile, isLoading: pl } = useProfile();
  const tz = profile?.timezone ?? 'UTC';
  const localDate = useMemo(() => todayLocalDate(tz), [tz]);
  const { data: day, isLoading: dl } = useDay(localDate);
  const stats = useStats();

  const cardData: CardData | null = useMemo(() => {
    if (!day) return null;
    return {
      dayNumber: day.day_number ?? 1,
      currentStreak: stats.data?.current_streak ?? 0,
      dateLabel: format(parseISO(day.local_date), 'EEE, MMM d yyyy'),
      title: day.title ?? '',
      productiveItems: day.entries
        .filter((e) => e.category === 'productive')
        .map((e) => ({ name: e.name, minutes: e.duration_minutes })),
      summary: day.summary,
      hashtag: day.hashtag,
      breakdown: computeBreakdown(day.entries, day.window_minutes),
    };
  }, [day, stats.data]);

  return (
    <PageShell title="Share card" subtitle="Export a 1080×1080 image for Instagram" maxWidth="max-w-xl">
      {pl || dl ? (
        <Spinner label="Preparing your card…" />
      ) : !day || !cardData ? (
        <div className="flex flex-col items-center gap-4 rounded-xl2 border border-dashed border-line py-14 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/12 text-accent">
            <Image className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold">No card yet</h2>
            <p className="mt-1 text-sm text-ink-2">Start today's audit and add a few entries first.</p>
          </div>
          <Link
            to="/"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:brightness-95"
          >
            Go to Today
          </Link>
        </div>
      ) : (
        <CardExport data={cardData} caption={buildCaption(day)} />
      )}
    </PageShell>
  );
}
