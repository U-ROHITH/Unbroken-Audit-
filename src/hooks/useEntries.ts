import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { qk } from '@/lib/queryClient';
import { friendlyDbError } from '@/lib/errors';
import type { Category, EntryRow } from '@/types/db';
import { useAuth } from './useAuth';

export { validateEntry } from '@/lib/entryRules';
export type { WindowGuard } from '@/lib/entryRules';

export interface EntryInput {
  day_id: string;
  name: string;
  start_at: string; // ISO
  end_at: string; // ISO
  category: Category;
}

export function useCreateEntry(localDate: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EntryInput & { position?: number }): Promise<EntryRow> => {
      const { data, error } = await supabase
        .from('entries')
        .insert({ ...input, user_id: user!.id })
        .select('*')
        .single();
      if (error) throw new Error(friendlyDbError(error));
      return data as EntryRow;
    },
    onSuccess: () => {
      if (user) {
        qc.invalidateQueries({ queryKey: qk.today(user.id, localDate) });
        qc.invalidateQueries({ queryKey: qk.stats(user.id) });
      }
    },
  });
}

export function useUpdateEntry(localDate: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Partial<EntryInput> & { id: string },
    ): Promise<EntryRow> => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from('entries')
        .update(rest)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(friendlyDbError(error));
      return data as EntryRow;
    },
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: qk.today(user.id, localDate) });
    },
  });
}

export function useDeleteEntry(localDate: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase.from('entries').delete().eq('id', entryId);
      if (error) throw new Error(friendlyDbError(error));
    },
    onSuccess: () => {
      if (user) {
        qc.invalidateQueries({ queryKey: qk.today(user.id, localDate) });
        qc.invalidateQueries({ queryKey: qk.stats(user.id) });
      }
    },
  });
}
