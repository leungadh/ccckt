import { el, text } from './dom';
import { formatDate, formatTime, todayInHongKong } from './format';
import { infoList, parseFields } from './structuredText';
import { safeUrl } from './safeUrl';
import { sermonFileUrl } from './sermonFileUrl';
import { youtubeEmbed, youtubeId } from './youtube';
import { SERMON_CATEGORIES, isSermonCategory } from './sermonCategory';
import { weeklyLinkLine } from './weeklyLink';

type Sermon = {
  title: string;
  speaker: string;
  sermon_date: string;
  file_path: string | null;
  recording_url: string | null;
  livestream_url: string | null;
  category?: string | null;
  start_time?: string | null; // 時間
  scripture?: string | null;  // 經文
};

// One sermon card, shared by the homepage ("本週崇拜") and /sermons.
// A YouTube recording plays inline; if there's no recording yet but the
// livestream link is a specific YouTube video, that plays inline instead.
// `isWeekly`: this is the sermon the fixed /weekly link currently opens.
export function renderSermon(item: Sermon, isWeekly = false) {
  const h3 = el('h3', {}, [text(item.title)]);
  // Some migrated sermons hold a whole run of fields in `speaker`
  // ("日期：… 時間：… 講員：… 經文：… 連結：https://…"). Pull 講員 out of it,
  // keep the other fields as their own rows, and drop 日期 (already shown) and URLs.
  const fields = parseFields(item.speaker).filter((f) => f.label !== '日期');
  const speaker = fields.find((f) => f.label === '講員')?.value ?? fields.find((f) => !f.label)?.value ?? '';
  // 時間 and 經文 have their own fields now; older entries may only have them in that run.
  const time = formatTime(item.start_time) || fields.find((f) => f.label === '時間')?.value;
  const scripture = item.scripture?.trim() || fields.find((f) => f.label === '經文')?.value;
  const rows: Array<[string, string]> = [['日期', formatDate(item.sermon_date)]];
  if (time) rows.push(['時間', time]);
  if (speaker) rows.push(['講員', speaker]);
  if (scripture) rows.push(['經文', scripture]);
  const shown = ['講員', '時間', '經文'];
  for (const f of fields) if (f.label && !shown.includes(f.label)) rows.push([f.label, f.value]);

  const category = isSermonCategory(item.category) ? item.category : 'worship';
  const tag = el('span', { class: `sermon-tag sermon-tag-${category}` }, [text(SERMON_CATEGORIES[category].public)]);
  const tags: Node[] = [tag];
  // Not happened yet (dated today or later in Hong Kong).
  if (item.sermon_date >= todayInHongKong()) {
    tags.push(el('span', { class: 'sermon-tag sermon-tag-upcoming' }, [text(item.sermon_date === todayInHongKong() ? '今日' : '即將舉行')]));
  }
  const children: Node[] = [el('div', { class: 'sermon-tags' }, tags), h3, infoList(rows)];

  const recording = safeUrl(item.recording_url);
  const livestream = safeUrl(item.livestream_url);
  const recordingId = youtubeId(recording);
  const embedId = recordingId ?? youtubeId(livestream);
  if (embedId) children.push(youtubeEmbed(embedId, `${item.title}（講道錄影）`));

  const actions = el('div', { class: 'actions' });
  if (livestream) {
    actions.appendChild(el('a', { class: 'btn btn-live', href: livestream, target: '_blank', rel: 'noopener noreferrer' }, [text('📡 觀看直播')]));
  }
  // Only offer an outbound 錄影 link when it couldn't be played on the page.
  if (recording && !recordingId) {
    actions.appendChild(el('a', { class: 'btn btn-secondary', href: recording, target: '_blank', rel: 'noopener noreferrer' }, [text('錄影')]));
  }
  if (item.file_path) {
    actions.appendChild(el('a', { class: 'btn btn-secondary', href: sermonFileUrl(item.file_path), target: '_blank', rel: 'noopener noreferrer' }, [text('下載：詩歌/經文')]));
  }
  if (actions.childNodes.length) children.push(actions);
  if (isWeekly) children.push(weeklyLinkLine());

  return el('div', { class: 'list-item' }, children);
}
