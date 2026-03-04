-- Run this once in Supabase SQL Editor to fix post creation RLS errors.

-- Ensure owner is auto-filled from current authenticated user
alter table public.posts
  alter column user_id set default auth.uid();

-- Recreate posts policies in a known-good state
drop policy if exists "Authenticated users can read posts" on public.posts;
drop policy if exists "Users can insert own posts" on public.posts;
drop policy if exists "Users can update own posts" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;

create policy "Authenticated users can read posts"
on public.posts
for select
to authenticated
using (true);

create policy "Users can insert own posts"
on public.posts
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own posts"
on public.posts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own posts"
on public.posts
for delete
to authenticated
using (user_id = auth.uid());

-- Ensure required table privileges are present
grant select, insert, update, delete on table public.posts to authenticated;
