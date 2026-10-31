import { el, text } from './dom';

// Content copied over from the old WordPress site often arrives as one long run,
// e.g. "日期：2026年10月4日 時間：上午11時 講員：黃偉略牧師 經文：使徒行傳 經文及詩歌連結：https://…pdf".
// These helpers split that into labelled fields, drop raw URLs (links get their
// own buttons), and let the caller skip fields already shown elsewhere (日期).

// Longest labels first, so "經文及詩歌連結" wins over "經文".
const LABELS = [
  '經文及詩歌連結', '詩歌及經文', '經文及詩歌',
  '聯絡人', '聯絡', '講員', '講題', '講道', '經文', '詩歌', '主席', '司琴', '日期', '時間', '地點', '集合', '費用', '對象', '報名', '連結', '網址',
];
const LABEL_RE = new RegExp(`(${LABELS.join('|')})\\s*[：:]`, 'g');

// http(s)/www links, plus bare "domain.tld/path" links like ccckt.org.hk/wp-content/…
const URL_RE = /(?:https?:\/\/|www\.)[^\s，。；、）)]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\/[^\s，。；、）)]*/gi;

export type Field = { label: string | null; value: string };

export function stripUrls(s: string) {
  return s.replace(URL_RE, '').replace(/[ \t]{2,}/g, ' ').trim();
}

// Splits raw text into fields. Text before the first label (or text with no
// labels at all) comes back as one unlabelled field, line breaks kept.
export function parseFields(raw: string | null | undefined): Field[] {
  if (!raw) return [];
  const matches = [...raw.matchAll(LABEL_RE)];
  const fields: Field[] = [];

  const lead = raw.slice(0, matches[0]?.index ?? raw.length);
  if (stripUrls(lead)) fields.push({ label: null, value: stripUrls(lead) });

  matches.forEach((m, i) => {
    const start = m.index! + m[0].length;
    const end = matches[i + 1]?.index ?? raw.length;
    fields.push({ label: m[1], value: stripUrls(raw.slice(start, end)).replace(/\s*\n\s*/g, ' ') });
  });

  return fields.filter((f) => f.value);
}

// Label/value rows (<dl>). Rows are [label, value].
export function infoList(rows: Array<[string, string]>) {
  return el(
    'dl',
    { class: 'info-list' },
    rows.map(([label, value]) => el('div', {}, [el('dt', {}, [text(label)]), el('dd', {}, [text(value)])])),
  );
}

// Renders a body: labelled fields become info rows, free text stays a paragraph.
// `skip` drops labels already shown on the card (e.g. 日期).
export function renderBody(raw: string | null | undefined, skip: string[] = []): Node[] {
  const fields = parseFields(raw).filter((f) => !f.label || !skip.includes(f.label));
  const nodes: Node[] = [];
  const free = fields.filter((f) => !f.label);
  const labelled = fields.filter((f): f is { label: string; value: string } => !!f.label);

  for (const f of free) nodes.push(el('p', { class: 'body-text' }, [text(f.value)]));
  if (labelled.length) nodes.push(infoList(labelled.map((f) => [f.label, f.value])));
  return nodes;
}
