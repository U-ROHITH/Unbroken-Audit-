import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { qk } from '@/lib/queryClient';
import type { UserStats } from '@/types/db';
import { useAuth } from './useAuth';

export function useStats() {
  const { user } = useAuth();
  const uid = user?.id;

  return useQuery({
    queryKey: uid ? qk.stats(uid) : ['stats', 'anon'],
    enabled: !!uid,
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase.rpc('get_user_stats', { uid: uid! });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        current_streak: row?.current_streak ?? 0,
        max_streak: row?.max_streak ?? 0,
        total_days: row?.total_days ?? 0,
      };
    },
  });
}
