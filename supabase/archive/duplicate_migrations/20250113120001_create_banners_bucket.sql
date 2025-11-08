-- Create banners storage bucket
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

-- Set up storage policies for banners bucket
create policy "Users can upload their own banner"
on storage.objects for insert
with check (
  bucket_id = 'banners' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own banner"
on storage.objects for update
using (
  bucket_id = 'banners' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own banner"
on storage.objects for delete
using (
  bucket_id = 'banners' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Banners are publicly accessible"
on storage.objects for select
using (bucket_id = 'banners');
