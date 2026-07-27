create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"students":[],"tasks":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

drop policy if exists "Users can read their workspace" on public.workspaces;
create policy "Users can read their workspace" on public.workspaces
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their workspace" on public.workspaces;
create policy "Users can create their workspace" on public.workspaces
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their workspace" on public.workspaces;
create policy "Users can update their workspace" on public.workspaces
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
