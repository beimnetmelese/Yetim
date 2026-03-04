-- Run this in Supabase SQL Editor to fix image upload RLS errors for bucket: posts

-- Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id)
do update set public = excluded.public;

-- Remove old/conflicting policies for this bucket (common names)
drop policy if exists "Authenticated users can view post images" on storage.objects;
drop policy if exists "Authenticated users can upload post images" on storage.objects;
drop policy if exists "Authenticated users can update post images" on storage.objects;
drop policy if exists "Authenticated users can delete post images" on storage.objects;
drop policy if exists "Posts bucket public read" on storage.objects;
drop policy if exists "Posts bucket auth insert own folder" on storage.objects;
drop policy if exists "Posts bucket auth update own folder" on storage.objects;
drop policy if exists "Posts bucket auth delete own folder" on storage.objects;

-- Read: public bucket objects can be read by anyone
create policy "Posts bucket public read"
on storage.objects
for select
to public
using (bucket_id = 'posts');

-- Write: allow public/anon uploads to posts bucket
create policy "Posts bucket public insert"
on storage.objects
for insert
to public
with check (bucket_id = 'posts');

create policy "Posts bucket public update"
on storage.objects
for update
to public
using (bucket_id = 'posts')
with check (bucket_id = 'posts');

create policy "Posts bucket public delete"
on storage.objects
for delete
to public
using (bucket_id = 'posts');
