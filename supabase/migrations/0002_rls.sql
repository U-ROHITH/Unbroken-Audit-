-- UnbrokenAudit — Phase 2: Row-Level Security (NON-NEGOTIABLE)
-- Without these policies, any authenticated user could read every other user's logs.

alter table public.profiles enable row level security;
alter table public.days     enable row level security;
alter table public.entries  enable row level security;

-- profiles: a user sees and edits only their own row
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- days
drop policy if exists "own days" on public.days;
create policy "own days" on public.days
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- entries
drop policy if exists "own entries" on public.entries;
create policy "own entries" on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
