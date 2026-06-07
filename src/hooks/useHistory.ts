import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { qk } from '@/lib/queryClient';
import type { DayRow } from '@/types/db';
import { useAuth } from './useAuth';

export interface HistoryDay extends DayRow {
  day_number: number;
}

export function useHistory() {
  const { user } = useAuth();
  const uid = user?.id;
  return useQuery({
    queryKey: uid ? qk.history(uid) : ['history', 'anon'],
    enabled: !!uid,
    queryFn: async (): Promise<HistoryDay[]> => {
      const { data, error } = await supabase
        .from('days')
        .select('*')
        .eq('user_id', uid!)
        .order('local_date', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as DayRow[];
      const total = rows.length;
      // newest first => day_number counts down from total
      return rows.map((row, i) => ({ ...row, day_number: total - i }));
    },
  });
}

export function useDayById(dayId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: dayId ? qk.day(dayId) : ['day-by-id', 'none'],
    enabled: !!dayId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('days')
        .select('*, entries(*)')
        .eq('id', dayId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
