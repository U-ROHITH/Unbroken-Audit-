import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { PlayCircle, Image } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useDay, useEnsureDay } from '@/hooks/useDay';
import { useStats } from '@/hooks/useStats';
import { todayLocalDate, buildWindow } from '@/lib/time';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { PageShell } from '@/components/ui/PageShell';
import { StatRow } from '@/components/today/StatRow';
import { DayLog } from '@/components/today/DayLog';

export function Dashboard() {
  const { error } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const tz = profile?.timezone ?? 'UTC';
  const localDate = useMemo(() => todayLocalDate(tz), [tz]);

  const { data: day, isLoading: dayLoading } = useDay(localDate);
  const stats = useStats();
  const ensureDay = useEnsureDay();

  const dateLabel = format(parseISO(localDate), 'EEEE, MMMM d');

  const startDay = async () => {
    if (!profile) return;
    const win = buildWindow(localDate, profile.default_window_start, profile.default_window_minutes, tz);
    try {
      await ensureDay.mutateAsync(win);
    } catch (e) {
      error((e as Error).message);
    }
  };

  return (
    <PageShell
      title="Today"
      subtitle={day?.day_number ? `${dateLabel} · Day ${day.day_number}` : dateLabel}
      actions={
        day ? (
          <Link
            to="/card"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 text-[13px] font-medium text-ink transition hover:bg-hover"
          >
            <Image className="h-4 w-4" /> Card
          </Link>
        ) : undefined
      }
    >
      {profileLoading || dayLoading ? (
        <Spinner label="Loading your day…" />
      ) : (
        <div className="space-y-5">
          <StatRow
            current={stats.data?.current_streak ?? 0}
            max={stats.data?.max_streak ?? 0}
            total={stats.data?.total_days ?? 0}
            loading={stats.isLoading}
          />

          {day ? (
            <DayLog day={day} localDate={localDate} tz={tz} />
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl2 border border-dashed border-line py-14 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/12 text-accent">
                <PlayCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Start today's audit</h2>
                <p className="mt-1 text-sm text-ink-2">
                  Default window {profile?.default_window_start} for {(profile?.default_window_minutes ?? 1440) / 60}h.
                  You can change the start time any day.
                </p>
              </div>
              <Button onClick={startDay} loading={ensureDay.isPending}>
                Begin logging
              </Button>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
