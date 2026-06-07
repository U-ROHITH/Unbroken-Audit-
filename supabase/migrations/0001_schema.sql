-- UnbrokenAudit — Phase 2: schema, constraints, indexes
-- Run order: 0001_schema -> 0002_rls -> 0003_functions_triggers

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  username        text unique,
  display_name    text,
  timezone        text not null default 'UTC',
  default_window_start text not null default '07:00', -- HH:mm in user's tz
  default_window_minutes int not null default 1440,   -- length of default window
  created_at      timestamptz not null default now()
);

-- ── days ────────────────────────────────────────────────────────────────────
create table if not exists public.days (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  local_date         date not null,
  window_start       timestamptz not null,
  window_end         timestamptz not null,
  title              text,
  summary            text,
  hashtag            text,
  productive_minutes int not null default 0,
  sleep_minutes      int not null default 0,
  other_minutes      int not null default 0,
  -- derived, immutable: length of the window in whole minutes
  window_minutes     int generated always as
                       (floor(extract(epoch from (window_end - window_start)) / 60)::int) stored,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint days_window_order check (window_end > window_start),
  unique (user_id, local_date)
);

create index if not exists days_user_date_idx on public.days (user_id, local_date desc);

-- ── entries ─────────────────────────────────────────────────────────────────
create table if not exists public.entries (
  id               uuid primary key default gen_random_uuid(),
  day_id           uuid not null references public.days (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null check (char_length(trim(name)) between 1 and 120),
  start_at         timestamptz not null,
  end_at           timestamptz not null,
  category         text not null check (category in ('productive', 'sleep', 'other')),
  -- derived & tamper-proof: client cannot lie about duration
  duration_minutes int generated always as
                     (floor(extract(epoch from (end_at - start_at)) / 60)::int) stored,
  position         int not null default 0,
  created_at       timestamptz not null default now(),
  -- half-open interval for overlap exclusion
  period           tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored,
  constraint entries_time_order check (end_at > start_at)
);

create index if not exists entries_day_idx  on public.entries (day_id);
create index if not exists entries_user_idx on public.entries (user_id);

-- 4.2 Overlap prevention — impossible to bypass, even if the client is patched
alter table public.entries
  add constraint entries_no_overlap
  exclude using gist (day_id with =, period with &&);
