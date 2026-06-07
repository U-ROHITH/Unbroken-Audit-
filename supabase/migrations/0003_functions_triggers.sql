-- UnbrokenAudit — Phase 2: functions & triggers
-- - new-user -> profiles row (captures timezone)
-- - entries change -> recompute denormalized day totals
-- - entries change -> enforce window bounds + ownership integrity
-- - get_user_stats(uid) -> (current_streak, max_streak, total_days) in user's tz

-- ── 5. New user => profile row, capturing tz sent from the client ────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, timezone, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'timezone', ''), 'UTC'),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 4.3 Enforce entry within parent window + ownership integrity ─────────────
create or replace function public.enforce_entry_constraints()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws timestamptz;
  we timestamptz;
  owner uuid;
begin
  select window_start, window_end, user_id into ws, we, owner
  from public.days where id = new.day_id;

  if owner is null then
    raise exception 'Day not found';
  end if;
  if owner <> new.user_id then
    raise exception 'Entry user does not match day owner';
  end if;
  if new.start_at < ws or new.end_at > we then
    raise exception 'This entry falls outside your day window';
  end if;
  return new;
end;
$$;

drop trigger if exists entries_enforce_constraints on public.entries;
create trigger entries_enforce_constraints
  before insert or update on public.entries
  for each row execute function public.enforce_entry_constraints();

-- ── 4.7 Recompute denormalized day totals on any entry change ────────────────
create or replace function public.recompute_day_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  target := coalesce(new.day_id, old.day_id);
  update public.days d set
    productive_minutes = coalesce((select sum(duration_minutes) from public.entries
                                   where day_id = target and category = 'productive'), 0),
    sleep_minutes      = coalesce((select sum(duration_minutes) from public.entries
                                   where day_id = target and category = 'sleep'), 0),
    other_minutes      = coalesce((select sum(duration_minutes) from public.entries
                                   where day_id = target and category = 'other'), 0),
    updated_at = now()
  where d.id = target;
  return null;
end;
$$;

drop trigger if exists entries_recompute on public.entries;
create trigger entries_recompute
  after insert or update or delete on public.entries
  for each row execute function public.recompute_day_totals();

-- keep days.updated_at fresh on direct edits
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists days_touch_updated_at on public.days;
create trigger days_touch_updated_at
  before update on public.days
  for each row execute function public.touch_updated_at();

-- ── 4.6 Streak stats (gaps-and-islands) computed in the user's timezone ──────
create or replace function public.get_user_stats(uid uuid)
returns table (current_streak int, max_streak int, total_days int)
language sql
stable
security invoker
set search_path = public
as $$
  with tz as (
    select coalesce((select timezone from public.profiles where id = uid), 'UTC') as zone
  ),
  today as (
    select (now() at time zone (select zone from tz))::date as t
  ),
  d as (
    select distinct local_date
    from public.days
    where user_id = uid
      and local_date <= (select t from today)
  ),
  islands as (
    select local_date,
           local_date - (row_number() over (order by local_date))::int as grp
    from d
  ),
  runs as (
    select count(*)::int as len, max(local_date) as mx
    from islands
    group by grp
  )
  select
    coalesce(
      (select len from runs
        where mx = (select t from today) or mx = (select t - 1 from today)
        order by mx desc
        limit 1), 0)                              as current_streak,
    coalesce((select max(len) from runs), 0)      as max_streak,
    (select count(*)::int from d)                 as total_days;
$$;
