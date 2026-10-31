import { el, text } from './dom';
import { formatDate } from './format';
import { safeUrl } from './safeUrl';
import { infoList, parseFields } from './structuredText';

type Announcement = { title: string; body: string; event_date: string; link_url?: string | null };

// One announcement card, shared by the homepage ("最新公告") and /announcements.
// 日期 is its own row; labelled fields in the body (時間、講員、經文…) become
// rows under it; a 日期 inside the body and raw URLs are dropped.
export function renderAnnouncement(item: Announcement) {
  const fields = parseFields(item.body).filter((f) => f.label !== '日期');
  const rows: Array<[string, string]> = [['日期', formatDate(item.event_date)]];
  for (const f of fields) if (f.label) rows.push([f.label, f.value]);

  const children: Node[] = [el('h3', {}, [text(item.title)]), infoList(rows)];
  for (const f of fields) if (!f.label) children.push(el('p', { class: 'body-text' }, [text(f.value)]));

  const link = safeUrl(item.link_url);
  if (link) {
    children.push(
      el('div', { class: 'actions' }, [
        el('a', { class: 'btn btn-secondary', href: link, target: '_blank', rel: 'noopener noreferrer' }, [text('🔗 了解更多')]),
      ]),
    );
  }
  return el('div', { class: 'list-item' }, children);
}
