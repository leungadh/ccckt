// /weekly: one fixed link that always opens this week's 詩歌/經文 file, for the
// newsletter. It runs on Cloudflare (a Pages Function, deployed with the site),
// looks up the current sermon in Supabase and redirects to its file. Nothing is
// overwritten: every week's file stays with its own sermon, and this link just
// follows whichever is current.
//
// Which sermon counts as "this week":
//   1. the next visible 崇拜 sermon with a file, dated today or later (Hong Kong time);
//   2. if none is uploaded yet, the most recent one before today.
// 專題講座 is ignored, so a seminar file never takes over the newsletter link.
//
// /weekly?info=1 returns the chosen sermon as JSON (used by the admin dashboard).

type Env = { PUBLIC_SUPABASE_URL?: string; PUBLIC_SUPABASE_ANON_KEY?: string };
type Context = { request: Request; env: Env };
type Sermon = { title: string; sermon_date: string; file_path: string };

const BUCKET = 'sermon-files';

function todayInHongKong(now = new Date()) {
  // en-CA formats as YYYY-MM-DD, which matches the sermon_date column.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(now);
}

async function findSermon(env: Env, today: string): Promise<Sermon | null> {
  const base = `${env.PUBLIC_SUPABASE_URL}/rest/v1/sermons`;
  const headers = { apikey: env.PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${env.PUBLIC_SUPABASE_ANON_KEY}` };
  const common = 'select=title,sermon_date,file_path&is_published=eq.true&category=eq.worship&file_path=not.is.null&limit=1';

  // Upcoming first (soonest date), then the latest past one.
  for (const query of [
    `${common}&sermon_date=gte.${today}&order=sermon_date.asc,created_at.desc`,
    `${common}&sermon_date=lt.${today}&order=sermon_date.desc,created_at.desc`,
  ]) {
    const res = await fetch(`${base}?${query}`, { headers });
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
    const rows = (await res.json()) as Sermon[];
    if (rows.length) return rows[0];
  }
  return null;
}

function page(title: string, message: string, status: number) {
  const html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${title} · 基督中心堂（九龍塘）</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f1f4f3; color: #1a1f23;
         font-family: "Noto Sans TC", system-ui, -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif; }
  main { max-width: 26rem; margin: 1.5rem; padding: 2rem; background: white; border-radius: 14px; box-shadow: 0 4px 18px rgba(0,0,0,.08); text-align: center; }
  h1 { font-size: 1.25rem; color: #16293a; margin: 0 0 .75rem; }
  p { margin: 0 0 1.25rem; line-height: 1.7; }
  a { display: inline-block; padding: .55rem 1.3rem; border-radius: 999px; background: #0f8080; color: white; text-decoration: none; font-weight: 600; }
</style></head>
<body><main><h1>${title}</h1><p>${message}</p><a href="/sermons">前往聖道回顧</a></main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export async function onRequestGet({ request, env }: Context): Promise<Response> {
  const wantsInfo = new URL(request.url).searchParams.has('info');

  if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
    if (wantsInfo) return Response.json({ error: 'missing-config' }, { status: 500 });
    return page('暫時未能開啟', '網站設定未完成，請聯絡網站管理員。', 500);
  }

  let sermon: Sermon | null;
  try {
    sermon = await findSermon(env, todayInHongKong());
  } catch (err) {
    console.error('weekly: lookup failed', err);
    if (wantsInfo) return Response.json({ error: 'lookup-failed' }, { status: 502 });
    return page('暫時未能開啟', '暫時未能取得本週的詩歌/經文，請稍後再試。', 502);
  }

  if (wantsInfo) {
    return Response.json(sermon ?? { error: 'none' }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (!sermon) {
    return page('本週詩歌/經文尚未上載', '請稍後再試，或到「聖道回顧」查看過往的講道。', 404);
  }

  const fileUrl = `${env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(sermon.file_path)}`;
  // no-store, so browsers and Cloudflare always ask again and pick up next week's file.
  return new Response(null, { status: 302, headers: { Location: fileUrl, 'Cache-Control': 'no-store' } });
}
