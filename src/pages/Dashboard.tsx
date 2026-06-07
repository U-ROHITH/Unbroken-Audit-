import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { PlayCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useDay, useEnsureDay } from '@/hooks/useDay';
import { useStats } from '@/hooks/useStats';
import { todayLocalDate, buildWindow } from '@/lib/time';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { StatRow } from '@/components/today/StatRow';
import { DayWorkspace } from '@/components/today/DayWorkspace';

export function Dashboard() {
  const { error } = useToast();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const tz = profile?.timezone ?? 'UTC';
  const localDate = useMemo(() => todayLocalDate(tz), [tz]);

  const { data: day, isLoading: dayLoading } = useDay(localDate);
  const stats = useStats();
  const ensureDay = useEnsureDay();

  if (profileLoading || dayLoading) return <Spinner label="Loading your day…" />;

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
    <div className="animate-fade-up space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Today</h1>
          <p className="text-sm text-paper/50">{format(parseISO(localDate), 'EEEE, MMMM d')}</p>
        </div>
        {day?.day_number ? (
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-paper/60">Day {day.day_number}</span>
        ) : null}
      </div>

      <StatRow
        current={stats.data?.current_streak ?? 0}
        max={stats.data?.max_streak ?? 0}
        total={stats.data?.total_days ?? 0}
        loading={stats.isLoading}
      />

      {day ? (
        <DayWorkspace day={day} localDate={localDate} tz={tz} currentStreak={stats.data?.current_streak ?? 0} />
      ) : (
        <div className="card-surface flex flex-col items-center gap-4 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent">
            <PlayCircle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Start today's audit</h2>
            <p className="mt-1 text-sm text-paper/50">
              Your default window is {profile?.default_window_start} for{' '}
              {(profile?.default_window_minutes ?? 1440) / 60}h.
            </p>
          </div>
          <Button onClick={startDay} loading={ensureDay.isPending}>
            Begin logging
          </Button>
        </div>
      )}
    </div>
  );
}
