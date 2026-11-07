-- Optional attachment on announcements (公告), shown on the website as a
-- 「下載文件」 button. Files live in their own public bucket, separate from
-- sermon-files.

alter table announcements
  add column file_path text,  -- storage key inside announcement-files (ASCII-safe)
  add column file_name text;  -- original file name, used for display and as the download name

insert into storage.buckets (id, name, public)
values ('announcement-files', 'announcement-files', true);

create policy "Public read announcement files" on storage.objects for select to anon, authenticated
  using (bucket_id = 'announcement-files');
create policy "Volunteers can upload announcement files" on storage.objects for insert to authenticated
  with check (bucket_id = 'announcement-files');
create policy "Volunteers can update announcement files" on storage.objects for update to authenticated
  using (bucket_id = 'announcement-files');
create policy "Volunteers can delete announcement files" on storage.objects for delete to authenticated
  using (bucket_id = 'announcement-files');
