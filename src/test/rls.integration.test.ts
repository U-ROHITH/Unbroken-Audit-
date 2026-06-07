/**
 * RLS isolation guarantee (spec §6, Phase 2 verification).
 *
 * This is an INTEGRATION test — it talks to a real Supabase project. It auto-skips
 * unless the required env vars are present, so the normal `npm test` stays offline.
 *
 * To run it:
 *   1. Apply all migrations in supabase/migrations to your project.
 *   2. Create two confirmed test users (A and B).
 *   3. Export:
 *        IT_SUPABASE_URL, IT_SUPABASE_ANON_KEY,
 *        IT_USER_A_EMAIL, IT_USER_A_PASSWORD,
 *        IT_USER_B_EMAIL, IT_USER_B_PASSWORD
 *   4. npx vitest run src/test/rls.integration.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = process.env;
const ready =
  !!env.IT_SUPABASE_URL &&
  !!env.IT_SUPABASE_ANON_KEY &&
  !!env.IT_USER_A_EMAIL &&
  !!env.IT_USER_A_PASSWORD &&
  !!env.IT_USER_B_EMAIL &&
  !!env.IT_USER_B_PASSWORD;

const d = ready ? describe : describe.skip;

function client(): SupabaseClient {
  return createClient(env.IT_SUPABASE_URL!, env.IT_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

d('RLS data isolation', () => {
  let a: SupabaseClient;
  let b: SupabaseClient;
  let aUserId = '';
  let aDayId = '';

  beforeAll(async () => {
    a = client();
    b = client();
    const { data: aAuth, error: aErr } = await a.auth.signInWithPassword({
      email: env.IT_USER_A_EMAIL!,
      password: env.IT_USER_A_PASSWORD!,
    });
    if (aErr) throw aErr;
    aUserId = aAuth.user!.id;

    const { error: bErr } = await b.auth.signInWithPassword({
      email: env.IT_USER_B_EMAIL!,
      password: env.IT_USER_B_PASSWORD!,
    });
    if (bErr) throw bErr;

    // A creates a day to probe against.
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    const { data: day, error: dayErr } = await a
      .from('days')
      .upsert(
        {
          user_id: aUserId,
          local_date: today,
          window_start: start.toISOString(),
          window_end: end.toISOString(),
          title: 'A private day',
        },
        { onConflict: 'user_id,local_date' },
      )
      .select('*')
      .single();
    if (dayErr) throw dayErr;
    aDayId = day.id;
  });

  it("B cannot read A's days", async () => {
    const { data } = await b.from('days').select('*').eq('id', aDayId);
    expect(data ?? []).toHaveLength(0);
  });

  it("B cannot update A's day", async () => {
    const { data } = await b.from('days').update({ title: 'hacked' }).eq('id', aDayId).select('*');
    expect(data ?? []).toHaveLength(0);
  });

  it("B cannot read A's profile", async () => {
    const { data } = await b.from('profiles').select('*').eq('id', aUserId);
    expect(data ?? []).toHaveLength(0);
  });

  it("A can read A's own day", async () => {
    const { data } = await a.from('days').select('*').eq('id', aDayId);
    expect(data ?? []).toHaveLength(1);
  });
});
