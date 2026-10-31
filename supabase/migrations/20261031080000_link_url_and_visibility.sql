-- 1. Optional "URL 連結" on announcements and events.
-- 2. Show/hide flag on all three content types, toggled from /admin/dashboard.
--    Existing rows default to visible, so nothing disappears when this runs.

alter table announcements
  add column link_url text check (link_url is null or link_url ~* '^https?://'),
  add column is_published boolean not null default true;

alter table events
  add column link_url text check (link_url is null or link_url ~* '^https?://'),
  add column is_published boolean not null default true;

alter table sermons
  add column is_published boolean not null default true;

-- Public visitors (anon) only see visible rows. Logged-in volunteers still see
-- everything, which the admin dashboard needs to list hidden rows. Public pages
-- also filter on is_published themselves, so a volunteer browsing the public
-- site while logged in doesn't see hidden content either.
drop policy "Public read access" on announcements;
drop policy "Public read access" on sermons;
drop policy "Public read access" on events;

create policy "Public read published" on announcements for select to anon using (is_published);
create policy "Public read published" on sermons for select to anon using (is_published);
create policy "Public read published" on events for select to anon using (is_published);

create policy "Volunteers read all" on announcements for select to authenticated using (true);
create policy "Volunteers read all" on sermons for select to authenticated using (true);
create policy "Volunteers read all" on events for select to authenticated using (true);
