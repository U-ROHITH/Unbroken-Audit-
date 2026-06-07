import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { qk } from '@/lib/queryClient';
import type { Profile } from '@/types/db';
import { useAuth } from './useAuth';

const browserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export function useProfile() {
  const { user } = useAuth();
  const uid = user?.id;

  return useQuery({
    queryKey: uid ? qk.profile(uid) : ['profile', 'anon'],
    enabled: !!uid,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid!)
        .maybeSingle();
      if (error) throw error;

      if (data) return data as Profile;

      // Defensive: if the signup trigger hasn't materialized the row yet, create it.
      const { data: created, error: insertErr } = await supabase
        .from('profiles')
        .insert({ id: uid!, timezone: browserTimezone() })
        .select('*')
        .single();
      if (insertErr) throw insertErr;
      return created as Profile;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const uid = user!.id;
      const clean = { ...patch };
      if (clean.username === '') clean.username = null;
      const { data, error } = await supabase
        .from('profiles')
        .update(clean)
        .eq('id', uid)
        .select('*')
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      if (user) qc.setQueryData(qk.profile(user.id), data);
    },
  });
}
