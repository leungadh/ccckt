import { el, text } from './dom';

// Which sermon file the fixed /weekly link points to right now, asked from the
// /weekly function itself so the website and the newsletter link always agree.
// Returns null when it can't tell (e.g. local preview, where /weekly doesn't run).
export async function weeklyFilePath(): Promise<string | null> {
  try {
    const res = await fetch('/weekly?info=1', { cache: 'no-store' });
    if (!res.headers.get('content-type')?.includes('json')) return null;
    const info = await res.json();
    return typeof info?.file_path === 'string' ? info.file_path : null;
  } catch {
    return null;
  }
}

// 「本週連結：https://…/weekly」 shown under this week's sermon download button.
export function weeklyLinkLine() {
  const url = `${window.location.origin}/weekly`;
  return el('p', { class: 'weekly-link' }, [
    el('span', { class: 'weekly-link-label' }, [text('本週連結：')]),
    el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, [text(url)]),
  ]);
}
