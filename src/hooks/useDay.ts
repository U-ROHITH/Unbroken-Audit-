import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { qk } from '@/lib/queryClient';
import { friendlyDbError } from '@/lib/errors';
import type { DayRow, DayWithEntries, EntryRow } from '@/types/db';
import { useAuth } from './useAuth';

async function fetchDayNumber(uid: string, localDate: string): Promise<number> {
  const { count, error } = await supabase
    .from('days')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', uid)
    .lte('local_date', localDate);
  if (error) throw error;
  return count ?? 1;
}

async function fetchDayWithEntries(
  uid: string,
  localDate: string,
): Promise<DayWithEntries | null> {
  const { data, error } = await supabase
    .from('days')
    .select('*, entries(*)')
    .eq('user_id', uid)
    .eq('local_date', localDate)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const day = data as DayRow & { entries: EntryRow[] };
  const entries = [...(day.entries ?? [])].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
  );
  const day_number = await fetchDayNumber(uid, localDate);
  return { ...day, entries, day_number };
}

export function useDay(localDate: string) {
  const { user } = useAuth();
  const uid = user?.id;
  return useQuery({
    queryKey: uid ? qk.today(uid, localDate) : ['day', 'anon', localDate],
    enabled: !!uid,
    queryFn: () => fetchDayWithEntries(uid!, localDate),
  });
}

export function useEnsureDay() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      local_date: string;
      window_start: string;
      window_end: string;
    }): Promise<DayRow> => {
      const uid = user!.id;
      const { data, error } = await supabase
        .from('days')
        .upsert(
          { user_id: uid, ...input },
          { onConflict: 'user_id,local_date', ignoreDuplicates: false },
        )
        .select('*')
        .single();
      if (error) throw new Error(friendlyDbError(error));
      return data as DayRow;
    },
    onSuccess: (_d, vars) => {
      if (user) {
        qc.invalidateQueries({ queryKey: qk.today(user.id, vars.local_date) });
        qc.invalidateQueries({ queryKey: qk.stats(user.id) });
        qc.invalidateQueries({ queryKey: qk.history(user.id) });
      }
    },
  });
}

export function useUpdateDay(localDate: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<DayRow> & { id: string }): Promise<DayRow> => {
      const { id, ...rest } = patch;
      const { data, error } = await supabase
        .from('days')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(friendlyDbError(error));
      return data as DayRow;
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: qk.today(user.id, localDate) });
    },
  });
}

export function useDeleteDay() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dayId: string) => {
      const { error } = await supabase.from('days').delete().eq('id', dayId);
      if (error) throw new Error(friendlyDbError(error));
    },
    onSuccess: () => {
      if (user) {
        qc.invalidateQueries({ queryKey: qk.history(user.id) });
        qc.invalidateQueries({ queryKey: qk.stats(user.id) });
      }
    },
  });
}
