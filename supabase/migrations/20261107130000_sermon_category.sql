-- 聖道回顧 has two kinds of sermon: 崇拜錄音 (worship) and 專題講座 (seminar).
-- Existing sermons are all worship recordings, so they default to 'worship'.
alter table sermons
  add column category text not null default 'worship'
  check (category in ('worship', 'seminar'));
