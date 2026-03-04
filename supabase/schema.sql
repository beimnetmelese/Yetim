-- Extensions
create extension if not exists "pgcrypto";

-- 1) categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 2) posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  description text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- 3) site_stats
create table if not exists public.site_stats (
  id integer primary key default 1,
  total_visits integer not null default 0,
  constraint site_stats_singleton check (id = 1)
);

insert into public.site_stats (id, total_visits)
values (1, 0)
on conflict (id) do nothing;

-- Additional table for activity stats
create table if not exists public.user_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.site_stats enable row level security;
alter table public.user_activity enable row level security;

-- categories policies
create policy if not exists "Authenticated users can read categories"
on public.categories
for select
to authenticated
using (true);

create policy if not exists "Authenticated users can insert categories"
on public.categories
for insert
to authenticated
with check (true);

create policy if not exists "Authenticated users can update categories"
on public.categories
for update
to authenticated
using (true)
with check (true);

create policy if not exists "Authenticated users can delete categories"
on public.categories
for delete
to authenticated
using (true);

-- posts policies
create policy if not exists "Authenticated users can read posts"
on public.posts
for select
to authenticated
using (true);

create policy if not exists "Users can insert own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "Users can update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "Users can delete own posts"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);

-- site_stats policies
create policy if not exists "Authenticated users can read site stats"
on public.site_stats
for select
to authenticated
using (true);

-- user_activity policies
create policy if not exists "Authenticated users can read user activity"
on public.user_activity
for select
to authenticated
using (true);

create policy if not exists "Users can insert own activity"
on public.user_activity
for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "Users can update own activity"
on public.user_activity
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Function: increment site visits
create or replace function public.increment_site_visits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_total integer;
begin
  update public.site_stats
  set total_visits = total_visits + 1
  where id = 1
  returning total_visits into new_total;

  if new_total is null then
    insert into public.site_stats (id, total_visits)
    values (1, 1)
    on conflict (id)
    do update set total_visits = public.site_stats.total_visits + 1
    returning total_visits into new_total;
  end if;

  return new_total;
end;
$$;

revoke all on function public.increment_site_visits() from public;
grant execute on function public.increment_site_visits() to authenticated;

-- Storage bucket (run in SQL editor)
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Storage policies for posts bucket
create policy if not exists "Public can view post images"
on storage.objects
for select
to public
using (bucket_id = 'posts');

create policy if not exists "Public can upload post images"
on storage.objects
for insert
to public
with check (bucket_id = 'posts');

create policy if not exists "Public can update post images"
on storage.objects
for update
to public
using (bucket_id = 'posts')
with check (bucket_id = 'posts');

create policy if not exists "Public can delete post images"
on storage.objects
for delete
to public
using (bucket_id = 'posts');
