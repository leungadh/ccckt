-- One home for Sunday worship details: 講道 now carries 時間 and 經文 too,
-- so staff no longer post a separate 主日崇拜 公告. 公告 also gets an optional 時間.
alter table sermons
  add column start_time time,   -- 時間, e.g. 11:00
  add column scripture text;    -- 經文, e.g. 得二：11-12

alter table announcements
  add column start_time time;
