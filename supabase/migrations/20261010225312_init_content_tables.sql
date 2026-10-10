-- Content model per design doc: announcements, sermons, events.
-- All three are volunteer-editable via the admin pages (authenticated users),
-- and publicly readable on the static site (anon).

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  event_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text not null,
  sermon_date date not null,
  file_path text, -- path within the sermon-files storage bucket (PDF/PPT)
  recording_url text, -- past YouTube recording, optional
  livestream_url text, -- filled in before service, optional
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table announcements enable row level security;
alter table sermons enable row level security;
alter table events enable row level security;

-- Public site (anon) can read everything; only logged-in volunteers can write.
create policy "Public read access" on announcements for select to anon, authenticated using (true);
create policy "Volunteers can write" on announcements for all to authenticated using (true) with check (true);

create policy "Public read access" on sermons for select to anon, authenticated using (true);
create policy "Volunteers can write" on sermons for all to authenticated using (true) with check (true);

create policy "Public read access" on events for select to anon, authenticated using (true);
create policy "Volunteers can write" on events for all to authenticated using (true) with check (true);

-- Storage bucket for sermon hymn/scripture PDF or PPT uploads.
insert into storage.buckets (id, name, public)
values ('sermon-files', 'sermon-files', true);

create policy "Public read sermon files" on storage.objects for select to anon, authenticated
  using (bucket_id = 'sermon-files');
create policy "Volunteers can upload sermon files" on storage.objects for insert to authenticated
  with check (bucket_id = 'sermon-files');
create policy "Volunteers can update sermon files" on storage.objects for update to authenticated
  using (bucket_id = 'sermon-files');
create policy "Volunteers can delete sermon files" on storage.objects for delete to authenticated
  using (bucket_id = 'sermon-files');
