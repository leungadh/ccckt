import { el } from './dom';

// Pulls the 11-character video id out of the common YouTube link shapes:
//   youtube.com/watch?v=ID   youtu.be/ID   youtube.com/live/ID
//   youtube.com/shorts/ID    youtube.com/embed/ID   m.youtube.com/...
// Returns null for anything else (e.g. a channel's /live page, which has no
// fixed video id), so the caller can fall back to a plain link.
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m)\./, '');
  let id: string | null = null;

  if (host === 'youtu.be') {
    id = u.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (u.pathname === '/watch') id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(?:live|shorts|embed)\/([^/?#]+)/);
      if (m) id = m[1];
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

// A 16:9 player box, so visitors watch on our page instead of leaving for YouTube.
// youtube-nocookie.com is YouTube's privacy-enhanced embed (no tracking cookies
// until the visitor presses play).
export function youtubeEmbed(id: string, title: string) {
  const iframe = el('iframe', {
    src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    title,
    loading: 'lazy',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: '',
  });
  return el('div', { class: 'video-embed' }, [iframe]);
}
