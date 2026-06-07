-- UnbrokenAudit — Phase 8 hardening: resolve security-advisor warnings.
-- 1) Pin search_path on touch_updated_at (was mutable).
-- 2) Trigger functions must not be directly callable by clients — triggers fire
--    regardless of EXECUTE grants, so revoke them from anon/authenticated/public.
--    delete_current_user intentionally stays executable by authenticated.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.recompute_day_totals() from public, anon, authenticated;
revoke all on function public.enforce_entry_constraints() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
