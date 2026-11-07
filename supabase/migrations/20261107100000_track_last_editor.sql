-- Record who last created or changed each post, shown on /admin/dashboard as
-- "最後修改：日期 · 電郵". The database fills these in itself from the logged-in
-- user's session, so the admin pages can't forget or fake them.

alter table announcements add column updated_by text;
alter table sermons add column updated_by text;
alter table events add column updated_by text;

create or replace function public.stamp_last_editor()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  -- auth.jwt() is the logged-in volunteer's token; keep the old value if a
  -- change comes from somewhere without one (e.g. the Supabase dashboard).
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by);
  return new;
end;
$$;

create trigger stamp_last_editor before insert or update on announcements
  for each row execute function public.stamp_last_editor();
create trigger stamp_last_editor before insert or update on sermons
  for each row execute function public.stamp_last_editor();
create trigger stamp_last_editor before insert or update on events
  for each row execute function public.stamp_last_editor();
