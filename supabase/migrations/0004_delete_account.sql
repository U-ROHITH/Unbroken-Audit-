-- UnbrokenAudit — Phase 7: self-service account deletion (cascades to all user data).
-- A user can delete only their own auth.users row; FK on delete cascade removes
-- profiles, days and entries.

create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;
