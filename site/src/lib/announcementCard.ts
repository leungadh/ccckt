import { el, text } from './dom';
import { formatDate } from './format';
import { safeUrl } from './safeUrl';
import { publicFileUrl } from './storage';
import { linkButton } from './linkButton';
import { infoList, parseFields } from './structuredText';

type Announcement = {
  title: string;
  body: string;
  event_date: string;
  link_url?: string | null;
  file_path?: string | null; // attachment in the announcement-files bucket
  file_name?: string | null; // its original name, used as the download name
};

// One announcement card, shared by the homepage ("最新公告") and /announcements.
// 日期 is its own row; labelled fields in the body (時間、講員、經文…) become
// rows under it; a 日期 inside the body and raw URLs are dropped.
export function renderAnnouncement(item: Announcement) {
  const fields = parseFields(item.body).filter((f) => f.label !== '日期');
  const rows: Array<[string, string]> = [['日期', formatDate(item.event_date)]];
  for (const f of fields) if (f.label) rows.push([f.label, f.value]);

  const children: Node[] = [el('h3', {}, [text(item.title)]), infoList(rows)];
  for (const f of fields) if (!f.label) children.push(el('p', { class: 'body-text' }, [text(f.value)]));

  const actions = el('div', { class: 'actions' });
  if (item.file_path) {
    actions.appendChild(
      el('a', {
        class: 'btn btn-secondary',
        href: publicFileUrl('announcement-files', item.file_path, item.file_name),
        target: '_blank',
        rel: 'noopener noreferrer',
      }, [text('📄 附件下載')]),
    );
  }
  const link = safeUrl(item.link_url);
  if (link) {
    actions.appendChild(linkButton(link));
  }
  if (actions.childNodes.length) children.push(actions);
  return el('div', { class: 'list-item' }, children);
}
